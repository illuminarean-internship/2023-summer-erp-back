import express from 'express';
import { validate } from 'express-validation';
import reqValidation from '../config/reqValidation.config.js';
import userController from './user.controller.js';

const router = express.Router();

router.route('/')
  .get(userController.list)
  //.post(validate(reqValidation.createUser), userController.create);
  .post(userController.create);

router.route('/user/:userId')
  .get(userController.get)
  .put(userController.update)
  .delete(userController.remove);

export default router;
