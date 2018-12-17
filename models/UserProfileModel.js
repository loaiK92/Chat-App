const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// user profile schema
const userProfileSchema = new Schema({
  username: {
    type: String,
    unique: true
  },
  image: {
    type: String
  },
  createdOn: {
    type: Date,
    default: Date.now
  },
  status: Boolean,
  chatGroup: [
    {
      type: Schema.Types.ObjectId,
      ref: "chatGroup"
    }
  ]
});

module.exports = mongoose.model(" userProfile", userProfileSchema);
