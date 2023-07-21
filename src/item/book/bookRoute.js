const express = require('express');
const router = express.Router();
const bookController = require('../bookController');

router.get('/', bookController.getAllBooks);
router.get('/:id', bookController.getBook);
router.post('/', bookController.addBook);
router.put('/:id', bookController.updateBook);
router.delete('/:id', bookController.deleteBook);

module.exports = router;
