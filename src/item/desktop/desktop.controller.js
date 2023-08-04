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
          _id, illumiSerial, CPU, mainboard, memory, SSD, HDD, power, desktopCase,
          purchaseDate, purchasedFrom, isUnreserved, isArchived, purpose, userId,
          log, createAt
        } = item;
        const user = await User.get(userId);
        const location = user.name;
        const history = log.length !== 0 ? parseToObjectList(log) : [];
        // Rearrange the keys, add the new key, and create a new object
        return {
          _id, illumiSerial, purchaseDate, purchasedFrom, isUnreserved, isArchived, purpose,
          location, CPU, mainboard, memory, SSD, HDD, power, desktopCase, userId, history, createAt
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
      _id, illumiSerial, CPU, mainboard, memory, SSD, HDD, power,
      desktopCase, purchaseDate, purchasedFrom, purpose, userId,
      isUnreserved, isArchived, log, createAt 
    } = desktop; // Destructure the original object
    const user = await User.get(userId);
    const location = user.name;
    const history = log.length !== 0 ? parseToObjectList(log) : [];
    // Rearrange the keys, add the new key, and create a new object
    const desktopInfo = {
      _id, illumiSerial, location, purchaseDate, purchasedFrom, purpose, CPU, mainboard, memory, SSD, HDD,
      power, desktopCase, isUnreserved, isArchived, userId, history, createAt
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
      illumiSerial, CPU, mainboard, memory, SSD, HDD, power, desktopCase,
      purchaseDate, purchasedFrom, purpose, location, history
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
      illumiSerial, CPU, mainboard, memory, SSD, HDD, power,
      desktopCase, purchaseDate, purchasedFrom, purpose, userId
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
      illumiSerial, location, CPU, mainboard, memory, SSD, HDD, power, desktopCase,
      purchaseDate, purchasedFrom, history
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
    if (CPU) desktop.CPU = CPU;
    if (mainboard) desktop.mainboard = mainboard;
    if (memory) desktop.memory = memory;
    if (SSD) desktop.SSD = SSD;
    if (HDD) desktop.HDD = HDD;
    if (power) desktop.power = power;
    if (desktopCase) desktop.desktopCase = desktopCase;
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
    const result = await desktop.delete(desktopId);
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
