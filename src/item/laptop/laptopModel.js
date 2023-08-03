/* eslint-disable func-names */
/* eslint-disable object-shorthand */
import mongoose from 'mongoose';

const laptopSchema = new mongoose.Schema({
    /*deviceImage:{
      type: String,
      required: true
    },*/
    category: {
      type: String,
      required: true
    },
    modelName: {
      type: String,
      required: true
    },
    serialNumber:{
      type:String,
      required: true
    },
    userId:{
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
    warranty:{
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
    CPU :{
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
    /*locationIsTeam:{
      type: Boolean,
      default: false,
      required: false
    },*/
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

  laptopSchema.method({
  });
  
  laptopSchema.statics = {
    list: function ({ /*skip = 0, limit = 50*/ } = {}) {
      return this.find({})              
        .sort({ createdAt: -1 })
       // .skip(+skip)
       // .limit(+limit)
        .exec();
    },
  
    get: function (id) {
      return this.findById(id).exec();
    },
  /*
    update: function (_id, name, purchaseDate, price, remarks ) {
      return this.updateOne({ _id }, { $set: { name: name, purchaseDate: purchaseDate, price:price, remarks:remarks}}).exec();
    },
  */
    delete: function (_id) {
      return this.deleteOne({ _id }).exec();
    }
  };

export default mongoose.model('HW', HWSchema);
