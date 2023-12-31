/* eslint-disable func-names */
/* eslint-disable object-shorthand */
import mongoose from 'mongoose';

const DesktopSchema = new mongoose.Schema({
  illumiSerial: {
    type: String,
    required: true
  },
  purchaseDate: {
    type: Date,
    required: true
  },
  purchasedFrom: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    required: true,
    default: ''
  },
  remarks: {
    type: String,
    required: true,
    default: ''
  },
  details: {
    type: Array,
    default: []
  },
  totalPrice: {
    type: String
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  isRepair: {
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
  isArchived: {
    type: Boolean,
    default: false
  },
  log: {
    type: [String],
    required: false
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

  findQuery: function (query) {
    return this.find(query).exec();
  },

  delete: function (_id) {
    return this.deleteOne({ _id }).exec();
  }
};
export default mongoose.model('Desktop', DesktopSchema);
