import httpStatus from 'http-status';
import APIError from '../../helpers/apiErrorHelper.js';
import User from '../../user/user.model.js';
import Team from '../../user/team.model.js';
import HW from './hw.model.js';


const list = async (req, res, next) => {
  try {
    const { limit = 50, skip = 0 } = req.query;
    const HWs = await HW.list({ limit, skip });

    const HWlist = await Promise.all(
      HWs.map(async (item) => {
        const { _id, deviceImage, category, serialNumber, purchaseFrom, warranty, price, illumiSerial, color, RAM, SSD, isUnreserved, isArchived, userId, log, createAt } = item; // Destructure the original object
        const user = await User.get(userId);

        const location = user.name;

        // Rearrange the keys, add the new key, and create a new object
        return { _id, deviceImage, category, serialNumber, purchaseFrom, warranty, price, illumiSerial, color, RAM, SSD, isUnreserved, isArchived, userId, log, createAt, location }; // which to return?
      })
    );
    res.json(HWlist);
  } catch (err) {
    next(err);
  }
};


const filterUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const HWs = await HW.list();
    //change this line
    const userHWs = await HWs.filter((item)=>item.userId.equals(userId));
    const userHWlist = await Promise.all(
      userhws.map(async (item) => {
        const { _id, deviceImage, category, serialNumber, purchaseFrom, warranty, price, illumiSerial, color, RAM, SSD, isUnreserved, isArchived, userId, log, createAt } = item; // Destructure the original object
        const user = await User.get(userId);
        const location = user.name;
        let teamName = "";
        if(user.teamId){
        const team = await Team.get(user.teamId);
        teamName = team.name;}
        // Rearrange the keys, add the new key, and create a new object
        return { _id, deviceImage, category, serialNumber, purchaseFrom, warranty, price, illumiSerial, color, RAM, SSD, isUnreserved, isArchived, userId, log, createAt, location }; // which to return?
      })
    );
    res.json(userHWlist);
  } catch (err) {
    next(err);
  }
};

const get = async (req, res, next) => {
  try {
    const { HWId } = req.params;
    const HW = await HW.get(HWId);
    if (HW) return res.json(HW);
    const err = new APIError('No such HW exists!', httpStatus.NOT_FOUND);
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

    //fill HWschema
    const userId = userObj._id;
    const HW = new HW({ name, purchaseDate, price, userId});
    if(remarks) HW.remarks = remarks;
    const {isUnreserved,isArchived} = checkLocation(location);
    if(isUnreserved) HW.isUnreserved=true;
    if(isArchived) HW.isArchived=true;
    const savedHW = await HW.save();

    //update item list of user
    userObj.numOfAssets=userObj.numOfAssets+1;
    await userObj.save();
    return res.json(savedHW);
  } catch (err) {
    return next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { HWId } = req.params;
    const { name, location, purchaseDate, price, remarks, isLogged } = req.body;

    //Hidden problem!!same user name??? => should be ID 
    //validation : hwId is valid? & location is valid?
    const hw = await hw.get(HWId);
    if(!hw) return next(new APIError(`Id is invalid`, httpStatus.NOT_FOUND));
    const validation = await User.findOne({name: location}).exec();
    if(location&&!validation) return next(new APIError(`there is no user named ${location}`, httpStatus.NOT_ACCEPTABLE));
    
    //if contents changed-> just updated
    if(name) hw.name=name;
    if(purchaseDate) hw.purchaseDate= purchaseDate; 
    if(price) hw.price=price;
    if(remarks) hw.remarks=remarks;

    //if location changed-> update user schema and logg
    if(location){
      //log
      if(isLogged){
        if(hw.archive.empty()){

        }
      }
      // update user schema
      const userObj = await User.get(hw.userId);
      userObj.numOfAssets= userObj.numOfAssets-1;
      await userObj.save();
      
      const new_userObj = validation; // and then push userObj to new Team
      new_userObj.numOfAssets = userObj.numOfAssets+1;
      await new_userObj.save();

      hw.userId=validation._id;
    }
    const hwSaved = await hw.save();
    return res.json(hwSaved);
  } catch (err) {
    return next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const { HWId } = req.params;
    const hw = await hw.get(HWId);
    if(!hw) return next( new APIError('No such HW exists!', httpStatus.NOT_FOUND));
    const userObj = await User.get(hw.userId);
    userObj.numOfAssets= userObj.numOfAssets-1;
    await userObj.save();
    const result = await HW.delete(HWId);
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
