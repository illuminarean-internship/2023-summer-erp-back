import express from 'express';
import authRoute from './src/auth/auth.route.js';
import userRoute from './src/user/user.route.js';
import teamRoute from './src/user/team.route.js';
import projRoute from './src/user/project.route.js';
import itemRoute from './src/item/sample/item.route.js';
import bookRoute from './src/item/book/book.route.js';
import swRoute from './src/item/software/sw.route.js';
import MockupRoute from './src/item/testdevice/mockop.route.js';
import desktopRoute from './src/item/desktop/desktopRoute.js';

const router = express.Router();

router.get('/health-check', (req, res) => res.send('OK'));

router.use('/auth', authRoute);
router.use('/users', userRoute);
router.use('/teams', teamRoute);
router.use('/items', itemRoute);
router.use('/projs', projRoute);

router.use('/books', bookRoute);
router.use('/software', swRoute);
router.use('/test-device', MockupRoute);
router.use('/desktops', desktopRoute);

export default router;
