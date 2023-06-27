import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import config from '../config/env.js';
import APIError from '../helpers/apiErrorHelper.js';

const user = {
  username: 'username',
  password: 'password'
};

const login = async (req, res, next) => {
  try {
    if (req.body.username === user.username && req.body.password === user.password) {
      const token = jwt.sign({
        username: user.username
      }, config.jwtSecret);
      return res.json({
        token,
        username: user.username
      });
    }

    const err = new APIError('Authentication error', httpStatus.UNAUTHORIZED);
    return next(err);
  } catch (_err) {
    const err = new APIError('Authentication error', httpStatus.UNAUTHORIZED);
    return next(err);
  }
};

export default { login };
