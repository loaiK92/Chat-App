const express = require("express");
const Router = express.Router();

// database models
const UserProfile = require("../../models/UserProfileModel");
const ChatGroup = require("../../models/ChatGroupModel");

// send a request to get group data
Router.get("/:groupId", async (req, res, next) => {
  // update the group by adding new user to group data but first check if this user is already in the group
  await ChatGroup.updateOne(
    { fakeID: req.params.groupId },
    { $addToSet: { users: req.query.currentUserID } }
  )
    .then(result => {
      return;
    })
    .catch(err => console.log(err));

  // get data from chat group
  await ChatGroup.find({ fakeID: req.params.groupId }).then(groupData => {
    // update user profile by adding this group to user data but first check if this group is already in user data
    UserProfile.updateOne(
      { _id: req.query.currentUserID },
      { $addToSet: { chatGroup: groupData[0]._id } }
    )
      .then(res => {
        return;
      })
      .catch(err => console.log(err));
    // get the participated users in this chat
    UserProfile.find({ _id: groupData[0].users })
      .then(usersData => {
        // send back group and user data
        res.json({ groupData, usersData });
      })
      .catch(err => console.log(err));
  });
});

module.exports = Router;
