import httpStatus from 'http-status';
import APIError from '../helpers/apiErrorHelper.js';
import User from './user.model.js';
import Team from './team.model.js';
import Project from './project.model.js';

const check = async (req, res, next) => {
  try {
    const { email } = req.query;
    const user = await User.getByEmail(email);
    const isAdmin = user ? { isAdmin: user.isAdmin } : { isAdmin: false };
    res.json(isAdmin);
  } catch (err) {
    next(err);
  }
};

const updateAdmin = async (req, res, next) => {
  try {
    const { email, isAdmin } = req.body;
    const user = await User.getByEmail(email);
    if (!user) {
      const err = new APIError('No such user exists!', httpStatus.NOT_FOUND);
      return next(err);
    }
    user.isAdmin = isAdmin;
    res.json(user);
  } catch (err) {
    next(err);
  }
};

const adminList = async (req, res, next) => {
  try {
    const users = await User.findByQuery(req.query);
    res.json(users);
  } catch (err) {
    next(err);
  }
};


const list = async (req, res, next) => {
  try {
    const users = await User.list();

    const userlist = await Promise.all(
      users.map(async (item) => {
        const {
          _id, name, teamId, projectIdList, field, numOfAssets, remarks, createAt, isAdmin, email
        } = item; // Destructure the original object
        // team data
        const team = teamId ? (await Team.get(teamId)).name : '';
        // project data
        // let projectStr = '';
        const project = await Promise.all(
          projectIdList.map(async (projectId) => {
            const projectObj = await Project.get(projectId);
            // projectStr = project_str+project.name+"\n";
            return projectObj.name;
          })
        );
        return {
          _id, name, team, teamId, project, field, numOfAssets, remarks, createAt, isAdmin, email
        };
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
    if (!user) {
      const err = new APIError('No such user exists!', httpStatus.NOT_FOUND);
      return next(err);
    }
    const {
      _id, name, teamId, projectIdList, field, numOfAssets, remarks, createAt, isAdmin, email
    } = user; // Destructure the original object
    const team = teamId ? (await Team.get(teamId)).name : '';
    // project data
    // let projectStr = '';
    const project = await Promise.all(
      projectIdList.map(async (projectId) => {
        const projectObj = await Project.get(projectId);
        // projectStr = project_str+project.name+"\n";
        return projectObj.name;
      })
    );
    const userInfo = {
      _id, name, team, teamId, project, field, numOfAssets, remarks, createAt, isAdmin, email
    };
    res.json(userInfo);
  } catch (err) {
    return next(err);
  }
};

const create = async (req, res, next) => {
  try {
    // validation -> if can, change it to as Id
    const {
      name, team, project, field, remarks, email
    } = req.body;
    if (!name || !team) return next(new APIError('U should fill name and team', httpStatus.NOT_ACCEPTABLE));

    // find the team and projects are existing
    const teamObj = await Team.getByName(team);
    if (!teamObj) {
      const errorMessage = `The team ${team} is not existing!`;
      // if not, return error
      return next(new APIError(errorMessage, httpStatus.NOT_ACCEPTABLE));
    }
    const projectIdList = await Promise.all(project.map(async (projectName) => {
      const projObj = await Project.getByName(projectName);
      if (!projObj) {
        const errorMessage = `The projectname ${projectName} is not existing!`;
        throw new APIError(errorMessage, httpStatus.NOT_ACCEPTABLE);
      }
      return projObj._id;
    }));
    // add user
    const user = new User({
      name, teamId: teamObj._id, projectIdList, field, remarks, email
    });
    const savedUser = await user.save();
    // project side update
    projectIdList.map(async (projectId) => {
      const projObj = await Project.get(projectId);
      projObj.numOfMembers += 1;
      await projObj.save();
    });

    // team side update
    teamObj.numOfMembers += 1;
    await teamObj.save();
    return res.json(savedUser);
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const {
      name, team, project, field, remarks, isAdmin, email
    } = req.body;

    // validation : userId is valid? & team name is valid & project name is valid?
    const user = await User.get(userId);
    if (!user) return next(new APIError('No such user exists!', httpStatus.NOT_FOUND));
    const teamNewObj = await Team.getByName(team);
    if (name && name === team) return next(new APIError(`wrong access: ${team} is the team name`, httpStatus.NOT_ACCEPTABLE));
    if (team && !teamNewObj) return next(new APIError(`there is no team named ${team}`, httpStatus.NOT_ACCEPTABLE));
    const projectIdList = await Promise.all(project.map(async (projectName) => {
      const projObj = await Project.getByName(projectName);
      if (!projObj) {
        const errorMessage = `The projectname ${projectName} is not existing!`;
        throw new APIError(errorMessage, httpStatus.NOT_ACCEPTABLE);
      }
      return projObj._id;
    }));

    if (name) user.name = name;
    if (field) user.field = field;
    if (remarks) user.remarks = remarks;
    if (isAdmin) user.isAdmin = isAdmin;
    if (email) user.email = email;
    if (team && teamNewObj._id !== user.teamId) {
      const teamObj = await Team.get(user.teamId);
      teamObj.numOfMembers -= 1;
      await teamObj.save();

      teamNewObj.numOfMembers += 1;
      await teamNewObj.save();
      user.teamId = teamNewObj._id;
    }
    if (project) {
      await Promise.all(user.projectIdList.map(async (projectId) => {
        const projObj = await Project.get(projectId);
        projObj.numOfMembers -= 1;
        await projObj.save();
      }));
      await Promise.all(projectIdList.map(async (projectId) => {
        const projObj = await Project.get(projectId);
        projObj.numOfMembers += 1;
        await projObj.save();
      }));
      user.projectIdList = projectIdList;
    }
    const userSaved = await user.save();
    return res.json(userSaved);
  } catch (err) {
    return next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    // search user and validation
    const { userId } = req.params;
    const user = await User.get(userId);
    if (!user) return next(new APIError(`The userId ${userId} does not exist`, httpStatus.NOT_FOUND));
    if (!user.teamId) return next(new APIError('wrong access: this is for the team. you cannot remove this separately', httpStatus.NOT_ACCEPTABLE));

    // remove user
    if (user.numOfAssets === 0) {
      // team side update
      const teamObj = await Team.get(user.teamId);
      teamObj.numOfMembers -= 1;
      await teamObj.save();
      // proj side update
      user.projectIdList.map(async (projectId) => {
        const projObj = await Project.get(projectId);
        projObj.numOfMembers -= 1;
        await projObj.save();
      });
      // delete user
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
  remove,
  check,
  adminList,
  updateAdmin
};
