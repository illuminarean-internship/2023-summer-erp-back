/* eslint-disable func-names */
/* eslint-disable object-shorthand */
import mongoose from 'mongoose';

const AccSchema = new mongoose.Schema({
  model: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  illuSerialNumber: {
    type: String,
    required: false
  },
  serialNumber: {
    type: String,
    required: false
  },
  color: {
    type: String,
    required: false
  },
  price: {
    type: Number,
    required: false
  },
  surtax: {
    type: Number,
    required: false
  },
  totalPrice: {
    type: Number,
    required: false
  },
  purchaseDate: {
    type: Date,
    required: true
  },
  purchasedFrom: {
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
  },
  dateAvail: {
    type: Date,
    required: false
  },
  daysLeft: {
    type: Number,
    default: 0,
    required: false
  }
});

AccSchema.pre('save', function (next) {
  const today = new Date();
  const diffInMilliseconds = this.dateAvail - today;
  const diffInDays = Math.ceil(diffInMilliseconds / (1000 * 60 * 60 * 24));
  this.daysLeft = diffInDays;
  next();
});

AccSchema.method({
});

AccSchema.statics = {
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

export default mongoose.model('Acc', AccSchema);
