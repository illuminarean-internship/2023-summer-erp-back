/* eslint-disable func-names */
/* eslint-disable object-shorthand */
import mongoose from 'mongoose';

const BookSchema = new mongoose.Schema({
  name: {
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
  price: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    required: false,
    default: '￦'
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

BookSchema.method({
});

BookSchema.statics = {
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

export default mongoose.model('Book', BookSchema);
