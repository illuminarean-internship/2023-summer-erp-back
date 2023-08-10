/* eslint-disable func-names */
/* eslint-disable object-shorthand */
import mongoose from 'mongoose';

const InfoSchema = new mongoose.Schema({
  numOfAcc: {
    type: Number,
    default: 0
  },
  numOfTestDev: {
    type: Number,
    default: 0
  },
  numOfLaptop: {
    type: Number,
    default: 0
  },
  numOfDesktop: {
    type: Number,
    default: 0
  },
  numOfBook: {
    type: Number,
    default: 0
  },
  numOfSW: {
    type: Number,
    default: 0
  }
});

InfoSchema.method({
});

InfoSchema.statics = {
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

  findQuery: function (query) {
    return this.find(query).exec();
  },
  /*
  updateContents: function (_id, name, purchaseDate, price, remarks ) {
  return this.updateOne({ _id }, { $set: { name: name, 
    purchaseDate: purchaseDate, price:price, remarks:remarks}}).exec();
  },

  updateLocation: function (_id, teamName, location, userId ) {
  return this.updateOne({ _id }, {  $set: { teamName: teamName, 
    location: location, userId: userId}}).exec();
  },
  */
  delete: function (_id) {
    return this.deleteOne({ _id }).exec();
  }
};

export default mongoose.model('Info', InfoSchema);
