import express from 'express';
import projectController from './project.controller.js';

const router = express.Router();

router.route('/')
  .get(projectController.list)
  .post(projectController.create);

router.route('/:projectId')
  .get(projectController.get)
  .put(projectController.update)
  .delete(projectController.remove);

export default router;
