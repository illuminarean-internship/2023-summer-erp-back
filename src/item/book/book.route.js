import express from 'express';
import bookController from './book.controller.js';

const router = express.Router();

router.route('/')
  .get(bookController.list)
  .post(bookController.create);

router.route('/:bookId')
  .get(bookController.get)
  .put(bookController.update)
  .delete(bookController.remove);

export default router;