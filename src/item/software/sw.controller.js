import httpStatus from 'http-status';
import APIError from '../../helpers/apiErrorHelper.js';
import User from '../../user/user.model.js';
import SW from './sw.model.js';
import { parseToObjectList , parseToStringList } from '../history.function.js';
import {checkLocation} from "../sub.function.js"

const list = async (req, res, next) => {
  try {
    const query = req.query;
    const { totalPrice, user } = req.query;
    if(totalPrice){delete query.totalPrice;}
    if(user){
        delete query.user;
        const userObj = await User.getByName(location).exec();
        if (!userObj) { res.json([]);}
        query.userId = userObj._id;
    }
    
    const sws = await SW.find(query);
    let swList = await Promise.all(
      sws.map(async (item) => {
        const { _id, name, purchaseDate, unitPrice, remarks, amount, reference, currency,  isUnreserved, isArchived, userId, log, createAt } = item; // Destructure the original object
        const userObj = await User.get(userId);
        const user = userObj.name;
        const totalPrice= unitPrice*amount;
        let history=[];
        if(log.length!=0){history= parseToObjectList(log);}
        // Rearrange the keys, add the new key, and create a new object
        return { _id, name, purchaseDate, unitPrice, amount, totalPrice, currency, remarks, reference, user, isUnreserved, isArchived, userId, history, createAt };
      })
    );
   if(totalPrice) swList = await swList.filter((item)=>item.totalPrice==totalPrice);
    res.json(swList);
  } catch (err) {
    next(err);
  }
};

const get = async (req, res, next) => {
  try {
    const { swId } = req.params;
    const sw = await SW.get(swId);
    if (sw){ 
      const {  _id, name, purchaseDate, unitPrice, remarks, amount, reference, currency, isUnreserved, isArchived, userId, log, createAt } = sw; // Destructure the original object
      const userObj = await User.get(userId);
      const user = userObj.name;

      let history=[];
      const totalPrice=amount*unitPrice;
      //res.json(log);
      if(log.length!=0){history= parseToObjectList(log);}
      // Rearrange the keys, add the new key, and create a new object
      const swInfo= { _id, name, purchaseDate, unitPrice, amount, totalPrice, currency, remarks, reference, user, isUnreserved, isArchived, userId, history, createAt };
      return res.json(swInfo);}
    const err = new APIError('No such software exists!', httpStatus.NOT_FOUND);
    return next(err);
  } catch (err) {
    return next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { name, purchaseDate, unitPrice, amount, currency,remarks, reference, user, history } = req.body;
    //Hidden problem!!same user name??? => should be replaced to userId

    //find the team is existing
    const userObj = await User.getByName(user).exec();
    if (!userObj) {
      const errorMessage = `The location ${user} is not existing!`;
      //if not, return error
      return next(new APIError(errorMessage, httpStatus.NOT_ACCEPTABLE));
    }

    //fill Swschema
    const userId = userObj._id;
    const sw = new SW({ name, purchaseDate, unitPrice, amount, currency, reference, userId });
    if(remarks) sw.remarks = remarks;
    const {isUnreserved,isArchived} = checkLocation(user);
    if(isUnreserved) sw.isUnreserved=true;
    if(isArchived) sw.isArchived=true;
    if(history) sw.log=parseToStringList(history);
    const savedSw = await sw.save();

    //update item list of user
    userObj.numOfAssets=userObj.numOfAssets+1;
    await userObj.save();
    return res.json(savedSw);
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { swId } = req.params;
    const { name, purchaseDate, unitPrice, amount, remarks, currency,reference, user, history, isLogged , endDate, startDate, locationRemarks } =req.body;
    //Hidden problem!!same user name??? => should be ID 
    //validation : itemId is valid? & location is valid?
    const sw = await SW.get(swId);
    if(!sw) return next(new APIError(`Id is invalid`, httpStatus.NOT_FOUND));
    const validation = await User.getByName(user).exec();
    if(user&&!validation) return next(new APIError(`there is no user named ${user}`, httpStatus.NOT_ACCEPTABLE));
    
    //if contents changed-> just updated
    if(name) sw.name=name;
    if(purchaseDate) sw.purchaseDate= purchaseDate; 
    if(unitPrice) sw.unitPrice=unitPrice;
    if(amount) sw.amount= amount;
    if(remarks) sw.remarks=remarks;
    if(reference) sw.remarks=reference;
    if(currency) sw.currency=currency;

    //if location changed-> update user schema and logg
    if(user&&!validation._id.equals(sw.userId)){
      // update user schema
      const {isUnreserved,isArchived} = checkLocation(user);
      if(isUnreserved) sw.isUnreserved=true;
      if(isArchived) sw.isArchived=true;

      const userObj = await User.get(sw.userId);
      userObj.numOfAssets= userObj.numOfAssets-1;
      await userObj.save();
      
      const new_userObj = validation; // and then push userObj to new Team
      new_userObj.numOfAssets = userObj.numOfAssets+1;
      await new_userObj.save();

      sw.userId=new_userObj._id;

      //log
      if(isLogged){
        if(sw.log.length==0){
          sw.log.push(sw.purchaseDate.toLocaleDateString()+'/');
        }
        let endDateLog = Date.now;
        let startDateLog = Date.now;
        if(endDate) {endDateLog =new Date(endDate);}
        if(startDate) {startDateLog= new Date(startDate); }
        let historyRemarks = "";
        if(locationRemarks) historyRemarks= locationRemarks;
        sw.log[sw.log.length-1]= sw.log[sw.log.length-1]+endDateLog.toLocaleDateString()+'/'+ userObj.name+ '/'+historyRemarks;
        sw.log[sw.log.length]=(startDateLog.toLocaleDateString()+"/");
      }
    }
    if(history){
      sw.log= parseToStringList(history);
    }
    const savedSw = await sw.save();
    return res.json(savedSw);
  } catch (err) {
    return next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { swId } = req.params;
    const sw = await SW.get(swId);
    if(!sw) return next( new APIError('No such sw exists!', httpStatus.NOT_FOUND));
    const userObj = await User.get(sw.userId);
    userObj.numOfAssets= userObj.numOfAssets-1;
    await userObj.save();
    const result = await SW.delete(swId);
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
