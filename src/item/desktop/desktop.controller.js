import httpStatus from 'http-status';
import APIError from '../../helpers/apiErrorHelper.js';
import User from '../../user/user.model.js';
import Desktop from './desktop.model.js';
import Info from '../info.model.js';

import { parseToObjectList, parseToStringList } from '../history.function.js';
import { checkLocation } from '../sub.function.js';

const list = async (req, res, next) => {
  try {
    const query = req.query;
    const { location } = req.query;
    if (location) { delete query.location; }
    const desktops = await Desktop.findQuery(query);
    let desktopList = await Promise.all(
      desktops.map(async (item) => {
        const {
          _id, illumiSerial, purchaseDate, purchasedFrom, isArchived, purpose,
          details, userId, log, createAt, totalPrice, remarks,
          isRepair, issues, replace, request, repairPrice, repairCurrency,
          repairDetails, resellPrice, resellCurrency, karrotPrice
        } = item;
        const user = await User.get(userId);
        const location = user.name;
        const history = log.length !== 0 ? parseToObjectList(log) : [{
          startDate: purchaseDate.toISOString().split('T')[0],
          endDate: '',
          historyLocation: location,
          historyRemark: ''}];
        // Rearrange the keys, add the new key, and create a new object
        return {
          _id, illumiSerial, purchaseDate, purchasedFrom, isArchived, purpose,
          location, details, userId, history, createAt, totalPrice, remarks,
          isRepair, issues, replace, request, repairPrice, repairCurrency,
          repairDetails, resellPrice, resellCurrency, karrotPrice
        };
      })
    );
    if (location) desktopList = desktopList.filter((item) => item.name === location);
    res.json(desktopList);
  } catch (err) {
    next(err);
  }
};

const get = async (req, res, next) => {
  try {
    const { desktopId } = req.params;
    const desktop = await Desktop.get(desktopId);
    if (!desktop) { const err = new APIError('No such desktop exists!', httpStatus.NOT_FOUND); return next(err); }
    const {
      _id, illumiSerial, purchaseDate, purchasedFrom, isUnreserved, isArchived, purpose,
      details, userId, log, createAt, totalPrice, remarks, isRepair, issues, replace, request, repairPrice,
      repairCurrency, repairDetails, resellPrice, resellCurrency, karrotPrice
    } = desktop; // Destructure the original object
    const user = await User.get(userId);
    const location = user.name;
    const history = log.length !== 0 ? parseToObjectList(log) : [{
      startDate: purchaseDate.toISOString().split('T')[0],
      endDate: '',
      historyLocation: location,
      historyRemark: ''}];
    // Rearrange the keys, add the new key, and create a new object
    const desktopInfo = {
      _id, illumiSerial, purchaseDate, purchasedFrom, isUnreserved, isArchived, purpose,
      location, details, userId, history, createAt, totalPrice, remarks,
      isRepair, issues, replace, request, repairPrice, repairCurrency, repairDetails, resellPrice, resellCurrency, karrotPrice
    };
    return res.json(desktopInfo);
  } catch (err) {
    return next(err);
  }
};

