import express from 'express';
import authRoute from './src/auth/auth.route.js';
import userRoute from './src/user/user.route.js';
import teamRoute from './src/user/team.route.js';
import projRoute from './src/user/project.route.js';
import bookRoute from './src/item/book/book.route.js';
import swRoute from './src/item/software/sw.route.js';
import MockupRoute from './src/item/testdevice/mockop.route.js';
import laptopRoute from './src/item/laptop/laptopRoute.js';
import AccRoute from './src/item/accessory/acc.route.js';
import desktopRoute from './src/item/desktop/desktop.route.js';

const router = express.Router();

router.get('/health-check', (req, res) => res.send('OK'));

router.use('/auth', authRoute);
router.use('/users', userRoute);
router.use('/teams', teamRoute);
router.use('/projs', projRoute);

router.use('/books', bookRoute);
router.use('/software', swRoute);
router.use('/test-device', MockupRoute);
router.use('/laptop', laptopRoute);
router.use('/accessory', AccRoute);
router.use('/desktop-pc', desktopRoute);

export default router;
