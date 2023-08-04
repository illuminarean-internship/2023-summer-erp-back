import httpStatus from 'http-status';
import APIError from '../../helpers/apiErrorHelper.js';
import User from '../../user/user.model.js';
import Team from '../../user/team.model.js';
import Book from './book.model.js';
import { parseToObjectList, parseToStringList } from '../history.function.js';
import { checkLocation } from '../sub.function.js';

const list = async (req, res, next) => {
  try {
    const query = req.query;
    const { title, team, location } = req.query;
    if (title) { delete query.title; query.name = title; }
    if (team) { delete query.team; }
    if (location) { delete query.location; }
    const books = await Book.findQuery(query);
    let bookList = await Promise.all(
      books.map(async (item) => {
        const {
          _id, name, purchaseDate, purchasedFrom, price, currency,
          isUnreserved, isArchived, userId, log, createAt
        } = item;
        const user = await User.get(userId);
        const location = user.name;
        const team = user.teamId ? (await Team.get(user.teamId)).name : '';
        const title = name;
        const history = log.length !== 0 ? parseToObjectList(log) : [];
        // Rearrange the keys, add the new key, and create a new object
        return {
          _id, title, team, location, purchaseDate, purchasedFrom, price, currency,
          isUnreserved, isArchived, userId, history, createAt
        };
      })
    );
    if (team) bookList = bookList.filter((item) => item.team === team);
    if (location) bookList = bookList.filter((item) => item.name === location);
    res.json(bookList);
  } catch (err) {
    next(err);
  }
};

const get = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const book = await Book.get(bookId);
    if (!book) { const err = new APIError('No such book exists!', httpStatus.NOT_FOUND); return next(err); }
    const {
      _id, name, purchaseDate, purchasedFrom, price,
      isUnreserved, isArchived, userId, log, createAt
    } = book; // Destructure the original object
    const user = await User.get(userId);
    const location = user.name;
    const team = user.teamId ? (await Team.get(user.teamId)).name : '';
    const title = name;
    const history = log.length !== 0 ? parseToObjectList(log) : [];
    // Rearrange the keys, add the new key, and create a new object
    const bookInfo = {
      _id, title, team, location, purchaseDate, purchasedFrom, price, currency,
      isUnreserved, isArchived, userId, history, createAt
    };
    return res.json(bookInfo);
  } catch (err) {
    return next(err);
  }
};

const create = async (req, res, next) => {
  try {
    // Hidden problem!!same user name??? => should be replaced to userId
    const {
      title, location, purchaseDate, purchasedFrom, price, history, currency
    } = req.body;

    // find the team is existing
    const userObj = await User.getByName(location);
    if (!userObj) {
      const errorMessage = `The location ${location} is not existing!`;
      // if not, return error
      return next(new APIError(errorMessage, httpStatus.NOT_ACCEPTABLE));
    }

    // fill Bookschema
    const userId = userObj._id;
    const name = title;
    const book = new Book({
      name, purchaseDate, purchasedFrom, price, userId, currency
    });
    const { isUnreserved, isArchived } = checkLocation(location);
    book.isUnreserved = isUnreserved;
    book.isArchived = isArchived;
    if (history) book.log = parseToStringList(history);
    const savedBook = await book.save();

    // update item list of user
    userObj.numOfAssets += 1;
    await userObj.save();
    return res.json(savedBook);
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const {
      title, location, purchaseDate, purchasedFrom, price, history, currency
      // isLogged , endDate, startDate, locationRemarks
    } = req.body;

    // Hidden problem!!same user name??? => should be ID
    // validation : bookId is valid? & location is valid?
    const book = await Book.get(bookId);
    if (!book) return next(new APIError(`Id ${bookId} is invalid`, httpStatus.NOT_FOUND));
    const validation = await User.getByName(location);
    if (location && !validation) return next(new APIError(`there is no user named ${location}`, httpStatus.NOT_ACCEPTABLE));

    // if contents changed-> just updated
    if (title) book.name = title;
    if (purchaseDate) book.purchaseDate = purchaseDate;
    if (purchasedFrom) book.purchasedFrom = purchasedFrom;
    if (price) book.price = price;
    if (currency) book.currency = currency;

    // if location changed-> update user schema and logg
    if (location && !validation._id.equals(book.userId)) {
      // update user schema
      const { isUnreserved, isArchived } = checkLocation(location);
      book.isUnreserved = isUnreserved;
      book.isArchived = isArchived;

      const userObj = await User.get(book.userId);
      userObj.numOfAssets -= 1;
      await userObj.save();

      const userNewObj = validation; // and then push userObj to new Team
      userNewObj.numOfAssets += 1;
      await userNewObj.save();

      book.userId = userNewObj._id;

      /* log
      if(isLogged){
        if(book.log.length==0){
          book.log.push(book.purchaseDate.toLocaleDateString()+'/');
        }
        let endDateLog = Date.now;
        let startDateLog = Date.now;
        if(endDate) {endDateLog =new Date(endDate);}
        if(startDate) {startDateLog= new Date(startDate); }
        let historyRemarkss = "";
        if(locationRemarks) historyRemarkss= locationRemarks;
        book.log[book.log.length-1]= book.log[book.log.length-1]+
        endDateLog.toLocaleDateString()+'/'+ userObj.name+ '/'+historyRemarkss;
        book.log[book.log.length]=(startDateLog.toLocaleDateString()+"/");
      }
      */
    }
    if (history) { book.log = parseToStringList(history); }
    const bookSaved = await book.save();
    return res.json(bookSaved);
  } catch (err) {
    return next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const book = await Book.get(bookId);
    if (!book) return next(new APIError('No such book exists!', httpStatus.NOT_FOUND));
    const userObj = await User.get(book.userId);
    userObj.numOfAssets -= 1;
    await userObj.save();
    const result = await Book.delete(bookId);
    return res.json(result);
  } catch (err) {
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