const create = async (req, res, next) => {
  try {
    // Hidden problem!!same user name??? => should be replaced to userId
    const {
      illumiSerial, purchaseDate, purchasedFrom, purpose, location, details, history, remarks, totalPrice,
      isRepair, issues, replace, request, repairPrice, repairCurrency, repairDetails, resellPrice, resellCurrency, karrotPrice
    } = req.body;

    // find the team is existing
    const userObj = await User.getByName(location);
    if (!userObj) {
      const errorMessage = `The location ${location} is not existing!`;
      // if not, return error
      return next(new APIError(errorMessage, httpStatus.NOT_ACCEPTABLE));
    }
    // fill desktopschema
    const userId = userObj._id;
    const desktop = new Desktop({
      illumiSerial, purchaseDate, purchasedFrom, purpose, details, userId, totalPrice, remarks
    });
    const { isArchived } = checkLocation(location);
    desktop.isArchived = isArchived;
    desktop.isRepair = isRepair;
    if (isArchived || isRepair) {
      desktop.issues = issues;
      desktop.replace = replace;
      desktop.repairPrice = repairPrice;
      desktop.repairCurrency = repairCurrency;
      desktop.repairDetails = repairDetails;
      desktop.request = request;
      desktop.resellPrice = resellPrice;
      desktop.karrotPrice = karrotPrice;
      desktop.resellCurrency = resellCurrency;
    }
    if (history) desktop.log = parseToStringList(history);
    const savedDesktop = await desktop.save();

    // update item list of user
    userObj.numOfAssets += 1;
    await userObj.save();

    const InfoObj = (await Info.list())[0];
    InfoObj.numOfDesktop += 1;
    await InfoObj.save();

    return res.json(savedDesktop);
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { desktopId } = req.params;
    const {
      illumiSerial, location, purpose, purchaseDate, purchasedFrom, history, details, remarks, totalPrice,
      isRepair, issues, replace, request, repairPrice, repairCurrency, repairDetails, resellPrice, resellCurrency, karrotPrice
      // isLogged , endDate, startDate, locationRemarks
    } = req.body;

    // Hidden problem!!same user name??? => should be ID
    // validation : desktopId is valid? & location is valid?
    const desktop = await Desktop.get(desktopId);
    if (!desktop) return next(new APIError(`Id ${desktopId} is invalid`, httpStatus.NOT_FOUND));
    const validation = await User.getByName(location);
    if (location && !validation) return next(new APIError(`there is no user named ${location}`, httpStatus.NOT_ACCEPTABLE));

    // if contents changed-> just updated
    if (illumiSerial !== undefined) desktop.illumiSerial = illumiSerial;
    if (purpose !== undefined) desktop.purpose = purpose;
    if (totalPrice !== undefined) desktop.totalPrice = totalPrice;
    if (remarks !== undefined) desktop.remarks = remarks;
    if (details !== undefined) {
      desktop.details = details;
    }
    if (purchaseDate !== undefined) desktop.purchasedDate = purchaseDate; 
    if (purchasedFrom !== undefined) desktop.purchaseFrom = purchasedFrom;

    // if location changed-> update user schema and logg
    if (location && !validation._id.equals(desktop.userId)) {
      // update user schema
      const { isArchived } = checkLocation(location);
      desktop.isArchived = isArchived;
      if (isRepair !== undefined) desktop.isRepair = isRepair;
      if (isArchived || desktop.isRepair) {
        if (issues !== undefined) desktop.issues = issues;
        if (replace !== undefined) desktop.replace = replace;
        if (repairPrice !== undefined) desktop.repairPrice = repairPrice;
        if (repairCurrency !== undefined) desktop.repairCurrency = repairCurrency;
        if (repairDetails !== undefined) desktop.repairDetails = repairDetails;
        if (request !== undefined) desktop.request = request;
        if (resellPrice !== undefined) desktop.resellPrice = resellPrice;
        if (karrotPrice !== undefined) desktop.karrotPrice = karrotPrice;
        if (resellCurrency !== undefined) desktop.resellCurrency = resellCurrency;
      }

      const userObj = await User.get(desktop.userId);
      userObj.numOfAssets -= 1;
      await userObj.save();

      const userNewObj = validation; // and then push userObj to new Team
      userNewObj.numOfAssets += 1;
      await userNewObj.save();

      desktop.userId = userNewObj._id;
    }
    if (history) { desktop.log = parseToStringList(history); }
    const desktopSaved = await desktop.save();
    return res.json(desktopSaved);
  } catch (err) {
    return next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { desktopId } = req.params;
    const desktop = await Desktop.get(desktopId);
    if (!desktop) return next(new APIError('No such desktop exists!', httpStatus.NOT_FOUND));
    const userObj = await User.get(desktop.userId);
    userObj.numOfAssets -= 1;
    await userObj.save();

    const InfoObj = (await Info.list())[0];
    InfoObj.numOfDesktop -= 1;
    await InfoObj.save();

    const result = await Desktop.delete(desktopId);
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
