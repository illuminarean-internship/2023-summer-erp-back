import httpStatus from 'http-status';
import APIError from '../helpers/apiErrorHelper.js';
import Team from './team.model.js';
import User from './user.model.js';


const list = async (req, res, next) => {
  try {
    const { limit = 50, skip = 0 } = req.query;
    const teams = await Team.list({ limit, skip });
    res.json(teams);
  } catch (err) {
    next(err);
  }
};

const get = async (req, res, next) => {
  try {
    const {teamId} = req.params;
    const team = await Team.get(teamId);
    if (team) return res.json(team);
    const msg = `No such team ${teamId} ${team} exists!`;
    const err = new APIError(msg, httpStatus.NOT_FOUND);
    return next(err);
  } catch (err) {
    return next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { name } = req.body;
    let alreadyHave = await Team.findOne({name: name}).exec();
    if(alreadyHave) return next(new APIError('The team already exists!', httpStatus.NOT_ACCEPTABLE));
    const team = new Team({ name });
    await team.save();

    const user = new User({ name: name, teamName: name });
    const savedUser = await user.save();
    team.connectingId = savedUser._id;
    const savedteam = await team.save();

    return res.json(savedteam);
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const { name } = req.body;
    let alreadyHave = await Team.findOne({name: name}).exec();
    if(alreadyHave) return next(new APIError('The team already exists!', httpStatus.NOT_ACCEPTABLE));
    

    const teamObj = await Team.get(teamId);
    for (let i = teamObj.members.length - 1; i >= 0; i--) {
      await User.update(teamObj.members[i].userId, teamObj.members[i].userName, name);
    }
    await User.update(teamObj.connectingId, name, name);
    const team = await Team.update(teamId, name);
    return res.json(team);
  } catch (err) {
    return next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const team = await Team.get(teamId);
    if(team.members.length!=0) return next(new APIError(`The team has members! ${team.members}\n You should move them to other team!`, httpStatus.NOT_ACCEPTABLE));
    const connectingUser = await User.get(team.connectingId);
    if(connectingUser.numOfAssets!=0) return next(new APIError(`The team has items! ${team.members}\n You should move them to other team or office!`, httpStatus.NOT_ACCEPTABLE));
    await User.delete(team.connectingId);
    const result = await Team.delete(teamId);
    return res.json(result);
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
