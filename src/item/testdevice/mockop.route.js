import express from 'express';
import MockupController from './mockop.controller.js';

const router = express.Router();

router.route('/')
  .get(MockupController.list)
  .post(MockupController.create);

router.route('/item/:mockupId')
  .get(MockupController.get)
  .put(MockupController.update)
  .delete(MockupController.remove);

export default router;