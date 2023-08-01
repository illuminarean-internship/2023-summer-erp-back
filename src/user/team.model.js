/* eslint-disable func-names */
/* eslint-disable object-shorthand */
import mongoose from 'mongoose';

const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  connectingId : { 
    type: mongoose.Schema.Types.ObjectId,
    ref:'User',
    required: false
  },
  numOfMembers :{
    type: Number,
    default: 0
  }
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

TeamSchema.method({
});

TeamSchema.statics = {
  list: function ({ skip = 0, limit = 50 } = {}) {
    return this.find({})
      .skip(+skip)
      .limit(+limit)
      .exec();
  },

  get: function (_id) {
    return this.findById(_id).exec();
  },

  getbyName: function (name) {
    return this.findOne({name:name}).exec();
  },

  update: function (_id, name) {
    return this.updateOne({ _id }, { name }).exec();
  },

  delete: function (_id) {
    return this.deleteOne({ _id }).exec();
  }
};

export default mongoose.model('Team', TeamSchema);
