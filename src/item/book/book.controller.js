import httpStatus from 'http-status';
import APIError from '../../helpers/apiErrorHelper.js';
import User from '../../user/user.model.js';
import Book from './book.model.js';

const list = async (req, res, next) => {
  try {
    const { limit = 50, skip = 0 } = req.query;
    const books = await Book.list({ limit, skip });
    res.json(books);
  } catch (err) {
    next(err);
  }
};

const get = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const book = await Book.get(bookId);
    if (book) return res.json(book);
    const err = new APIError('No such book exists!', httpStatus.NOT_FOUND);
    return next(err);
  } catch (err) {
    return next(err);
  }
};

const checkLocation = (location) => {
    let isUnreserved =false;
    let isArchived = false;

    if(location=="Office"){
        isUnreserved=true;
    }
    if(location=="Resold"||location=="Disuse"){
        isArchived=true;
    }
    return {isUnreserved,isArchived};
};

const create = async (req, res, next) => {
  try {
    const { name, location, purchaseDate, price, remarks } = req.body;
    
    //Hidden problem!!same user name??? 
    //find the team is existing
    const userObj = await User.findOne({name: location}).exec();
    if (!userObj) {
      const errorMessage = `The location ${location} is not existing!`;
      //if not, return error
      return next(new APIError(errorMessage, httpStatus.NOT_ACCEPTABLE));
    }

    //fill Bookschema
    const teamName = userObj.teamName;
    const book = new Book({ name, teamName, location, purchaseDate, price});
    if(remarks) book.remarks = remarks;
    book.userId=userObj._id;
    const {isUnreserved,isArchived} = checkLocation(location);
    if(isUnreserved) book.isUnreserved=true;
    if(isArchived) book.isArchived=true;
    const savedUBook = await book.save();

    //update item list of user
    userObj.books.push(savedUBook._id);
    await userObj.save();
    return res.json(savedUBook);
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const { name, location, purchaseDate, price, remarks, isLogged } = req.body;

    //Hidden problem!!same user name??? => should be ID 
    //validation : bookId is valid? & location is valid?
    const book = await Book.get(bookId);
    if(!book) return next(new APIError(`Id is invalid`, httpStatus.NOT_FOUND));
    const validation = await User.findOne({name: location}).exec();
    if(location&&!validation) return next(new APIError(`there is no user named ${location}`, httpStatus.NOT_ACCEPTABLE));
    
    let new_name, new_purchaseDate, new_price, new_remarks;
    //if contents changed-> just updated
    if(name) new_name = name; else new_name = book.name;
    if(purchaseDate) new_purchaseDate = purchaseDate; else new_purchaseDate = book.purchaseDate;
    if(price) new_price = price; else new_price = book.price;
    if(remarks) new_remarks = remarks; else new_remarks = book.remarks;
    await Book.updateContents(bookId, new_name, new_purchaseDate, new_price, new_remarks);

    //if location changed-> update user schema and logg
    if(location){
      //log
      if(isLogged){
        if(book.archive.empty()){

        }
      }
      // update user schema
      const userObj = await User.get(book.userId);
      for (let i = userObj.books.length - 1; i >= 0; i--) {
      if (userObj.books[i].toString() == bookId ) {
          userObj.books.splice(i, 1);
          await userObj.save();
          const new_userObj = validation; // and then push userObj to new Team
          new_userObj.books.push(book._id);
          await new_userObj.save();
          await Book.updateLocation(bookId, new_userObj.teamName, new_userObj.name, new_userObj._id);
          break;
        }
    }
  }
    const bookSaved = await Book.get(bookId);
    return res.json(bookSaved);
  } catch (err) {
    return next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const book = await Book.get(bookId);
    if(!book) return next( new APIError('No such book exists!', httpStatus.NOT_FOUND));
    const userObj = await User.get(book.userId);
      for (let i = userObj.books.length - 1; i >= 0; i--) {
      if (userObj.books[i].toString() == bookId ) {
        userObj.books.splice(i, 1);
        await userObj.save();
        break;
      }} 
    const result = await Book.delete(bookId);
    return res.json(result);
  }
  catch (err) {
    return next(err);
  }
};

export default {
  list,
  get,
  create,
  update,
  remove
};
