/* eslint-disable func-names */
/* eslint-disable object-shorthand */
import mongoose from 'mongoose';

const DesktopSchema= new mongoose.Schema({
    illumiSerial:{
      type: String,
      required: true
    },
    CPU: {
      type: String,
      required: false
    },
    mainboard: {
      type: String,
      required: false
    },
    memory:{
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
     desktopCase:{
      type: String,
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
    purpose: {
      type :String,
      required :true
    },
    location:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
    archive:{
      type: [String],
      required:false
    },
    createAt: {
      type: Date,
      default: Date.now
    }
  });

export default mongoose.model('Desktop', DesktopSchema);
