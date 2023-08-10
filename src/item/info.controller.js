import Info from './info.model.js';

const get = async (req, res, next) => {
  try {
    const infoObj = (await Info.list())[0];
    return res.json(infoObj);
  } catch (err) {
    return next(err);
  }
};

export default {
  get
};
