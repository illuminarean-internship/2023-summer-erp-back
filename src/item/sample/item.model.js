/* eslint-disable func-names */
/* eslint-disable object-shorthand */
import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
  modelname: {
    type: String,
    required: true
  },
  SerialNumber: {
    type: String,
    required: true
  },
  purchasedAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

ItemSchema.method({
});

ItemSchema.statics = {
  list: function ({ skip = 0, limit = 50 } = {}) {
    return this.find({})
      .sort({ purchasedAt: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  },

  get: function (id) {
    return this.findById(id).exec();
  },

  update: function (_id, modelname, SerialNumber) {
    return this.updateOne({ _id }, { modelname, SerialNumber }).exec();
  },

  delete: function (_id) {
    return this.deleteOne({ _id }).exec();
  }
};

export default mongoose.model('Item', ItemSchema);
