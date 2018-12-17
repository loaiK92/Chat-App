const express = require("express");
const Router = express.Router();

Router.get("/", (req, res) => {
  // send the user a response
  res.send("hello world!");
});

module.exports = Router;
