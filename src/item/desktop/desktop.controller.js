import httpStatus from 'http-status';
import APIError from '../../helpers/apiErrorHelper.js';
import User from '../../user/user.model.js';
import Desktop from './desktop.model.js';
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
          _id, illumiSerial, purchaseDate, purchasedFrom, isUnreserved, isArchived, purpose,
          details, userId, log, createAt, totalPrice
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
          _id, illumiSerial, purchaseDate, purchasedFrom, isUnreserved, isArchived, purpose,
          location, details, userId, history, createAt, totalPrice
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
      details, userId, log, createAt, totalPrice
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
      location, details, userId, history, createAt, totalPrice
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
      illumiSerial, purchaseDate, purchasedFrom, purpose, location, details, history
    } = req.body;

    // find the team is existing
    const userObj = await User.getByName(location);
    if (!userObj) {
      const errorMessage = `The location ${location} is not existing!`;
      // if not, return error
      return next(new APIError(errorMessage, httpStatus.NOT_ACCEPTABLE));
    }
    let totalPrice = 0;
    for (const detail of details) {
      totalPrice += parseFloat(detail.price);
    }
    // fill desktopschema
    const userId = userObj._id;
    const desktop = new Desktop({
      illumiSerial, purchaseDate, purchasedFrom, purpose, details, userId, totalPrice
    });
    const { isUnreserved, isArchived } = checkLocation(location);
    desktop.isUnreserved = isUnreserved;
    desktop.isArchived = isArchived;
    if (history) desktop.log = parseToStringList(history);
    const savedDesktop = await desktop.save();

    // update item list of user
    userObj.numOfAssets += 1;
    await userObj.save();
    return res.json(savedDesktop);
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { desktopId } = req.params;
    const {
      illumiSerial, location, purpose, purchaseDate, purchasedFrom, history, details
      // isLogged , endDate, startDate, locationRemarks
    } = req.body;

    // Hidden problem!!same user name??? => should be ID
    // validation : desktopId is valid? & location is valid?
    const desktop = await Desktop.get(desktopId);
    if (!desktop) return next(new APIError(`Id ${desktopId} is invalid`, httpStatus.NOT_FOUND));
    const validation = await User.getByName(location);
    if (location && !validation) return next(new APIError(`there is no user named ${location}`, httpStatus.NOT_ACCEPTABLE));

    // if contents changed-> just updated
    if (illumiSerial) desktop.illumiSerial = illumiSerial;
    if (purpose) desktop.purpose = purpose;
    if (details) {
      desktop.details = details;
      let totalPrice = 0;
      for (const detail of details) {
        totalPrice += parseFloat(detail.price);
      }
      desktop.totalPrice = totalPrice
    }
    if (purchaseDate) desktop.purchasedDate = purchaseDate; 
    if (purchasedFrom) desktop.purchaseFrom = purchasedFrom;

    // if location changed-> update user schema and logg
    if (location && !validation._id.equals(desktop.userId)) {
      // update user schema
      const { isUnreserved, isArchived } = checkLocation(location);
      desktop.isUnreserved = isUnreserved;
      desktop.isArchived = isArchived;

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
