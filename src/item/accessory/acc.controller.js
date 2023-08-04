import httpStatus from 'http-status';
import APIError from '../../helpers/apiErrorHelper.js';
import User from '../../user/user.model.js';
import Acc from './acc.model.js';
import { parseToObjectList, parseToStringList } from '../history.function.js';
import { checkLocation } from '../sub.function.js';

const list = async (req, res, next) => {
  try {
    const query = req.query;
    const { location } = req.query;
    if (location) { delete query.location; }
    const accs = await Acc.findQuery(query);
    let accList = await Promise.all(
      accs.map(async (item) => {
        const {
          _id, model, category, illuSerialNumber, serialNumber, color, purchaseDate, purchasedFrom,
          isUnreserved, isArchived, userId, log, createAt, price, surtax, totalPrice
        } = item;
        const user = await User.get(userId);
        const location = user.name;
        const history = log.length !== 0 ? parseToObjectList(log) : [];
        // Rearrange the keys, add the new key, and create a new object
        return {
          _id, model, category, location, illuSerialNumber, serialNumber, color, purchaseDate,
          purchasedFrom, isUnreserved, isArchived, userId, createAt, price, surtax, totalPrice,
          history
        };
      })
    );
    if (location) accList = accList.filter((item) => item.name === location);
    res.json(accList);
  } catch (err) {
    next(err);
  }
};

const get = async (req, res, next) => {
  try {
    const { accId } = req.params;
    const acc = await Acc.get(accId);
    if (!acc) { const err = new APIError('No such acc exists!', httpStatus.NOT_FOUND); return next(err); }
    const {
      _id, model, category, illuSerialNumber, serialNumber, color, purchaseDate, purchasedFrom,
      isUnreserved, isArchived, userId, log, createAt, price, surtax, totalPrice
    } = acc; // Destructure the original object
    const user = await User.get(userId);
    const location = user.name;
    const history = log.length !== 0 ? parseToObjectList(log) : [];
    // Rearrange the keys, add the new key, and create a new object
    const accInfo = {
      _id, model, category, location, illuSerialNumber, serialNumber, color, purchaseDate,
      purchasedFrom, isUnreserved, isArchived, userId, createAt, price, surtax, totalPrice,
      history
    };
    return res.json(accInfo);
  } catch (err) {
    return next(err);
  }
};

const create = async (req, res, next) => {
  try {
    // Hidden problem!!same user name??? => should be replaced to userId
    const {
      model, category, illuSerialNumber, serialNumber, color, purchaseDate, purchasedFrom,
      history, price, surtax, totalPrice, location
    } = req.body;

    // find the team is existing
    const userObj = await User.getByName(location);
    if (!userObj) {
      const errorMessage = `The location ${location} is not existing!`;
      // if not, return error
      return next(new APIError(errorMessage, httpStatus.NOT_ACCEPTABLE));
    }

    // fill accschema
    const userId = userObj._id;
    const acc = new Acc({
      model, category, illuSerialNumber, serialNumber, color, purchaseDate, purchasedFrom,
      history, price, surtax, totalPrice, userId
    });
    const { isUnreserved, isArchived } = checkLocation(location);
    acc.isUnreserved = isUnreserved;
    acc.isArchived = isArchived;
    if (history) acc.log = parseToStringList(history);
    const savedacc = await acc.save();

    // update item list of user
    userObj.numOfAssets += 1;
    await userObj.save();
    return res.json(savedacc);
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { accId } = req.params;
    const {
      model, category, illuSerialNumber, serialNumber, color, purchaseDate, purchasedFrom,
      history, price, surtax, totalPrice, location
      // isLogged , endDate, startDate, locationRemarks
    } = req.body;

    // Hidden problem!!same user name??? => should be ID
    // validation : accId is valid? & location is valid?
    const acc = await Acc.get(accId);
    if (!acc) return next(new APIError(`Id ${accId} is invalid`, httpStatus.NOT_FOUND));
    const validation = await User.getByName(location);
    if (location && !validation) return next(new APIError(`there is no user named ${location}`, httpStatus.NOT_ACCEPTABLE));

    // if contents changed-> just updated
    if (model) acc.model = model;
    if (category) acc.category = category;
    if (illuSerialNumber) acc.illuSerialNumber = illuSerialNumber;
    if (purchaseDate) acc.purchaseDate = purchaseDate;
    if (serialNumber) acc.serialNumber = serialNumber;
    if (price) acc.price = price;
    if (color) acc.color = color;
    if (surtax) acc.surtax = surtax;
    if (purchasedFrom) acc.purchasedFrom = purchasedFrom;
    if (totalPrice) acc.totalPrice = totalPrice;

    // if location changed-> update user schema and logg
    if (location && !validation._id.equals(acc.userId)) {
      // update user schema
      const { isUnreserved, isArchived } = checkLocation(location);
      acc.isUnreserved = isUnreserved;
      acc.isArchived = isArchived;

      const userObj = await User.get(acc.userId);
      userObj.numOfAssets -= 1;
      await userObj.save();

      const userNewObj = validation; // and then push userObj to new Team
      userNewObj.numOfAssets += 1;
      await userNewObj.save();

      acc.userId = userNewObj._id;
    }
    if (history) { acc.log = parseToStringList(history); }
    const accsaved = await acc.save();
    return res.json(accsaved);
  } catch (err) {
    return next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { accId } = req.params;
    const acc = await Acc.get(accId);
    if (!acc) return next(new APIError('No such acc exists!', httpStatus.NOT_FOUND));
    const userObj = await User.get(acc.userId);
    userObj.numOfAssets -= 1;
    await userObj.save();
    const result = await Acc.delete(accId);
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
