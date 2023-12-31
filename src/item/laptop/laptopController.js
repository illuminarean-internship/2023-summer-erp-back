import httpStatus from 'http-status';
import APIError from '../../helpers/apiErrorHelper.js';
import User from '../../user/user.model.js';
// import Team from '../../user/team.model.js';
import Laptop from './laptopModel.js';
import Info from '../info.model.js';

import { parseToObjectList, parseToStringList } from '../history.function.js';
import { checkLocation } from '../sub.function.js';

const list = async (req, res, next) => {
  try {
    // eslint-disable-next-line prefer-destructuring
    const query = req.query;
    const { location } = req.query;
    // if(team){delete query.team;}
    if (location) { delete query.location; }
    const laptops = await Laptop.findQuery(query);
    let laptopList = await Promise.all(
      laptops.map(async (item) => {
        const {
          _id, category, model, CPU, RAM, SSD, serialNumber, currency, remarks, totalPrice,
          warranty, price, surtax, illumiSerial, color, purchaseDate, purchasedFrom, purpose,
          userId, isArchived, archive, createAt, dateAvail, daysLeft,
          isRepair, issues, replace, request, repairPrice, repairCurrency, repairDetails,
          resellPrice, resellCurrency, karrotPrice
        } = item;
        // eslint-disable-next-line no-shadow
        const location = (await User.get(userId)).name;
        const history = archive.length !== 0 ? parseToObjectList(archive) : [{
          startDate: purchaseDate.toISOString().split('T')[0],
          endDate: '',
          historyLocation: location,
          historyRemark: ''
        }];
        // Rearrange the keys, add the new key, and create a new object
        return {
          _id,
          category,
          model,
          CPU,
          RAM,
          SSD,
          serialNumber,
          currency,
          remarks,
          totalPrice,
          location,
          warranty,
          price,
          surtax,
          illumiSerial,
          color,
          purchaseDate,
          purchasedFrom,
          purpose,
          userId,
          isArchived,
          isRepair,
          createAt,
          dateAvail,
          daysLeft,
          history,
          issues, replace, request, repairPrice, repairCurrency, repairDetails,
          resellPrice, resellCurrency, karrotPrice
        };
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
      const {
        _id, category, model, CPU, RAM, SSD, serialNumber, currency, remarks, totalPrice,
        warranty, price, surtax, illumiSerial, color, purchaseDate, purchasedFrom, purpose,
        userId, isArchived, archive, createAt, dateAvail, daysLeft,
        isRepair, issues, replace, request, repairPrice, repairCurrency, repairDetails,
        resellPrice, resellCurrency, karrotPrice
      } = item;
      const location = (await User.get(userId)).name;
      const history = archive.length !== 0 ? parseToObjectList(archive) : [{
        startDate: purchaseDate.toISOString().split('T')[0],
        endDate: '',
        historyLocation: location,
        historyRemark: ''
      }];
      // Rearrange the keys, add the new key, and create a new object
      const laptopInfo = {
        _id,
        category,
        model,
        CPU,
        RAM,
        SSD,
        currency,
        remarks,
        totalPrice,
        serialNumber,
        location,
        warranty,
        price,
        surtax,
        illumiSerial,
        color,
        purchaseDate,
        purchasedFrom,
        purpose,
        userId,
        isArchived,
        history,
        createAt,
        dateAvail,
        daysLeft,
        isRepair, issues, replace, request, repairPrice, repairCurrency, repairDetails,
          resellPrice, resellCurrency, karrotPrice
      };
      return res.json(laptopInfo);
    }
    const err = new APIError('No such laptop exists!', httpStatus.NOT_FOUND);
    return next(err);
  } catch (err) {
    return next(err);
  }
};

const createList = async (req, res, next) => {
  try {
    const bodylist = req.body;
    for( let i =0 ; i<bodylist.length; i++){
      const item = bodylist[i];
      const {
        category, model, CPU, RAM, SSD, serialNumber, warranty, price, surtax,
        illumiSerial, color, purchaseDate, purchasedFrom, currency, remarks,
        totalPrice, location, history,
        dateAvail, daysLeft, isRepair, issues, replace, request, repairPrice, repairCurrency, repairDetails,
        resellPrice, resellCurrency, karrotPrice
      } = item;
      // Hidden problem!!same user name??? => should be replaced to userId
  
      // find the team is existing
      const userObj = await User.getByName(location);
      if (!userObj) {
        const errorMessage = `The location ${location} is not existing!`;
        // if not, return erro
        return next(new APIError(errorMessage, httpStatus.NOT_ACCEPTABLE));
      }
  
      // fill Laptopschema
      const userId = userObj._id;
      const laptop = new Laptop({
        category,
        model,
        CPU,
        RAM,
        SSD,
        serialNumber,
        warranty,
        price,
        surtax,
        illumiSerial,
        color,
        purchaseDate,
        currency,
        remarks,
        totalPrice,
        purchasedFrom,
        userId,
        dateAvail,
        daysLeft,
        history
      });
      const { isArchived } = checkLocation(location);
      laptop.isArchived = isArchived;
      laptop.isRepair = isRepair;
      if (isArchived || isRepair) {
        laptop.issues = issues;
        laptop.replace = replace;
        laptop.repairPrice = repairPrice;
        laptop.repairCurrency = repairCurrency;
        laptop.repairDetails = repairDetails;
        laptop.request = request;
        laptop.resellPrice = resellPrice;
        laptop.resellCurrency = resellCurrency;
        laptop.karrotPrice= karrotPrice;
      }
  
      if (history) laptop.archive = parseToStringList(history);
      const savedLaptop = await laptop.save();
  
      // update item list of user
      userObj.numOfAssets += 1;
      await userObj.save();
    }
    res.json("done");
} catch (err) {
    return next(err);
  }
};
const create = async (req, res, next) => {
  try {
    const {
      category, model, CPU, RAM, SSD, serialNumber, warranty, price, surtax,
      illumiSerial, color, purchaseDate, purchasedFrom, currency, remarks,
      totalPrice, location, history,
      dateAvail, daysLeft, isRepair, issues, replace, request, repairPrice, repairCurrency, repairDetails,
      resellPrice, resellCurrency, karrotPrice
    } = req.body;
    // Hidden problem!!same user name??? => should be replaced to userId

    // find the team is existing
    const userObj = await User.getByName(location);
    if (!userObj) {
      const errorMessage = `The location ${location} is not existing!`;
      // if not, return erro
      return next(new APIError(errorMessage, httpStatus.NOT_ACCEPTABLE));
    }

    // fill Laptopschema
    const userId = userObj._id;
    const laptop = new Laptop({
      category,
      model,
      CPU,
      RAM,
      SSD,
      serialNumber,
      warranty,
      price,
      surtax,
      illumiSerial,
      color,
      purchaseDate,
      currency,
      remarks,
      totalPrice,
      purchasedFrom,
      userId,
      dateAvail,
      daysLeft,
      history
    });
    const { isArchived } = checkLocation(location);
    laptop.isArchived = isArchived;
    laptop.isRepair = isRepair;
    if (isArchived || isRepair) {
      laptop.issues = issues;
      laptop.replace = replace;
      laptop.repairPrice = repairPrice;
      laptop.repairCurrency = repairCurrency;
      laptop.repairDetails = repairDetails;
      laptop.request = request;
      laptop.resellPrice = resellPrice;
      laptop.resellCurrency = resellCurrency;
      laptop.karrotPrice= karrotPrice;
    }

    if (history) laptop.archive = parseToStringList(history);
    const savedLaptop = await laptop.save();

    // update item list of user
    userObj.numOfAssets += 1;
    await userObj.save();

    const InfoObj = (await Info.list())[0];
    InfoObj.numOfLaptop += 1;
    await InfoObj.save();

    return res.json(savedLaptop);
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { laptopId } = req.params;
    const {
      category, location, model, CPU, RAM, SSD, serialNumber, warranty,
      price, surtax,
      illumiSerial, color, purchaseDate, purchasedFrom, currency,
      remarks, totalPrice, history, dateAvail, isRepair, issues, replace, request, repairPrice,
      repairCurrency, repairDetails, resellPrice, resellCurrency, karrotPrice
    } = req.body;

    // Hidden problem!!same user name??? => should be ID
    // validation : laptopId is valid? & location is valid?
    const laptop = await Laptop.get(laptopId);
    if (!laptop) return next(new APIError('Id is invalid', httpStatus.NOT_FOUND));
    const validation = await User.getByName(location);
    if (location && !validation) return next(new APIError(`there is no user named ${location}`, httpStatus.NOT_ACCEPTABLE));

    // if contents changed-> just updated
    if (category !== undefined) laptop.category = category;
    if (model !== undefined) laptop.model = model;
    if (CPU !== undefined) laptop.CPU = CPU;
    if (RAM !== undefined) laptop.RAM = RAM;
    if (SSD !== undefined) laptop.SSD = SSD;
    if (serialNumber !== undefined) laptop.serialNumber = serialNumber;
    if (warranty !== undefined) laptop.warranty = warranty;
    if (price !== undefined) laptop.price = price;
    if (surtax !== undefined) laptop.surtax = surtax;
    if (warranty !== undefined) laptop.surtax = surtax;
    if (illumiSerial !== undefined) laptop.illumiSerial = illumiSerial;
    if (color !== undefined) laptop.color = color;
    if (purchaseDate !== undefined) laptop.purchaseDate = purchaseDate;
    if (purchasedFrom !== undefined) laptop.purchasedFrom = purchasedFrom;
    if (remarks !== undefined) laptop.remarks = remarks;
    if (currency !== undefined) laptop.currency = currency;
    if (totalPrice !== undefined) laptop.totalPrice = totalPrice;
    if (dateAvail !== undefined) laptop.dateAvail = dateAvail;

    // if location changed-> update user schema and archive
    if (location && !validation._id.equals(laptop.userId)) {
      // update user schema
      const { isArchived } = checkLocation(location);
      laptop.isArchived = isArchived;
      const userObj = await User.get(laptop.userId);
      userObj.numOfAssets -= 1;
      await userObj.save();
      const newUserObj = validation; // and then push userObj to new Team
      newUserObj.numOfAssets = userObj.numOfAssets + 1;
      await newUserObj.save();

      laptop.userId = newUserObj._id;
    }
    if (isRepair !== undefined) { laptop.isRepair = isRepair};
    if (laptop.isArchived || laptop.isRepair) {
      if (issues !== undefined) laptop.issues = issues;
      if (replace !== undefined) laptop.replace = replace;
      if (repairPrice !== undefined) laptop.repairPrice = repairPrice;
      if (repairCurrency !== undefined) laptop.repairCurrency = repairCurrency;
      if (repairDetails !== undefined) laptop.repairDetails = repairDetails;
      if (request !== undefined) laptop.request = request;
      if (resellPrice !== undefined) laptop.resellPrice = resellPrice;
      if (karrotPrice !== undefined) laptop.karrotPrice = karrotPrice;
      if (resellCurrency !== undefined) laptop.resellCurrency = resellCurrency;  
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

    const InfoObj = (await Info.list())[0];
    InfoObj.numOfLaptop -= 1;
    await InfoObj.save();

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
  remove,
  createList
};
