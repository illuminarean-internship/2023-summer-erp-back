/* eslint-disable func-names */
/* eslint-disable object-shorthand */
import mongoose from 'mongoose';

const MockupSchema = new mongoose.Schema({
  model: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  RAM: {
    type: String,
    required: false
  },
  memory: {
    type: String,
    required: false
  },
  serialNumber: {
    type: String,
    required: false
  },
  condition: {
    type: String,
    required: false
  },
  color: {
    type: String,
    required: false
  },
  currency: {
    type: String,
    required: false
  },
  totalPrice: {
    type: Number,
    required: false
  },
  purchaseDate: {
    type: Date
  },
  purchasedFrom: {
    type: String,
    required: false
  },
  remarks: {
    type: String,
    required: false
  },
  // Additional info,
  isRepair: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  issues: {
    type: String
  },
  replace: {
    type: String
  },
  request: {
    type: String
  },
  repairPrice: {
    type: Number
  },
  repairCurrency: {
    type: String
  },
  repairDetails: {
    type: String
  },
  resellPrice: {
    type: String
  },
  resellCurrency: {
    type: String
  },
  karrotPrice: {
    type: String
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  log: {
    type: [String],
    required: false,
    default: []
  },
  createAt: {
    type: Date,
    default: Date.now
  }
});

MockupSchema.method({
});

MockupSchema.statics = {
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

export default mongoose.model('Mockup', MockupSchema);
