import httpStatus from 'http-status';
import APIError from '../../helpers/apiErrorHelper.js';
import User from '../../user/user.model.js';
import Team from '../../user/team.model.js';
import Mockup from './mockop.model.js';
import Info from '../info.model.js';

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
          _id, model, category, RAM, memory, serialNumber, condition, color, purchasedFrom,
          remarks, isArchived, userId, log, createAt, totalPrice, currency,
          isRepair, issues, replace, request, repairPrice, repairCurrency, repairDetails,
          resellPrice, resellCurrency, karrotPrice, purchaseDate
        } = item;
        const user = await User.get(userId);
        const location = user.name;
        const team = user.teamId ? (await Team.get(user.teamId)).name : '';
        const history = log.length !== 0 ? parseToObjectList(log) : [{
          startDate: (purchaseDate !== undefined) && (purchaseDate !== null) ? purchaseDate.toISOString().split('T')[0]: null,
          endDate: '',
          historyLocation: location,
          historyRemark: ''}];
        // Rearrange the keys, add the new key, and create a new object
        return {
          _id, model, category, team, location, RAM, memory, serialNumber, condition, color, purchaseDate,
          purchasedFrom, remarks, isRepair, isArchived, userId, history, createAt, totalPrice, currency,
          issues, replace, request, repairPrice, repairCurrency, repairDetails, resellPrice, resellCurrency, karrotPrice
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
      _id, model, category, RAM, memory, serialNumber, condition, color, purchasedFrom, purchaseDate,
      remarks, isRepair, isArchived, userId, log, createAt, totalPrice, currency,
      issues, replace, request, repairPrice, repairCurrency, repairDetails, resellPrice, resellCurrency, karrotPrice
    } = mockup; // Destructure the original object
    const user = await User.get(userId);
    const location = user.name;
    const team = user.teamId ? (await Team.get(user.teamId)).name : '';
    const history = log.length !== 0 ? parseToObjectList(log) : [{
      startDate: purchaseDate.toISOString().split('T')[0],
      endDate: '',
      historyLocation: location,
      historyRemark: ''}];
    // Rearrange the keys, add the new key, and create a new object
    const MockupInfo = {
      _id, model, category, team, location, RAM, memory, serialNumber, condition, color,
      purchasedFrom, purchaseDate, remarks, isRepair, isArchived, userId, history, createAt, totalPrice,
      currency, issues, replace, request, repairPrice, repairCurrency, repairDetails, resellPrice, resellCurrency, 
      karrotPrice
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
      model, category, RAM, memory, serialNumber, condition, color, purchasedFrom,
      remarks, history, location, totalPrice, currency,purchaseDate,
      isRepair, issues, replace, request, repairPrice,
      repairCurrency, repairDetails, resellPrice, resellCurrency, karrotPrice
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
      model, category, RAM, memory, serialNumber, condition, color, purchasedFrom,
      remarks, userId, totalPrice, currency, purchaseDate
    });
    const { isArchived } = checkLocation(location);
    mockup.isArchived = isArchived;
    mockup.isRepair = isRepair;
    if (isArchived || isRepair) {
      mockup.issues = issues;
      mockup.replace = replace;
      mockup.repairPrice = repairPrice;
      mockup.repairCurrency = repairCurrency;
      mockup.repairDetails = repairDetails;
      mockup.request = request;
      mockup.resellPrice = resellPrice;
      mockup.resellCurrency = resellCurrency;
      mockup.karrotPrice= karrotPrice;
    }
    if (history) mockup.log = parseToStringList(history);
    const savedMockup = await mockup.save();

    // update item list of user
    userObj.numOfAssets += 1;
    await userObj.save();

    const InfoObj = (await Info.list())[0];
    InfoObj.numOfTestDev += 1;
    await InfoObj.save();

    return res.json(savedMockup);
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { mockupId } = req.params;
    const {
      model, category, RAM, memory, serialNumber, condition, color, purchasedFrom, purchaseDate,
      remarks, history, location, totalPrice, currency, isRepair, issues, replace, request, repairPrice,
      repairCurrency, repairDetails, resellPrice, resellCurrency, karrotPrice
      // isLogged , endDate, startDate, locationRemarks
    } = req.body;

    // Hidden problem!!same user name??? => should be ID
    // validation : mockupId is valid? & location is valid?
    const mockup = await Mockup.get(mockupId);
    if (!mockup) return next(new APIError(`Id ${mockupId} is invalid`, httpStatus.NOT_FOUND));
    const validation = await User.getByName(location);
    if (location && !validation) return next(new APIError(`there is no user named ${location}`, httpStatus.NOT_ACCEPTABLE));

    // if contents changed-> just updated
    if (model !== undefined) mockup.model = model;
    if (category !== undefined) mockup.category = category;
    if (RAM !== undefined) mockup.RAM = RAM;
    if (memory !== undefined) mockup.memory = memory;
    if (serialNumber !== undefined) mockup.serialNumber = serialNumber;
    if (currency !== undefined) mockup.currency = currency;
    if (condition !== undefined) mockup.condition = condition;
    if (color !== undefined) mockup.color = color;
    if (remarks !== undefined) mockup.remarks = remarks;
    if (purchasedFrom !== undefined) mockup.purchasedFrom = purchasedFrom;
    if (totalPrice !== undefined) mockup.totalPrice = totalPrice;
    if (purchaseDate !== undefined) mockup.purchaseDate = purchaseDate;
    // if location changed-> update user schema and logg
    if (location && !validation._id.equals(mockup.userId)) {
      // update user schema
      const { isArchived } = checkLocation(location);
      mockup.isArchived = isArchived;

      const userObj = await User.get(mockup.userId);
      userObj.numOfAssets -= 1;
      await userObj.save();

      const userNewObj = validation; // and then push userObj to new Team
      userNewObj.numOfAssets += 1;
      await userNewObj.save();

      mockup.userId = userNewObj._id;
    }
    if (isRepair !== undefined) { mockup.isRepair = isRepair;}
    if (mockup.isArchived || mockup.isRepair) {
      if (issues !== undefined) mockup.issues = issues;
      if (replace !== undefined) mockup.replace = replace;
      if (repairPrice !== undefined) mockup.repairPrice = repairPrice;
      if (repairCurrency !== undefined) mockup.repairCurrency = repairCurrency;
      if (repairDetails !== undefined) mockup.repairDetails = repairDetails;
      if (request !== undefined) mockup.request = request;
      if (resellPrice !== undefined) mockup.resellPrice = resellPrice;
      if (karrotPrice !== undefined) mockup.karrotPrice = karrotPrice;
      if (resellCurrency !== undefined) mockup.resellCurrency = resellCurrency;  
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

    const InfoObj = (await Info.list())[0];
    InfoObj.numOfTestDev -= 1;
    await InfoObj.save();

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
