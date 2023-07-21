/* eslint-disable func-names */
/* eslint-disable object-shorthand */
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  teamName: {
    type : String, 
    required: true
  },
  numOfAssets: {
    type:Number,
    default: 0,
    required:true
  },
  createdAt: {
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

UserSchema.method({
});

UserSchema.statics = {
  list: function ({ skip = 0, limit = 50 } = {}) {
    return this.find({})
      .sort({ createdAt: -1 })
      .skip(+skip)
      .limit(+limit)
      .exec();
  },

  get: function (id) {
    return this.findById(id).exec();
  },

  update: function (_id, name, teamName) {
    return this.updateOne({ _id }, { name, teamName }).exec();
  },

  delete: function (_id) {
    return this.deleteOne({ _id }).exec();
  }
};

export default mongoose.model('User', UserSchema);
