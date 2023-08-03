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
    type: Number,
    required: false
  },
  SSD: {
    type: Number,
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
  totalPrice: {
    type: Number,
    required: false
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
  isUnreserved: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
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
