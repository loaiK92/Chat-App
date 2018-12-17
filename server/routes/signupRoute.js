const express = require("express");
const Router = express.Router();
const multer = require("multer");
const fs = require("fs");

// database models
const UserProfile = require("../../models/UserProfileModel");

// function to select a storage destination where to save user image, and modify image name
const imageStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./src/uploads");
  },
  filename: function(req, file, cb) {
    cb(
      null,
      new Date()
        .toISOString()
        .replace(/:/g, "-")
        .replace(/\./g, "-") + file.originalname
    );
  }
});

// function to filter the file extension
const fileFilter = (req, file, cb) => {
  if (file) {
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/gif" ||
      file.mimetype === "image/svg"
    ) {
      cb(null, true);
    } else {
      cb(new Error("file Type Error"), false);
    }
  } else {
    cb(new Error("no file"), false);
  }
};

// set up the middleware with the storage and fileFilter functions and fileSize
const uploadImage = multer({
  storage: imageStorage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});

// get the data from browser
Router.post("/", uploadImage.single("userImage"), async (req, res, next) => {
  // set up the data in consts
  const image = req.file;
  const body = req.body;
  const fileExtension = image.mimetype.split("/")[1];

  // convert image to base64
  const imageName = new Buffer.from(
    fs.readFileSync(image.path, function callback(err) {
      if (err) throw err;
    })
  ).toString("base64");

  // call create user profile function and pass it the data
  const userProfile = createUserProfile(body, fileExtension, imageName);
  // save in database
  await userProfile.save();

  fs.unlink(image.path); // delete image after convert it to base64

  res.send("Successfully Done");
});

// create user profile function
const createUserProfile = (data, fileExtension, imageName) => {
  return new UserProfile({
    username: data.username,
    createdOn: data.date,
    image: `data:image/${fileExtension};base64, ${imageName}`
  });
};

module.exports = Router;
