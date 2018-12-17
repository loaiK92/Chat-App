const express = require("express");
const Router = express.Router();

// database models
const UserProfile = require("../../models/UserProfileModel");

// get request from browser and send back the usernames which are logged in
Router.get("/", (req, res, next) => {
  UserProfile.find().then(data => {
    let usernames = [];
    data.map(name => {
      usernames.push(name.username);
    });
    res.json(usernames);
  });
});

module.exports = Router;
