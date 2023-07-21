import express from 'express';
import { validate } from 'express-validation';
import reqValidation from '../config/reqValidation.config.js';
import teamController from './team.controller.js';

const router = express.Router();

router.route('/')
  .get(teamController.list)
  .post(teamController.create);

router.route('/:teamId')
  .get(teamController.get)
  .put(teamController.update)
  .delete(teamController.remove);

export default router;
