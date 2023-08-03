/* eslint-disable func-names */
/* eslint-disable object-shorthand */
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: false,
  },
  projectIdList: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Project',
    default: []
  },
  field: {
    type: String,
    required: false,
    default: ''
  },
  numOfAssets: {
    type: Number,
    default: 0,
    required: true
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
  list: function () {
    return this.find()
      .sort({ createdAt: -1 })
    // .skip(+skip)
    // .limit(+limit)
      .exec();
  },

  get: function (id) {
    return this.findById(id).exec();
  },

  getByName: function (name) {
    return this.findOne({ name: name }).exec();
  },

  rename: function (_id, name) {
    return this.updateOne({ _id }, { $set: { name: name} }).exec();
  },

  update: function (_id, name, teamId) {
    return this.updateOne({ _id }, { name, teamId }).exec();
  },

  delete: function (_id) {
    return this.deleteOne({ _id }).exec();
  }
};

export default mongoose.model('User', UserSchema);
