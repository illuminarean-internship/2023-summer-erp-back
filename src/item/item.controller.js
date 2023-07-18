import httpStatus from 'http-status';
import APIError from '../helpers/apiErrorHelper.js';
import Item from './item.model.js';

const list = async (req, res, next) => {
  try {
    const { limit = 50, skip = 0 } = req.query;
    const items = await Item.list({ limit, skip });
    res.json(items);
  } catch (err) {
    next(err);
  }
};

const get = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const items = await Item.get(itemId);
    if (items) return res.json(items);

    const err = new APIError('No such item exists!', httpStatus.NOT_FOUND);
    return next(err);
  } catch (err) {
    return next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { modelname, SerialNumber } = req.body;
    const item = new Item({ modelname, SerialNumber });
    const savedItem = await item.save();
    return res.json(savedItem);
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { modelname, SerialNumber } = req.body;
    const item = await Item.update(itemId, modelname, SerialNumber);
    return res.json(item);
  } catch (err) {
    return next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const result = await Item.delete(itemId);
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
