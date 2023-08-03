import express from 'express';
import desktopController from './desktop.controller.js';

const router = express.Router();

router.route('/')
  .get(desktopController.list)
  .post(desktopController.create);

router.route('/item/:desktopId')
  .get(desktopController.get)
  .put(desktopController.update)
  .delete(desktopController.remove);

export default router;