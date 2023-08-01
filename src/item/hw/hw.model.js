/* eslint-disable func-names */
/* eslint-disable object-shorthand */
import mongoose from 'mongoose';

const HWSchema = new mongoose.Schema({
    deviceImage:{
      type: String,
      required: true
    },
    modelName: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    serialNumber:{
      type:String,
      required: true
    },
    location:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false 
    },
    purchaseDate: {
      type: Date,
      required: true
    },
    purchaseFrom: {
      type :String,
      required :true
    },
    WScriptarranty:{
      type:String,
      required:false
    },
    price:{
      type: Number,
      required:true
    },
    illumiSerial :{
      type: String,
      required: false
    },
    color :{
      type: String,
      required: false
    },
    RAM:{
      type: Number,
      required: false
    },
    SSD:{
      type: Number,
      required: false
    },
    remarks:{
      type: String,
      required: false
    },
    //Additional info
    locationIsTeam:{
      type: Boolean,
      default: false,
      required: false
    },
    team:{
      type: mongoose.Schema.Types.ObjectId,
          ref: 'Group', //should be updated to Group
          required: false
    },
    archive:{
      type: [String],
      required:false
    },
    createAt: {
      type: Date,
      default: Date.now
    }
  });

export default mongoose.model('HW', HWSchema);
