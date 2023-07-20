/* eslint-disable func-names */
/* eslint-disable object-shorthand */
import mongoose from 'mongoose';

const DesktopSchema= new mongoose.Schema({
    illumi_Serial:{
      type: String,
      required: true
    },
    CPU: {
      type: String,
      required: false
    },
    Mainboard: {
      type: String,
      required: false
    },
     Memory:{
      type: String,
      required: false
    },
    SSD:{
      type: String,
      required: false
    },
    HDD:{
      type: String,
      required: false
    },
    power:{
      type: String,
      required: false
    },
    case:{
      type: String,
      required: false
    },  
    Purchase_date: {
      type: Date,
      required: true
    },
    Purchase_from: {
      type :String,
      required :true
    }, 
    purpose: {
      type :String,
      required :true
    },
    Location:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

export default mongoose.model('Desktop', DesktopSchema);
