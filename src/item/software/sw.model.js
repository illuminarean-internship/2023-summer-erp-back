/* eslint-disable func-names */
/* eslint-disable object-shorthand */
import mongoose from 'mongoose';

const SwSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  purchaseDate: {
    type: Date,
    required: true
  },
  unitPrice: {
    type: Number,
    required: true,
    default: 0
  },
  quantity: {
    type: Number,
    required: true,
    default: 1
  },
  currency: {
    type: String,
    required: false,
    default: 'KRW'
  },
  reference: {
    type: String,
    required: false,
    default: ''
  },
  totalPrice: {
    type: Number,
    default: 0
  },
  // Additional info,
  remarks: {
    type: String,
    required: false,
    default: ''
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

SwSchema.method({
});

SwSchema.statics = {
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
  update: function (_id, name, purchaseDate, price, remarks ) {
    return this.updateOne({ _id }, { $set: { name: name,
       purchaseDate: purchaseDate, price:price, remarks:remarks}}).exec();
  },
  */
  delete: function (_id) {
    return this.deleteOne({ _id }).exec();
  }
};

export default mongoose.model('SW', SwSchema);
