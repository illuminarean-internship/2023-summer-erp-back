/* eslint-disable func-names */
/* eslint-disable object-shorthand */
import mongoose from 'mongoose';

const laptopSchema = new mongoose.Schema({
/* deviceImage:{
    type: String,
    required: false
  }, */
  category: {
    type: String,
    required: false
  },
  model: {
    type: String,
    required: false
  },
  CPU: {
    type: String,
    required: false
  },
  RAM: {
    type: String,
    required: false
  },
  SSD: {
    type: String,
    required: false
  },
  currency: {
    type: String,
    default: "KRW"
  },
  serialNumber: {
    type: String,
    required: false
  },
  userId: { // location
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  warranty: {
    type: Date,
    required: false
  },
  price: {
    type: Number
  },
  surtax: {
    type: Number
  },
  illumiSerial: {
    type: String,
    required: false
  },
  color: {
    type: String,
    required: false
  },
  purchaseDate: {
    type: Date,
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
  totalPrice: {
    type: Number,
    default: 0
  },
  issues: {
    type: [String]
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
    type: Number
  },
  resellCurrency: {
    type: String
  },
  karrotPrice: {
    type: Number
  },

  // Additional info
  isArchived: {
    type: Boolean,
    default: false
  },
  isRepair: {
    type: Boolean,
    default: false
  },
  archive: {
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
  list: function ({ /* skip = 0, limit = 50 */ } = {}) {
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

  delete: function (_id) {
    return this.deleteOne({ _id }).exec();
  }
};

export default mongoose.model('laptop', laptopSchema);