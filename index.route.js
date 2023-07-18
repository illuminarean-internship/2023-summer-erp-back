import express from 'express';
import authRoute from './src/auth/auth.route.js';
import userRoute from './src/user/user.route.js';
import itemRoute from './src/item/sample/item.route.js';

const router = express.Router();

router.get('/health-check', (req, res) => res.send('OK'));

router.use('/auth', authRoute);
router.use('/users', userRoute);
router.use('/items', itemRoute);

export default router;
