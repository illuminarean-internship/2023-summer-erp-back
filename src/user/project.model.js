/* eslint-disable func-names */
/* eslint-disable object-shorthand */
import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
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

ProjectSchema.method({
});

ProjectSchema.statics = {
  list: function ({ skip = 0, limit = 50 } = {}) {
    return this.find({})
      .skip(+skip)
      .limit(+limit)
      .exec();
  },

  get: function (_id) {
    return this.findById(_id).exec();
  },

  update: function (_id, name) {
    return this.updateOne({ _id }, { name }).exec();
  },

  delete: function (_id) {
    return this.deleteOne({ _id }).exec();
  }
};

export default mongoose.model('Project', ProjectSchema);
