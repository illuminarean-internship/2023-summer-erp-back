import express from 'express';
import AccController from './acc.controller.js';

const router = express.Router();

router.route('/')
  .get(AccController.list)
  .post(AccController.create);

router.route('/item/:accId')
  .get(AccController.get)
  .put(AccController.update)
  .delete(AccController.remove);

export default router;