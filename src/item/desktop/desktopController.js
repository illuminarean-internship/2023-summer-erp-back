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
    const { location } = req.query;
    //if(team){delete query.team;}
    if(location){delete query.location;}

    const desktops = await Desktop.findQuery(query);
    let desktopList = await Promise.all(
        desktops.map(async (item) => {
            const { _id, illumiSerial, CPU, mainboard, memory, SSD, HDD, power, desktopCase, purchaseDate, purchaseFrom, isUnreserved, isArchived, purpose, userId, remarks, locationIsTeam, archive, createAt } = item; // Destructure the original object
            const user = await User.get(userId);
        const location = user.name;
        //let team = "";
        //if(user.teamId){  
        //const teamObj = await Team.get(user.teamId);
        //team = teamObj.name;}
        let history=[];
        if(archive.length!=0){history= parseToObjectList(archive);}
        // Rearrange the keys, add the new key, and create a new object
        return { _id, illumiSerial, purchaseDate, purchaseFrom, isUnreserved, isArchived, purpose, location, CPU, mainboard, memory, SSD, HDD, power, desktopCase, remarks, userId, history, createAt };
      })
    );
   //if(team) desktopList = await desktopList.filter((item)=>item.team==team);
   //if(location) desktopList= await desktopList.filter((item)=>item.name==location);
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
      const { _id, illumiSerial, CPU, mainboard, memory, SSD, HDD, power, desktopCase, purchaseDate, purchaseFrom, purpose, userId, isUnreserved, isArchived, archive, createAt } = item;      
      const user = await User.get(userId);
      const location = user.name;
      //let team = "";
      //if(user.teamId){
      //const teamObj = await Team.get(user.teamId);
      //team = teamObj.name;}
      //const title = name;
      let history=[];
      //res.json(archive);
      if(archive.length!=0){history= parseToObjectList(archive);}
      // Rearrange the keys, add the new key, and create a new object
      const desktopInfo= { _id, illumiSerial, location, purchaseDate, purchaseFrom, purpose, CPU, mainboard, memory, SSD, HDD, power, desktopCase, isUnreserved, isArchived, userId, history, createAt };
      return res.json(desktopInfo); }
    const err = new APIError('No such desktop exists!', httpStatus.NOT_FOUND);
    return next(err);
  } catch (err) {
    return next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { illumiSerial, CPU, mainboard, memory, SSD, HDD, power, desktopCase, purchaseDate, purchaseFrom, purpose, remarks, location, history } = req.body;
    //Hidden problem!!same user name??? => should be replaced to userId

    //find the team is existing
    const userObj = await User.getByName(location);
    if (!userObj) {
      const errorMessage = `The location ${location} is not existing!`;
      //if not, return erro
      return next(new APIError(errorMessage, httpStatus.NOT_ACCEPTABLE));
    }

    //fill Desktopschema
    const userId = userObj._id;
    const desktop = new Desktop({ illumiSerial, CPU, mainboard, memory, SSD, HDD, power, desktopCase, purchaseDate, purchaseFrom, purpose, userId });
    if(remarks) desktop.remarks = remarks;
    const {isUnreserved,isArchived} = checkLocation(location);
    if(isUnreserved) desktop.isUnreserved=true;
    if(isArchived) desktop.isArchived=true;
    if(history) desktop.archive=parseToStringList(history);
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
    const { illumiSerial, location, CPU, mainboard, memory, SSD, HDD, power, desktopCase, purchaseDate, purchaseFrom, remarks, isArchivedd , endDate, startDate, history, locationRemarks  } = req.body;

    //Hidden problem!!same user name??? => should be ID 
    //validation : desktopId is valid? & location is valid?
    const desktop = await Desktop.get(desktopId);
    if(!desktop) return next(new APIError(`Id is invalid`, httpStatus.NOT_FOUND));
    const validation = await User.getByName(location);
    if(location&&!validation) return next(new APIError(`there is no user named ${location}`, httpStatus.NOT_ACCEPTABLE));
    
    //if contents changed-> just updated
    if(illumiSerial) desktop.illumiSerial=illumiSerial;
    if(CPU) desktop.CPU=CPU;
    if(mainboard) desktop.mainboard=mainboard;
    if(memory) desktop.memory=memory;
    if(SSD) desktop.SSD=SSD;
    if(HDD) desktop.HDD=HDD;
    if(power) desktop.power=power;
    if(desktopCase) desktop.desktopCase=desktopCase;

    if(purchaseDate) desktop.purchaseDate= purchaseDate; 
    if(purchaseFrom) desktop.purchaseFrom =purchaseFrom;
    if(remarks) desktop.remarks=remarks;

    //if location changed-> update user schema and archive
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

      //archive
      if(isArchivedd){
        if(desktop.archive.length==0){
            desktop.archive.push(desktop.purchaseDate.toLocaleDateString()+'/');
        }
        let endDatearchive = Date.now;
        let startDatearchive = Date.now;
        if(endDate) {endDatearchive =new Date(endDate);}
        if(startDate) {startDatearchive= new Date(startDate); }
        let historyRemarkss = "";
        if(locationRemarks) historyRemarkss= locationRemarks;
        desktop.archive[desktop.archive.length-1]= desktop.archive[desktop.archive.length-1]+endDatearchive.toLocaleDateString()+'/'+ userObj.name+ '/'+historyRemarkss;
        desktop.archive[desktop.archive.length]=(startDatearchive.toLocaleDateString()+"/");
      }
    }
    if(history){
        desktop.archive= parseToStringList(history);
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
