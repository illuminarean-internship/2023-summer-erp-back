import express from 'express';
import laptopController from './laptopController.js';


<<<<<<< HEAD
const router = express.Router();


=======


const router = express.Router();




>>>>>>> 113c241cc680869b7405af27e78c1917ce70fcaa
router.route('/')
  .get(laptopController.list)
  .post(laptopController.create);


<<<<<<< HEAD
=======


>>>>>>> 113c241cc680869b7405af27e78c1917ce70fcaa
router.route('/item/:laptopId')
  .get(laptopController.get)
  .put(laptopController.update)
  .delete(laptopController.remove);


<<<<<<< HEAD
=======


>>>>>>> 113c241cc680869b7405af27e78c1917ce70fcaa
export default router;



<<<<<<< HEAD
=======

>>>>>>> 113c241cc680869b7405af27e78c1917ce70fcaa
