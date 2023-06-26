import httpStatus from 'http-status';
import APIError from '../helpers/apiErrorHelper.js';
import User from './user.model.js';

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
    const { username, mobileNumber } = req.body;
    const user = new User({ username, mobileNumber });
    const savedUser = await user.save();
    return res.json(savedUser);
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { username, mobileNumber } = req.body;
    const user = await User.update(userId, username, mobileNumber);
    return res.json(user);
  } catch (err) {
    return next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const result = await User.delete(userId);
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
