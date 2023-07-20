import express from 'express';
import { validate } from 'express-validation';
import reqValidation from '../../config/reqValidation.config.js';
import itemController from './item.controller.js';

const router = express.Router();

router.route('/')
  .get(itemController.list)
  .post(validate(reqValidation.createItem), itemController.create);

router.route('/:itemId')
  .get(validate(reqValidation.getItem), itemController.get)
  .put(validate(reqValidation.updateItem), itemController.update)
  .delete(validate(reqValidation.deleteItem), itemController.remove);

export default router;
