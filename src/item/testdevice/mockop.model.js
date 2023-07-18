/* eslint-disable func-names */
/* eslint-disable object-shorthand */
import mongoose from 'mongoose';


const MockupSchema = new mongoose.Schema({
    device_image:{
      type: String,
      required: true
    },
    modelname: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
     Team:{
      type: mongoose.Schema.Types.ObjectId,
          ref: 'Group', //should be updated to Group
          required: false
    },
    Location:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
    SerialNumber:{
      type:String,
      required: true
    },
    Purchase_date: {
      type: Date,
      required: true
    },
    Purchase_from: {
      type :String,
      required :true
    },
    illumi_Serial :{
      type: String,
      required: false
    },
    color :{
      type: String,
      required: false
    },
     Remarks:{
      type: String,
      required: false
    },
    //Additional info
    location_is_team:{
      type: Boolean,
      default: false,
      required: false
    },
    Archive:{
      type: [String],
      required:false
    },
    createAt: {
      type: Date,
      default: Date.now
    }
  });
  

export default mongoose.model('Mockup', MockupSchema);
