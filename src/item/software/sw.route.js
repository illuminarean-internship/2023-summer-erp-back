import express from 'express';
import swController from './sw.controller.js';

const router = express.Router();

router.route('/')
  .get(swController.list)
  .post(swController.create);

router.route('/item/:swId')
  .get(swController.get)
  .put(swController.update)
  .delete(swController.remove);

export default router;