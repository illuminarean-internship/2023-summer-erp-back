/* eslint-disable func-names */
/* eslint-disable object-shorthand */
import mongoose from 'mongoose';

const BookSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
     Team:{
      type: mongoose.Schema.Types.ObjectId,
          ref: 'Team',
          required: false
    },
    Location:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false 
    },
    Purchase_date: {
      type: Date,
      required: true
    },
     price:{
      type: Number,
      required:true
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

export default mongoose.model('Book', BookSchema);
