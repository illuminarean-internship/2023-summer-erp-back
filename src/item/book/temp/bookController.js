let books = [
    // Dummy data
  ];
  
  const getAllBooks = (req, res) => {
    res.json(books);
  };
  
  const getBook = (req, res) => {
    const bookId = parseInt(req.params.id);
    const book = books.find((book) => book.id === bookId);
    if (book) {
      res.json(book);
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  };
  
  const addBook = (req, res) => {
    const data = req.body;
    const newBook = {
      id: books.length + 1,
      title: data.title,
      author: data.author,
      genre: data.genre,
      isAvailable: true,
    };
    books.push(newBook);
    res.status(201).json(newBook);
  };
  
  const updateBook = (req, res) => {
    const bookId = parseInt(req.params.id);
    const book = books.find((book) => book.id === bookId);
    if (book) {
      const data = req.body;
      book.title = data.title;
      book.author = data.author;
      book.genre = data.genre;
      res.json(book);
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  };
  
  const deleteBook = (req, res) => {
    const bookId = parseInt(req.params.id);
    const index = books.findIndex((book) => book.id === bookId);
    if (index !== -1) {
      books.splice(index, 1);
      res.json({ message: 'Book deleted' });
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  };
  
  module.exports = {
    getAllBooks,
    getBook,
    addBook,
    updateBook,
    deleteBook,
  };
  