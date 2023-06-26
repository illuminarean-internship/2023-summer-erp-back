import express from 'express';
import { validate } from 'express-validation';
import reqValidation from '../config/reqValidation.config.js';
import authController from './auth.controller.js';

const router = express.Router();

router.route('/login')
  .post(validate(reqValidation.login), authController.login);

export default router;
