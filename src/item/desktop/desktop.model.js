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
    userId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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
    isUnreserved:{
      type: Boolean,
      default: false
    },
    isArchived:{
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
    }
  });

  DesktopSchema.method({
  });
  
  DesktopSchema.statics = {
    list: function () {
      return this.find({})
        .sort({ createdAt: -1 })
       // .skip(+skip)
       // .limit(+limit)
        .exec();
    },
  
    get: function (id) {
      return this.findById(id).exec();
    },
  
    findQuery: function(query){
      return this.find(query).exec();
    },
  /*
    updateContents: function (_id, name, purchaseDate, price, remarks ) {
      return this.updateOne({ _id }, { $set: { name: name, purchaseDate: purchaseDate, price:price, remarks:remarks}}).exec();
    },
  
    updateLocation: function (_id, teamName, location, userId ) {
      return this.updateOne({ _id }, {  $set: { teamName: teamName, location: location, userId: userId}}).exec();
    },
  */
    delete: function (_id) {
      return this.deleteOne({ _id }).exec();
    }
  };
export default mongoose.model('Desktop', DesktopSchema);
