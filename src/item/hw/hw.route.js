import express from 'express';
import hwController from './hw.controller.js';

const router = express.Router();

router.route('/')
  .get(hwController.list)
  .post(hwController.create);

router.route('/:bookId')
  .get(hwController.get)
  .put(hwController.update)
  .delete(hwController.remove);

export default router;