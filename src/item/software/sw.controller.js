import httpStatus from 'http-status';
import APIError from '../../helpers/apiErrorHelper.js';
import User from '../../user/user.model.js';
import SW from './sw.model.js';
import { parseToObjectList, parseToStringList } from '../history.function.js';
import { checkLocation } from '../sub.function.js';

const list = async (req, res, next) => {
  try {
    const query = req.query;
    const { user } = req.query;
    if (user) {
      delete query.user;
      const userObj = await User.getByName(user);
      if (!userObj) { res.json([]); }
      query.userId = userObj._id;
    }

    const sws = await SW.findQuery(query);
    const swList = await Promise.all(
      sws.map(async (item) => {
        const {
          _id, name, purchaseDate, unitPrice, quantity, totalPrice,
          reference, currency, isUnreserved, isArchived, userId, log, createAt
        } = item; // Destructure the original object
        const user = await User.get(userId).name;
        const history = log.length !== 0 ? parseToObjectList(log) : [{
          startDate: purchaseDate.toISOString().split('T')[0],
          endDate: '',
          historyLocation: location,
          historyRemark: ''}];
        // Rearrange the keys, add the new key, and create a new object
        return {
          _id, name, purchaseDate, unitPrice, quantity,
          totalPrice, currency, reference, user, isUnreserved, isArchived, userId, history, createAt
        };
      })
    );
    res.json(swList);
  } catch (err) {
    next(err);
  }
};

const get = async (req, res, next) => {
  try {
    const { swId } = req.params;
    const sw = await SW.get(swId);
    if (!sw) { const err = new APIError('No such sw exists!', httpStatus.NOT_FOUND); return next(err); }
    const {
      _id, name, purchaseDate, unitPrice, quantity, reference, totalPrice,
      currency, isUnreserved, isArchived, userId, log, createAt
    } = sw; // Destructure the original object
    const user = await User.get(userId).name;
    const history = log.length !== 0 ? parseToObjectList(log) : [{
      startDate: purchaseDate.toISOString().split('T')[0],
      endDate: '',
      historyLocation: location,
      historyRemark: ''}];
    // const totalPrice = quantity * unitPrice;
    // Rearrange the keys, add the new key, and create a new object
    const swInfo = {
      _id, name, purchaseDate, unitPrice, quantity, totalPrice, currency, reference,
      user, isUnreserved, isArchived, userId, history, createAt
    };
    return res.json(swInfo);
  } catch (err) {
    return next(err);
  }
};

const create = async (req, res, next) => {
  try {
    // Hidden problem!!same user name??? => should be replaced to userId
    const {
      name, purchaseDate, unitPrice, quantity, currency, reference, user, history, totalPrice
    } = req.body;

    // find the team is existing
    const userObj = await User.getByName(user);
    if (!userObj) {
      const errorMessage = `The location ${user} is not existing!`;
      // if not, return error
      return next(new APIError(errorMessage, httpStatus.NOT_ACCEPTABLE));
    }

    // fill swschema
    const userId = userObj._id;
    const sw = new SW({
      name, purchaseDate, unitPrice, totalPrice, quantity, currency, reference, userId
    });
    const { isUnreserved, isArchived } = checkLocation(user);
    sw.isUnreserved = isUnreserved;
    sw.isArchived = isArchived;
    if (history) sw.log = parseToStringList(history);
    const savedSw = await sw.save();

    // update item list of user
    userObj.numOfAssets += 1;
    await userObj.save();
    return res.json(savedSw);
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { swId } = req.params;
    const {
      name, purchaseDate, unitPrice, quantity, totalPrice, currency, reference, user, history,
      // isLogged , endDate, startDate, locationRemarks
    } = req.body;

    // Hidden problem!!same user name??? => should be ID
    // validation : itemId is valid? & location is valid?
    const sw = await SW.get(swId);
    if (!sw) return next(new APIError(`Id ${swId} is invalid`, httpStatus.NOT_FOUND));
    const validation = await User.getByName(user);
    if (user && !validation) return next(new APIError(`there is no user named ${user}`, httpStatus.NOT_ACCEPTABLE));

    // if contents changed-> just updated
    if (name) sw.name = name;
    if (purchaseDate) sw.purchaseDate = purchaseDate;
    if (unitPrice) sw.unitPrice = unitPrice;
    if (quantity) sw.quantity = quantity;
    if (totalPrice) sw.totalPrice = totalPrice;
    if (reference) sw.remarks = reference;
    if (currency) sw.currency = currency;

    // if location changed-> update user schema and logg
    if (user && !validation._id.equals(sw.userId)) {
      // update user schema
      const { isUnreserved, isArchived } = checkLocation(user);
      sw.isUnreserved = isUnreserved;
      sw.isArchived = isArchived;

      const userObj = await User.get(sw.userId);
      userObj.numOfAssets -= 1;
      await userObj.save();

      const userNewObj = validation; // and then push userObj to new Team
      userNewObj.numOfAssets += 1;
      await userNewObj.save();

      sw.userId = userNewObj._id;
    }
    if (history) { sw.log = parseToStringList(history); }
    const swSaved = await sw.save();
    return res.json(swSaved);
  } catch (err) {
    return next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { swId } = req.params;
    const sw = await SW.get(swId);
    if (!sw) return next(new APIError('No such sw exists!', httpStatus.NOT_FOUND));
    const userObj = await User.get(sw.userId);
    userObj.numOfAssets -= 1;
    await userObj.save();
    const result = await SW.delete(swId);
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
