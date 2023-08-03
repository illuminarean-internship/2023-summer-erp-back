



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
    serialNumber:{
      type:String,
      required: true
    },
    userId:{ //location
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    warranty:{
      type:String,
      required:false
    },
    price:{
      type: Number,
      required:true
    },
    surtax:{
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
    purchaseDate: {
      type: Date,
      required: true
    },
    purchaseFrom: {
      type :String,
      required :true
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
    /*team:{
      type: mongoose.Schema.Types.ObjectId,
          ref: 'Group', //should be updated to Group
          required: false
    },*/
    isUnreserved: {
      type: Boolean,
      default: false
    },
    isArchived: {
      type: Boolean,
      default: false
    },
    isRepair: {
      type: Boolean,
      default: false
    },
    archive:{
      type: [String],
      required:false
    },
    createAt: {
      type: Date,
      default: Date.now
    },
    dateAvail: {
      type: Date,
      required: false
    },
    daysLeft: {
      type: Number,
      default: 0,
      required: false
    },
  });


  laptopSchema.pre('save', function (next) {
    const today = new Date();
    const diffInMilliseconds = this.dateAvail - today;
    const diffInDays = Math.ceil(diffInMilliseconds / (1000 * 60 * 60 * 24));
    this.daysLeft = diffInDays;
    next();
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
    findQuery: function (query) {
      return this.find(query).exec();
    },
   
    delete: function (_id) {
      return this.deleteOne({ _id }).exec();
    }
  };




