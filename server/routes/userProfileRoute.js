const express = require("express");
const Router = express.Router();
const bodyParser = require("body-parser");

// database models
const UserProfile = require("../../models/UserProfileModel");
const ChatGroup = require("../../models/ChatGroupModel");

Router.use(bodyParser.json());

// get a request from browser
Router.get("/:username", async (req, res, next) => {
  // set up the data in const
  const username = req.params.username;
  // find user data in database with the groups that he participated in
  await UserProfile.find({ username: username })
    .populate("chatGroup")
    .then(userData => {
      if (!userData.length) {
        res.json("error");
      } else {
        // get all groups in database and send it back with user data
        ChatGroup.find().then(result => {
          res.json({ userData, result });
        });
      }
    })
    .catch(err => console.log(err));
});

Router.post("/delete-acount/:username", (req, res, next) => {
  UserProfile.remove({ username: req.params.username })
    .then(result => {
      res.json("done");
    })
    .catch(err => console.log(err));
});

module.exports = Router;
