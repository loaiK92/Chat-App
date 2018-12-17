const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// chat group schema
const chatGroupSchema = new Schema({
  createdBy: {
    type: String,
    required: true
  },
  groupName: {
    type: String,
    uppercase: true,
    required: true
  },
  createdOn: {
    type: Date,
    default: Date.now
  },
  fakeID: String,
  currentUser: {
    currentUserName: String,
    currentUserID: String
  },
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: "userProfile"
    }
  ],
  messages: [
    {
      content: String,
      date: {
        type: Date,
        default: Date.now
      },
      username: String,
      msgFakeID: String,
      groupId: String
    }
  ]
});

module.exports = mongoose.model("chatGroup", chatGroupSchema);
