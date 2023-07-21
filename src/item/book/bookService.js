import Book from '../bookModel';

const getAllBooks = async () => {
  try {
    return await Book.find();
  } catch (error) {
    throw error;
  }
};

const getBookById = async (bookId) => {
  try {
    return await Book.findById(bookId);
  } catch (error) {
    throw error;
  }
};

const addBook = async (newBook) => {
  try {
    return await Book.create(newBook);
  } catch (error) {
    throw error;
  }
};

const updateBook = async (bookId, updatedBook) => {
  try {
    return await Book.findByIdAndUpdate(bookId, updatedBook, { new: true });
  } catch (error) {
    throw error;
  }
};

const deleteBook = async (bookId) => {
  try {
    return await Book.findByIdAndRemove(bookId);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  addBook,
  updateBook,
  deleteBook,
};
