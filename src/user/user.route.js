import express from 'express';
import { validate } from 'express-validation';
import reqValidation from '../config/reqValidation.config.js';
import userController from './user.controller.js';

const router = express.Router();

router.route('/')
  .get(userController.list)
  .post(validate(reqValidation.createUser), userController.create);

router.route('/:userId')
  .get(validate(reqValidation.getUser), userController.get)
  .put(validate(reqValidation.updateUser), userController.update)
  .delete(validate(reqValidation.deleteUser), userController.remove);

export default router;
