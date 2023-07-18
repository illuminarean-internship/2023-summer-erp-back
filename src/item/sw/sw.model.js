/* eslint-disable func-names */
/* eslint-disable object-shorthand */
import mongoose from 'mongoose';


const SWSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    unit_price:{
      type: Number,
      required:true
    },
    amount:{
      type: Number,
      default:1,
      required:true
    },
    Currency:{
      type: Number,
      required:true
    },
    Purchase_date: {
      type: Date,
      required: true
    },
    User:{
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
    Team:{
      type: mongoose.Schema.Types.ObjectId,
          ref: 'Group', //should be updated to Group
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

export default mongoose.model('SW', SWSchema);
