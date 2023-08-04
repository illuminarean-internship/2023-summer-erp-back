/* eslint-disable func-names */
/* eslint-disable object-shorthand */
import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true
    },
     team:{
      type: mongoose.Schema.Types.ObjectId,
          ref: 'team',
          required: true
    },
    location:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: false 
    },
    purchaseDate: {
      type: Date,
      required: true
    },
     price:{
      type: Number,
      required:true
    },
     remarks:{
      type: String,
      required: false
    }
    /*
    //Additional info
    location_is_team:{
      type: Boolean,
      default: false,
      required: true 
    },
    Archive:{
      type: [String],
      required:false
    },
    createAt: {
      type: Date,
      default: Date.now
    }
    */
  });  

export default mongoose.model('Book', bookSchema);
