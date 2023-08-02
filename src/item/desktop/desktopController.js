import httpStatus from 'http-status';
import APIError from '../../helpers/apiErrorHelper.js';
import User from '../../user/user.model.js';
import Team from '../../user/team.model.js';
import Desktop from './desktop.model.js';
import { parseToObjectList , parseToStringList } from '../history.function.js';
import {checkLocation} from "../sub.function.js"

const list = async (req, res, next) => {
  try {
    const query = req.query;
    const { title, team, location } = req.query;
    if(title){delete query.title; query.name=title;}
    if(team){delete query.team;}
    if(location){delete query.location;}
    const desktops = await Desktop.findQuery(query);
    let desktopList = await Promise.all(
        desktops.map(async (item) => {
            const { _id, illumiSerial, CPU, mainboard, memory, SSD, HDD, power, desktopCase, purchaseDate, purchaseFrom, purpose, remarks, locationIsTeam, isUnreserved, isArchived, userId, log, createAt } = item; // Destructure the original object
            const user = await User.get(userId);
        const location = user.name;
        let team = "";
        if(user.teamId){
        const teamObj = await Team.get(user.teamId);
        team = teamObj.name;}
        let history=[];
        if(log.length!=0){history= parseToObjectList(log);}
        // Rearrange the keys, add the new key, and create a new object
        return { _id, illumiSerial, CPU, mainboard, memory, SSD, HDD, power, desktopCase, purchaseDate, purchaseFrom, purpose, location, remarks, locationIsTeam, isUnreserved, isArchived, userId, log, createAt };
      })
    );
   if(team) desktopList = await desktopList.filter((item)=>item.team==team);
   if(location) desktopList= await desktopList.filter((item)=>item.name==location);
    res.json(desktopList);
  } catch (err) {
    next(err);
  }
};

const get = async (req, res, next) => {
  try {
    const { desktopId } = req.params;
    const desktop = await Desktop.get(desktopId);
    if (desktop){ 
      const item = desktop;
      const { _id, illumiSerial, CPU, mainboard, memory, SSD, HDD, power, desktopCase, purchaseDate, purchaseFrom, purpose, remarks, locationIsTeam, isUnreserved, isArchived, userId, log, createAt } = item;      const user = await User.get(userId);
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
      const desktopInfo= { _id, illumiSerial, CPU, mainboard, memory, SSD, HDD, power, desktopCase, purchaseDate, purchaseFrom, purpose, remarks, locationIsTeam, isUnreserved, isArchived, userId, log, createAt };
      return res.json(desktopInfo);}
    const err = new APIError('No such desktop exists!', httpStatus.NOT_FOUND);
    return next(err);
  } catch (err) {
    return next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { title, location, purchaseDate, purchasedFrom, remarks, history } = req.body;
    //Hidden problem!!same user name??? => should be replaced to userId

    //find the team is existing
    const userObj = await User.getByName(location);
    if (!userObj) {
      const errorMessage = `The location ${location} is not existing!`;
      //if not, return error
      return next(new APIError(errorMessage, httpStatus.NOT_ACCEPTABLE));
    }

    //fill Desktopschema
    const userId = userObj._id;
    const desktop = new Desktop({ name, purchaseDate, purchasedFrom, userId});
    if(remarks) desktop.remarks = remarks;
    const {isUnreserved,isArchived} = checkLocation(location);
    if(isUnreserved) desktop.isUnreserved=true;
    if(isArchived) desktop.isArchived=true;
    if(history) desktop.log=parseToStringList(history);
    const savedDesktop = await desktop.save();

    //update item list of user
    userObj.numOfAssets=userObj.numOfAssets+1;
    await userObj.save();
    return res.json(savedDesktop);
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { desktopId } = req.params;
    const { name, location, purchaseDate, purchasedFrom, remarks, isLogged , endDate, startDate, history, locationRemarks } = req.body;

    //Hidden problem!!same user name??? => should be ID 
    //validation : desktopId is valid? & location is valid?
    const desktop = await Desktop.get(desktopId);
    if(!desktop) return next(new APIError(`Id is invalid`, httpStatus.NOT_FOUND));
    const validation = await User.getByName(location);
    if(location&&!validation) return next(new APIError(`there is no user named ${location}`, httpStatus.NOT_ACCEPTABLE));
    
    //if contents changed-> just updated
    if(name) desktop.name=name;
    if(purchaseDate) desktop.purchaseDate= purchaseDate; 
    if(purchasedFrom) desktop.purchasedFrom =purchasedFrom;
    if(remarks) desktop.remarks=remarks;

    //if location changed-> update user schema and logg
    if(location&&!validation._id.equals(desktop.userId)){
      // update user schema
      const {isUnreserved,isArchived} = checkLocation(location);
      if(isUnreserved) desktop.isUnreserved=true;
      if(isArchived) desktop.isArchived=true;

      const userObj = await User.get(desktop.userId);
      userObj.numOfAssets= userObj.numOfAssets-1;
      await userObj.save();
      
      const new_userObj = validation; // and then push userObj to new Team
      new_userObj.numOfAssets = userObj.numOfAssets+1;
      await new_userObj.save();

      desktop.userId=new_userObj._id;

      //log
      if(isLogged){
        if(desktop.log.length==0){
            desktop.log.push(desktop.purchaseDate.toLocaleDateString()+'/');
        }
        let endDateLog = Date.now;
        let startDateLog = Date.now;
        if(endDate) {endDateLog =new Date(endDate);}
        if(startDate) {startDateLog= new Date(startDate); }
        let historyRemarkss = "";
        if(locationRemarks) historyRemarkss= locationRemarks;
        desktop.log[desktop.log.length-1]= desktop.log[desktop.log.length-1]+endDateLog.toLocaleDateString()+'/'+ userObj.name+ '/'+historyRemarkss;
        desktop.log[desktop.log.length]=(startDateLog.toLocaleDateString()+"/");
      }
    }
    if(history){
        desktop.log= parseToStringList(history);
    }
    const desktopSaved = await desktop.save();
    return res.json(desktopSaved);
  } catch (err) {
    return next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { desktopId } = req.params;
    const desktop = await Desktop.get(desktopId);
    if(!desktop) return next( new APIError('No such desktop exists!', httpStatus.NOT_FOUND));
    const userObj = await User.get(desktop.userId);
    userObj.numOfAssets= userObj.numOfAssets-1;
    await userObj.save();
    const result = await Desktop.delete(desktopId);
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
