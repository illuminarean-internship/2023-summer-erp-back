/*import express from 'express';
import authRoute from './src/auth/auth.route.js';
import userRoute from './src/user/user.route.js';
import itemRoute from './src/item/sample/item.route.js';

const router = express.Router();

router.get('/health-check', (req, res) => res.send('OK'));

router.use('/auth', authRoute);
router.use('/users', userRoute);
router.use('/items', itemRoute);

export default router;
*/

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bookRoute = require('./routes/bookRoute');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Connect to your MongoDB database (replace 'your_db_url' with your actual MongoDB URL)
mongoose.connect('mongodb://your_db_url/book_management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Use the bookRoute for /api/books endpoint
app.use('/api/books', bookRoute);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

