import httpStatus from 'http-status';
import APIError from '../helpers/apiErrorHelper.js';
import User from './user.model.js';
import Team from './team.model.js';
import Project from './project.model.js';

const list = async (req, res, next) => {
  try {
    const { limit = 50, skip = 0 } = req.query;
    const users = await User.list({ limit, skip });

    const userlist = await Promise.all(
      users.map(async (item) => {
        const { _id, name, teamId, projectIdList, field, numOfAssets, createAt } = item; // Destructure the original object
        //team data
        let teamName = "";
        if(teamId){
        const team = await Team.get(teamId);
        teamName = team.name;
        }
        //project data
        let project_str = ""
        const project = await Promise.all(
          projectIdList.map( async(item) =>{
            const project = await Project.get(item);
            project_str = project_str+project.name+"\n";
            return project.name;
          })
        );
        return { _id, name, teamName, teamId, project_str,project, field, numOfAssets, createAt};
      })
    );
    res.json(userlist);
  } catch (err) {
    next(err);
  }
};

const get = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.get(userId);
    if (user) return res.json(user);
    const err = new APIError('No such user exists!', httpStatus.NOT_FOUND);
    return next(err);
  } catch (err) {
    return next(err);
  }
};

const create = async (req, res, next) => {
  try {

    //validation -> if can, change it to as Id
    const { name, teamName, project, field } = req.body;
    if(name===teamName) return next(new APIError(`wrong access: ${teamName} is the team name`, httpStatus.NOT_ACCEPTABLE));
    if(!name||!teamName) return next(new APIError(`U should fill name and teamName`, httpStatus.NOT_ACCEPTABLE));

    //find the team and projects are existing
    const teamObj = await Team.getByName(teamName);
    if (!teamObj) {
      const errorMessage = `The teamname ${teamName} is not existing!`;
      //if not, return error
      return next(new APIError(errorMessage, httpStatus.NOT_ACCEPTABLE));
    }
    const projectIdList = new Array();
    for (let i = 0; i < project.length; i++){
      let projObj = await Project.getByName(project[i]);
      if (!projObj) {
        const errorMessage = `The projectname ${project[i]} is not existing!`;
        //if not, return error
        return next(new APIError(errorMessage, httpStatus.NOT_ACCEPTABLE));
      }
      else{
        projectIdList.push(projObj._id);
      }
    }

    //add user
    const user = new User({ name: name, teamId: teamObj._id, projectIdList: projectIdList, field: field });
    const savedUser = await user.save();
    // project side update
    for (let i = 0; i < projectIdList.length; i++){
      let projObj = await Project.get(projectIdList[i])
      projObj.numOfMembers =projObj.numOfMembers+1;
      await projObj.save();
    }
    // team side update
    teamObj.numOfMembers = teamObj.numOfMembers+1;
    await teamObj.save();
    return res.json(savedUser);
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { name, teamName, project, field } = req.body;

    //validation : userId is valid? & team name is valid & project name is valid?
    const user = await User.get(userId);
    if(!user) return next(new APIError('No such user exists!', httpStatus.NOT_FOUND));
    const new_teamObj = await Team.getByName(teamName);
    if(name&&name==teamName) return next(new APIError(`wrong access: ${teamName} is the team name`, httpStatus.NOT_ACCEPTABLE));
    if(teamName&&!new_teamObj) return next(new APIError(`there is no team named ${teamName}`, httpStatus.NOT_ACCEPTABLE));
    const projectIdList = new Array();
    if(project){for (let i = 0; i < project.length; i++){
      let projObj = await Project.getByName(name);
      if (!projObj) {
        const errorMessage = `The projectname ${project[i]} is not existing!`;
        return next(new APIError(errorMessage, httpStatus.NOT_ACCEPTABLE));
      }
      else{  projectIdList.push(projObj._id);}
    }}
    
    if(name) user.name =name;
    if(field) user.field = field;
    if(teamName){
      const teamObj = await Team.get(user.teamId);
      teamObj.numOfMembers = teamObj.numOfMembers-1;
      await teamObj.save();

      new_teamObj.numOfMembers = new_teamObj.numOfMembers+1;
      await new_teamObj.save();
      user.teamId=new_teamObj._id;
    }
    if(project){
      for (let i = 0; i < user.projectIdList.length; i++){
        let projObj = await Project.get(user.projectIdList[i])
        projObj.numOfMembers =projObj.numOfMembers-1;
        await projObj.save();
      }
      for (let i = 0; i < projectIdList.length; i++){
        let projObj = await Project.get(projectIdList[i])
        projObj.numOfMembers =projObj.numOfMembers+1;
        await projObj.save();
      }
      user.projectIdList= projectIdList;
    }
    const userSaved = await user.save();
    return res.json(userSaved);
  } catch (err) {
    return next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    //search user and validation
    const { userId } = req.params;
    const user = await User.get(userId);
    if(!user) return next(new APIError(`The userId ${userId} does not exist`, httpStatus.NOT_FOUND));
    if(!user.teamId) return next(new APIError(`wrong access: this is for the team. you cannot remove this separately`, httpStatus.NOT_ACCEPTABLE));
    
    //remove user
    if(user.numOfAssets==0){
      //team side update
      const teamObj = await Team.get(user.teamId);
      teamObj.numOfMembers = teamObj.numOfMembers-1;
      await teamObj.save();
      //proj side update
      for (const projectId of user.projectIdList) {
        let projObj = await Project.get(projectId);
        projObj.numOfMembers = projObj.numOfMembers - 1;
        await projObj.save();
      }
      //delete user
      const result = await User.delete(userId);
      return res.json(result);
    }
    const err = new APIError('No such user exists! or The user has some items now! please check the user id and the items the user has', httpStatus.NOT_FOUND);
    return next(err);
  } catch (err) {
    return next(err);
  }
};

export default {
  list,
  get,
  create,
  update,
  remove
};
