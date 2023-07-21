import httpStatus from 'http-status';
import APIError from '../helpers/apiErrorHelper.js';
import User from './user.model.js';
import Team from './team.model.js';

const list = async (req, res, next) => {
  try {
    const { limit = 50, skip = 0 } = req.query;
    const users = await User.list({ limit, skip });
    res.json(users);
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
    const { name, teamName } = req.body;
    if(!name||!teamName) return next(new APIError(`U should fill name and teamName`, httpStatus.NOT_ACCEPTABLE));

    //find the team is existing
    const teamObj = await Team.findOne({name: teamName}).exec();
    if (!teamObj) {
      const errorMessage = `The teamname ${teamName} is not existing!`;
      //if not, return error
      return next(new APIError(errorMessage, httpStatus.NOT_ACCEPTABLE));
    }
    const user = new User({ name: name, teamName: teamName });
    const savedUser = await user.save();
    const newMember = {userName : name, userId : savedUser._id};
    teamObj.members.push(newMember);
    await teamObj.save();
    return res.json(savedUser);
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { name, teamName } = req.body;
  

    //validation : userId is valid? & team name is valid?
    const user = await User.get(userId);
    const validation = await Team.findOne({name: teamName}).exec();
    if(!name||!teamName) return next(new APIError(`U should fill name and teamName`, httpStatus.NOT_ACCEPTABLE));
    if(!validation) return next(new APIError(`there is no team named ${teamName}`, httpStatus.NOT_ACCEPTABLE));
  
    //To update teamschema info
    const teamObj = await Team.findOne({name: user.teamName}).exec();

    //search user object in original team schema
    for (let i = teamObj.members.length - 1; i >= 0; i--) {
      if (teamObj.members[i].userId.toString() === userId ) {
        if(teamName&&teamName != user.teamName){ //when team is changed -> delete userObj
          teamObj.members.splice(i, 1);
          await teamObj.save();
          
          const new_teamObj = validation; // and then push userObj to new Team
          new_teamObj.members.push({userName : name, userId : userId});
          await new_teamObj.save();
        }
        else{
          // when team is not changed -> just update the name
          teamObj.members[i].userName=name;
          await teamObj.save();
          break;
        }
      }}
      const userSaved = await User.update(userId, name, teamName);
      return res.json(userSaved);
  } catch (err) {
    return next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.get(userId);
    if(user && user.numOfAssets==0){
      const teamObj = await Team.findOne({name: user.teamName}).exec();
      for (let i = teamObj.members.length - 1; i >= 0; i--) {

      if (teamObj.members[i].userId.toString() === userId ) {
        teamObj.members.splice(i, 1);
        await teamObj.save();
        break;
      }} 
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
