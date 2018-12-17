const express = require("express");
const Router = express.Router();
const uuidv4 = require("uuid/v4");
const _ = require("underscore");

// database models
const UserProfile = require("../../models/UserProfileModel");
const ChatGroup = require("../../models/ChatGroupModel");

Router.post("/", async (req, res, next) => {
  // find the user who create the chat and add his _id to request.body
  await UserProfile.find({ username: req.body.user })
    .then(result => {
      req.body.user = result[0]._id;
    })
    .catch(err => console.log(err));
  // generate an unique fake ID to the chat and add it to request.body
  req.body.fakeID = `${uuidv4()}`;
  // call createChatGroup function and create the chat
  const chatGroup = createChatGroup(req.body);
  // save chat in database
  await chatGroup.save();

  // get user ID from all chat groups that he participated in
  await ChatGroup.find({ users: { _id: req.body.user } })
    .then(result => {
      let IDs = [];
      result.map(item => {
        IDs.push(item._id);
      });
      // update user profile to add the groups that he participated in
      UserProfile.updateOne({ _id: req.body.user }, { chatGroup: IDs })
        .then(res => {
          return;
        })
        .catch(err => console.log(err));
      res.json({ result, fakeID: req.body.fakeID });
    })
    .catch(err => console.log(err));
});

// create chat function
const createChatGroup = data => {
  return new ChatGroup({
    createdBy: data.createdBy,
    groupName: data.groupName,
    createdOn: data.createdOn,
    fakeID: data.fakeID,
    users: data.user
  });
};

module.exports = Router;
