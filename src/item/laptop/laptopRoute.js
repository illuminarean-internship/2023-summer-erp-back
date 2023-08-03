import express from 'express';laptopController
import laptopController from './laptopController.js';

const router = express.Router();

router.route('/')
  .get(laptopController.list)
  .post(laptopController.create);

router.route('/:bookId')
  .get(laptopController.get)
  .put(laptopController.update)
  .delete(laptopController.remove);

export default router;