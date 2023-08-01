import httpStatus from 'http-status';
import APIError from '../../helpers/apiErrorHelper.js';
import User from '../../user/user.model.js';
import Team from '../../user/team.model.js';
import HW from './hw.model.js';


const list = async (req, res, next) => {
  try {
    const { limit = 50, skip = 0 } = req.query;
    const books = await HW.list({ limit, skip });

    const booklist = await Promise.all(
      books.map(async (item) => {
        const { _id, name, purchaseDate, price, isUnreserved, isArchived, userId, log, createAt } = item; // Destructure the original object
        const user = await User.get(userId);
        const location = user.name;
        let teamName = "";
        if(user.teamId){
        const team = await Team.get(user.teamId);
        teamName = team.name;}
        // Rearrange the keys, add the new key, and create a new object
        return { _id, name, teamName, location, purchaseDate, price, isUnreserved, isArchived, userId, log, createAt };
      })
    );
    res.json(booklist);
  } catch (err) {
    next(err);
  }
};


const filterUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const books = await Book.list();
    //change this line
    const userbooks = await books.filter((item)=>item.userId.equals(userId));
    const userbooklist = await Promise.all(
      userbooks.map(async (item) => {
        const { _id, name, purchaseDate, price, isUnreserved, isArchived, userId, log, createAt } = item; // Destructure the original object
        const user = await User.get(userId);
        const location = user.name;
        let teamName = "";
        if(user.teamId){
        const team = await Team.get(user.teamId);
        teamName = team.name;}
        // Rearrange the keys, add the new key, and create a new object
        return { _id, name, teamName, location, purchaseDate, price, isUnreserved, isArchived, userId, log, createAt };
      })
    );
    res.json(userbooklist);
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
    //Hidden problem!!same user name??? => should be replaced to userId

    //find the team is existing
    const userObj = await User.findOne({name: location}).exec();
    if (!userObj) {
      const errorMessage = `The location ${location} is not existing!`;
      //if not, return error
      return next(new APIError(errorMessage, httpStatus.NOT_ACCEPTABLE));
    }

    //fill Bookschema
    const userId = userObj._id;
    const book = new Book({ name, purchaseDate, price, userId});
    if(remarks) book.remarks = remarks;
    const {isUnreserved,isArchived} = checkLocation(location);
    if(isUnreserved) book.isUnreserved=true;
    if(isArchived) book.isArchived=true;
    const savedBook = await book.save();

    //update item list of user
    userObj.numOfAssets=userObj.numOfAssets+1;
    await userObj.save();
    return res.json(savedBook);
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

    //if contents changed-> just updated
    if(name) book.name=name;
    if(purchaseDate) book.purchaseDate= purchaseDate;
    if(price) book.price=price;
    if(remarks) book.remarks=remarks;

    //if location changed-> update user schema and logg
    if(location){
      //log
      if(isLogged){
        if(book.archive.empty()){

        }
      }
      // update user schema
      const userObj = await User.get(book.userId);
      userObj.numOfAssets= userObj.numOfAssets-1;
      await userObj.save();

      const new_userObj = validation; // and then push userObj to new Team
      new_userObj.numOfAssets = userObj.numOfAssets+1;
      await new_userObj.save();

      book.userId=validation._id;
    }
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
    if(!book) return next( new APIError('No such book exists!', httpStatus.NOT_FOUND));
    const userObj = await User.get(book.userId);
    userObj.numOfAssets= userObj.numOfAssets-1;
    await userObj.save();
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
  remove,
  filterUser
};
