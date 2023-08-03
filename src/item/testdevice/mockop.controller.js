import httpStatus from 'http-status';
import APIError from '../../helpers/apiErrorHelper.js';
import User from '../../user/user.model.js';
import Team from '../../user/team.model.js';
import Mockup from './mockop.model.js';
import { parseToObjectList, parseToStringList } from '../history.function.js';
import { checkLocation } from '../sub.function.js';

const list = async (req, res, next) => {
  try {
    const query = req.query;
    const { team, location } = req.query;
    if (team) { delete query.team; }
    if (location) { delete query.location; }
    const mockups = await Mockup.findQuery(query);
    let mockupList = await Promise.all(
      mockups.map(async (item) => {
        const {
          _id, model, category, RAM, SSD, serialNumber, condition, color, purchasedFrom,
          remarks, isUnreserved, isArchived, userId, log, createAt, totalPrice
        } = item;
        const user = await User.get(userId);
        const location = user.name;
        const team = user.teamId ? (await Team.get(user.teamId)).name : '';
        const history = log.length !== 0 ? parseToObjectList(log) : [];
        // Rearrange the keys, add the new key, and create a new object
        return {
          _id, model, category, team, location, RAM, SSD, serialNumber, condition, color,
          purchasedFrom, remarks, isUnreserved, isArchived, userId, history, createAt, totalPrice
        };
      })
    );
    if (team) mockupList = mockupList.filter((item) => item.team === team);
    if (location) mockupList = mockupList.filter((item) => item.name === location);
    res.json(mockupList);
  } catch (err) {
    next(err);
  }
};

const get = async (req, res, next) => {
  try {
    const { mockupId } = req.params;
    const mockup = await Mockup.get(mockupId);
    if (!mockup) { const err = new APIError('No such mockup exists!', httpStatus.NOT_FOUND); return next(err); }
    const {
      _id, model, category, RAM, SSD, serialNumber, condition, color, purchasedFrom,
      remarks, isUnreserved, isArchived, userId, log, createAt, totalPrice
    } = mockup; // Destructure the original object
    const user = await User.get(userId);
    const location = user.name;
    const team = user.teamId ? await Team.get(user.teamId).name : '';
    const history = log.length !== 0 ? parseToObjectList(log) : [];
    // Rearrange the keys, add the new key, and create a new object
    const MockupInfo = {
      _id, model, category, team, location, RAM, SSD, serialNumber, condition, color,
      purchasedFrom, remarks, isUnreserved, isArchived, userId, history, createAt, totalPrice
    };
    return res.json(MockupInfo);
  } catch (err) {
    return next(err);
  }
};

const create = async (req, res, next) => {
  try {
    // Hidden problem!!same user name??? => should be replaced to userId
    const {
      model, category, RAM, SSD, serialNumber, condition, color, purchasedFrom,
      remarks, history, location, totalPrice
    } = req.body;

    // find the team is existing
    const userObj = await User.getByName(location);
    if (!userObj) {
      const errorMessage = `The location ${location} is not existing!`;
      // if not, return error
      return next(new APIError(errorMessage, httpStatus.NOT_ACCEPTABLE));
    }

    // fill mockupschema
    const userId = userObj._id;
    const mockup = new Mockup({
      model, category, RAM, SSD, serialNumber, condition, color, purchasedFrom,
      remarks, userId, totalPrice
    });
    const { isUnreserved, isArchived } = checkLocation(location);
    mockup.isUnreserved = isUnreserved;
    mockup.isArchived = isArchived;
    if (history) mockup.log = parseToStringList(history);
    const savedMockup = await mockup.save();

    // update item list of user
    userObj.numOfAssets += 1;
    await userObj.save();
    return res.json(savedMockup);
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { mockupId } = req.params;
    const {
      model, category, RAM, SSD, serialNumber, condition, color, purchasedFrom,
      remarks, history, location, totalPrice
      // isLogged , endDate, startDate, locationRemarks
    } = req.body;

    // Hidden problem!!same user name??? => should be ID
    // validation : mockupId is valid? & location is valid?
    const mockup = await Mockup.get(mockupId);
    if (!mockup) return next(new APIError(`Id ${mockupId} is invalid`, httpStatus.NOT_FOUND));
    const validation = await User.getByName(location);
    if (location && !validation) return next(new APIError(`there is no user named ${location}`, httpStatus.NOT_ACCEPTABLE));

    // if contents changed-> just updated
    if (model) mockup.model = model;
    if (category) mockup.category = category;
    if (RAM) mockup.RAM = RAM;
    if (SSD) mockup.SSD = SSD;
    if (serialNumber) mockup.serialNumber = serialNumber;
    if (condition) mockup.condition = condition;
    if (color) mockup.color = color;
    if (remarks) mockup.remarks = remarks;
    if (purchasedFrom) mockup.purchasedFrom = purchasedFrom;
    if (totalPrice) mockup.totalPrice = totalPrice;

    // if location changed-> update user schema and logg
    if (location && !validation._id.equals(mockup.userId)) {
      // update user schema
      const { isUnreserved, isArchived } = checkLocation(location);
      mockup.isUnreserved = isUnreserved;
      mockup.isArchived = isArchived;

      const userObj = await User.get(mockup.userId);
      userObj.numOfAssets -= 1;
      await userObj.save();

      const userNewObj = validation; // and then push userObj to new Team
      userNewObj.numOfAssets += 1;
      await userNewObj.save();

      mockup.userId = userNewObj._id;
    }
    if (history) { mockup.log = parseToStringList(history); }
    const mockupsaved = await mockup.save();
    return res.json(mockupsaved);
  } catch (err) {
    return next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { mockupId } = req.params;
    const mockup = await Mockup.get(mockupId);
    if (!mockup) return next(new APIError('No such mockup exists!', httpStatus.NOT_FOUND));
    const userObj = await User.get(mockup.userId);
    userObj.numOfAssets -= 1;
    await userObj.save();
    const result = await Mockup.delete(mockupId);
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
