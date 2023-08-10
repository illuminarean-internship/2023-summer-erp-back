import express from 'express';
import bookController from './book.controller.js';

const router = express.Router();

router.route('/')
  .get(bookController.list)
  .post(bookController.create);

router.route('/item/:bookId')
  .get(bookController.get)
  .put(bookController.update)
  .delete(bookController.remove);

router.route('/temp/')
  .post(bookController.createList);

export default router;