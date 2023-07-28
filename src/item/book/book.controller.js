import httpStatus from 'http-status';
import APIError from '../../helpers/apiErrorHelper.js';
import User from '../../user/user.model.js';
import Team from '../../user/team.model.js';
import Book from './book.model.js';
import { parseToObjectList , parseToStringList } from '../history.function.js';
import {checkLocation} from "../sub.function.js"

const list = async (req, res, next) => {
  try {
    const query = req.query;
    const { title, team, location } = req.query;
    if(title){delete query.title; query.name=title;}
    if(team){delete query.team;}
    if(location){delete query.location;}
    const books = await Book.find(query);
    let bookList = await Promise.all(
      books.map(async (item) => {
        const { _id, name, purchaseDate, purchasedFrom, price, isUnreserved, isArchived, userId, log, createAt } = item; // Destructure the original object
        const user = await User.get(userId);
        const location = user.name;
        let team = "";
        if(user.teamId){
        const teamObj = await Team.get(user.teamId);
        team = teamObj.name;}
        const title = name;
        let history=[];
        if(log.length!=0){history= parseToObjectList(log);}
        // Rearrange the keys, add the new key, and create a new object
        return { _id, title, team, location, purchaseDate, purchasedFrom, price, isUnreserved, isArchived, userId, history, createAt };
      })
    );
   if(team) bookList = await bookList.filter((item)=>item.team==team);
   if(location) bookList= await bookList.filter((item)=>item.name==location);
    res.json(bookList);
  } catch (err) {
    next(err);
  }
};

const get = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const book = await Book.get(bookId);
    if (book){ 
      const item = book;
      const { _id, name, purchaseDate, purchasedFrom, price, isUnreserved, isArchived, userId, log, createAt } = item; // Destructure the original object
      const user = await User.get(userId);
      const location = user.name;
      let team = "";
      if(user.teamId){
      const teamObj = await Team.get(user.teamId);
      team = teamObj.name;}
      const title = name;
      let history=[];
      //res.json(log);
      if(log.length!=0){history= parseToObjectList(log);}
      // Rearrange the keys, add the new key, and create a new object
      const bookInfo= { _id, title, team, location, purchaseDate, purchasedFrom, price, isUnreserved, isArchived, userId, history, createAt };
      return res.json(bookInfo);}
    const err = new APIError('No such book exists!', httpStatus.NOT_FOUND);
    return next(err);
  } catch (err) {
    return next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { title, location, purchaseDate, purchasedFrom, price, remarks, history } = req.body;
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
    const name = title;
    const book = new Book({ name, purchaseDate, purchasedFrom, price, userId});
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
    const { name, location, purchaseDate, purchasedFrom, price, remarks, isLogged , endDate, startDate, history, locationRemarks } = req.body;

    //Hidden problem!!same user name??? => should be ID 
    //validation : bookId is valid? & location is valid?
    const book = await Book.get(bookId);
    if(!book) return next(new APIError(`Id is invalid`, httpStatus.NOT_FOUND));
    const validation = await User.findOne({name: location}).exec();
    if(location&&!validation) return next(new APIError(`there is no user named ${location}`, httpStatus.NOT_ACCEPTABLE));
    
    //if contents changed-> just updated
    if(name) book.name=name;
    if(purchaseDate) book.purchaseDate= purchaseDate; 
    if(purchasedFrom) book.purchasedFrom =purchasedFrom;
    if(price) book.price=price;
    if(remarks) book.remarks=remarks;

    //if location changed-> update user schema and logg
    if(location&&!validation._id.equals(book.userId)){
      // update user schema
      const {isUnreserved,isArchived} = checkLocation(location);
      if(isUnreserved) book.isUnreserved=true;
      if(isArchived) book.isArchived=true;

      const userObj = await User.get(book.userId);
      userObj.numOfAssets= userObj.numOfAssets-1;
      await userObj.save();
      
      const new_userObj = validation; // and then push userObj to new Team
      new_userObj.numOfAssets = userObj.numOfAssets+1;
      await new_userObj.save();

      book.userId=new_userObj._id;

      //log
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
        book.log[book.log.length-1]= book.log[book.log.length-1]+endDateLog.toLocaleDateString()+'/'+ userObj.name+ '/'+historyRemarkss;
        book.log[book.log.length]=(startDateLog.toLocaleDateString()+"/");
      }
    }
    if(history){
      book.log= parseToStringList(history);
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
  remove
};
