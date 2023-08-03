import express from 'express';
import laptopController from './laptopController.js';




const router = express.Router();




router.route('/')
  .get(laptopController.list)
  .post(laptopController.create);




router.route('/item/:laptopId')
  .get(laptopController.get)
  .put(laptopController.update)
  .delete(laptopController.remove);




export default router;




