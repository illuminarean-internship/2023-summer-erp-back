import httpStatus from 'http-status';
import APIError from '../../helpers/apiErrorHelper.js';
import User from '../../user/user.model.js';
//import Team from '../../user/team.model.js';
import Laptop from './laptopModel.js';
import { parseToObjectList , parseToStringList } from '../history.function.js';
import {checkLocation} from "../sub.function.js"

const list = async (req, res, next) => {
  try {
    const query = req.query;
    const { location } = req.query;
    //if(team){delete query.team;}
    if (location) { delete query.location; }
    const laptops = await Laptop.findQuery(query);
    let laptopList = await Promise.all(
        laptops.map(async (item) => {
          const { _id, category, modelName, CPU, RAM, SSD, serialNumber, warranty, price, surtax,
            illumiSerial, color, purchaseDate, purchaseFrom, purpose, userId, isUnreserved, isArchived,
            isRepair, archive, createAt, dateAvail, daysLeft } = item;
        const location = (await User.get(userId)).name;
        const history = log.length !== 0 ? parseToObjectList(log) : [{
          startDate: purchaseDate.toISOString().split('T')[0],
          endDate: '',
          historyLocation: location,
          historyRemark: ''}];
        // Rearrange the keys, add the new key, and create a new object
        return { _id, category, modelName, CPU, RAM, SSD, serialNumber, location, warranty, price, surtax,
          illumiSerial, color, purchaseDate, purchaseFrom, purpose, userId, isUnreserved, isArchived,
          isRepair, createAt, dateAvail, daysLeft, history };
      })
    );
    if (location) laptopList = await laptopList.filter((item)=> item.name === location);
    res.json(laptopList);
  } catch (err) {
    next(err);
  }
};

const get = async (req, res, next) => {
  try {
    const { laptopId } = req.params;
    const laptop = await Laptop.get(laptopId);
    if (laptop) {
      const item = laptop;
      const { _id, category, modelName, CPU, RAM, SSD, serialNumber, warranty, price, surtax,
        illumiSerial, color, purchaseDate, purchaseFrom, purpose, userId, isUnreserved, isArchived,
        isRepair, archive, createAt, dateAvail, daysLeft } = item;
      const location = (await User.get(userId)).name;
      const history = log.length !== 0 ? parseToObjectList(log) : [{
        startDate: purchaseDate.toISOString().split('T')[0],
        endDate: '',
        historyLocation: location,
        historyRemark: ''}];
      // Rearrange the keys, add the new key, and create a new object
      const laptopInfo= { _id, category, modelName, CPU, RAM, SSD, serialNumber, location, warranty, price, surtax,
        illumiSerial, color, purchaseDate, purchaseFrom, purpose, userId, isUnreserved, isArchived,
        isRepair, history, createAt, dateAvail, daysLeft };
      return res.json(laptopInfo); }
    const err = new APIError('No such laptop exists!', httpStatus.NOT_FOUND);
    return next(err);
  } catch (err) {
    return next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const {
      category, modelName, CPU, RAM, SSD, serialNumber, warranty, price, surtax,
      illumiSerial, color, purchaseDate, purchaseFrom, remarks, location, history,
      dateAvail, daysLeft
    } = req.body;
    //Hidden problem!!same user name??? => should be replaced to userId

    //find the team is existing
    const userObj = await User.getByName(location);
    if (!userObj) {
      const errorMessage = `The location ${location} is not existing!`;
      //if not, return erro
      return next(new APIError(errorMessage, httpStatus.NOT_ACCEPTABLE));
    }

    //fill Laptopschema
    const userId = userObj._id;
    const laptop = new Laptop({ category, modelName, CPU, RAM, SSD, serialNumber, warranty, price, surtax,
      illumiSerial, color, purchaseDate, purchaseFrom, userId, dateAvail, daysLeft, history });
    if (remarks) laptop.remarks = remarks;
    const {
      isUnreserved, isArchived, isRepair } = checkLocation(location);
    if (isUnreserved) laptop.isUnreserved = true;
    if (isArchived) laptop.isArchived = true;
    if (isRepair) laptop.isRepair = true; // this would not be working
    if (history) laptop.archive = parseToStringList(history);
    const savedLaptop = await laptop.save();

    //update item list of user
    userObj.numOfAssets += 1;
    await userObj.save();
    return res.json(savedLaptop);
  } catch (err) {
    return next(err);
  }
};


const update = async (req, res, next) => {
  try {
    const { laptopId } = req.params;
    const { category, location, modelName, CPU, RAM, SSD, serialNumber, warranty, price, surtax,
      illumiSerial, color, purchaseDate, purchaseFrom, remarks, history, dateAvail } = req.body;

    //Hidden problem!!same user name??? => should be ID
    //validation : laptopId is valid? & location is valid?
    const laptop = await Laptop.get(laptopId);
    if (!laptop) return next(new APIError(`Id is invalid`, httpStatus.NOT_FOUND));
    const validation = await User.getByName(location);
    if (location && !validation) return next(new APIError(`there is no user named ${location}`, httpStatus.NOT_ACCEPTABLE));

    //if contents changed-> just updated
    if(category) laptop.category = category;
    if(modelName) laptop.modelName = modelName;
    if(CPU) laptop.CPU = CPU;
    if(RAM) laptop.RAM = RAM;
    if(SSD) laptop.SSD = SSD;
    if(serialNumber) laptop.serialNumber = serialNumber;
    if(warranty) laptop.warranty=warranty;
    if(price) laptop.price=price;
    if(surtax) laptop.surtax=surtax;
    if(warranty) laptop.surtax=surtax;
    if(illumiSerial) laptop.illumiSerial=illumiSerial;
    if(color) laptop.color=color;
    if(purchaseDate) laptop.purchaseDate= purchaseDate;
    if(purchaseFrom) laptop.purchaseFrom =purchaseFrom;
    if(remarks) laptop.remarks =remarks;
    if (dateAvail) laptop.dateAvail =dateAvail;

    //if location changed-> update user schema and archive
    if(location&&!validation._id.equals(laptop.userId)){
      // update user schema
      const {isUnreserved,isArchived, isRepair} = checkLocation(location);
      if(isUnreserved) laptop.isUnreserved=true;
      if(isArchived) laptop.isArchived=true;
      if(isRepair) laptop.isArchived=true;

      const userObj = await User.get(laptop.userId);
      userObj.numOfAssets= userObj.numOfAssets-1;
      await userObj.save();
     
      const new_userObj = validation; // and then push userObj to new Team
      new_userObj.numOfAssets = userObj.numOfAssets+1;
      await new_userObj.save();

      laptop.userId=new_userObj._id;
    }
    if (history) { laptop.archive = parseToStringList(history); }
    const laptopSaved = await laptop.save();
    return res.json(laptopSaved);
  } catch (err) {
    return next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { laptopId } = req.params;
    const laptop = await Laptop.get(laptopId);
    if (!laptop) return next(new APIError('No such laptop exists!', httpStatus.NOT_FOUND));
    const userObj = await User.get(laptop.userId);
    userObj.numOfAssets -= 1;
    await userObj.save();
    const result = await Laptop.delete(laptopId);
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


