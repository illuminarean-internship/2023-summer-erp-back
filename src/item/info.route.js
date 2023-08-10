import express from 'express';
import infoController from './info.controller.js';

const router = express.Router();

router.route('/')
  .get(infoController.get);

export default router;