const app = require("express")();
const http = require("http").Server(app);
const path = require("path");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const io = require("socket.io")(http);
require("dotenv").config({ path: "./variables.env" });

// database models
const UserProfile = require("../models/UserProfileModel");
const ChatGroup = require("../models/ChatGroupModel");

// Enable Cross Origing Rescource sharing
// p.s. this code is copied from CROS on ExpressJS
app.use((req, res, next) => {
  // Set the headers of our response to allow communication with our server from a different domain or port
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// connect mongoose to database
mongoose.connect(
  process.env.DATABASE,
  { useNewUrlParser: true }
);

// import router files and use it
// Note: each component file in "src/components" has its own router file here
const indexRoute = require("./routes/indexRoute");
const signupRoute = require("./routes/signupRoute");
const loginRoute = require("./routes/loginRoute");
const userProfileRoute = require("./routes/userProfileRoute");
const creategroupRoute = require("./routes/creategroupRoute");
const chatGroupRoute = require("./routes/chatGroupRoute");

app.use("/", indexRoute);
app.use("/signup", signupRoute);
app.use("/login", loginRoute);
app.use("/profile", userProfileRoute);
app.use("/create-chat-group", creategroupRoute);
app.use("/group", chatGroupRoute);

// empty object to update online user
const onlineUser = {};

// listen to a connection event on the server side
io.on("connection", socket => {
  // login event happen when the user open any chat group
  socket.on("login", user => {
    // add online user to the empty object
    onlineUser[socket.id] = user.userID;
    // update user profile with status: true
    UserProfile.updateOne({ username: user.name }, { status: true })
      .then(data => {
        return;
      })
      .catch(err => console.log(err));
    // then emit the event
    io.emit("login", user);
  });

  // listen for a disconnect
  socket.on("disconnect", () => {
    // update user profile with status: false
    UserProfile.updateOne({ _id: onlineUser[socket.id] }, { status: false })
      .then(data => {
        return;
      })
      .catch(err => console.log(err));

    // then emit the event
    io.emit("disconnect", onlineUser[socket.id]);
  });

  // listen for delete message event
  socket.on("delete message", data => {
    // delete the message from the chat group
    ChatGroup.updateOne(
      { fakeID: data.groupID },
      { $pull: { messages: { msgFakeID: data.msgFakeID } } }
    )
      .then(data => {
        return;
      })
      .catch(err => console.log(err));
    // then emit the event
    io.emit("delete message", data);
  });

  // listen for edit message event
  socket.on("edit message", data => {
    const messagesArray = [];
    // get chat group data
    ChatGroup.find({ fakeID: data.groupID })
      .then(result => {
        // check the messages
        result[0].messages.map(item => {
          // if find the message ID, update this message content
          if (item.msgFakeID === data.msgID) {
            item.content = data.message;
          }
          // push the item to the new array "messagesArray"
          messagesArray.push(item);
        });
        // then set the group messages to the new array
        ChatGroup.updateOne(
          { fakeID: data.groupID },
          { messages: messagesArray }
        )
          .then(res => {
            return;
          })
          .catch(err => console.log(err));
      })
      .catch(err => console.log(err));
    // then emit the event
    io.emit("edit message", data);
  });

  // listen for a "chat message" event
  socket.on("chat message", message => {
    // save the messages in database
    ChatGroup.updateOne(
      { fakeID: message.groupId },
      { $push: { messages: message } }
    ).then(data => {
      return;
    });
    // then emit the event
    io.emit("chat message", message);
  });

  //Listen to a user typing
  socket.on("typing", data => {
    // then emit the event
    io.emit("typing", data);
  });
});

// connect to database
const db = mongoose.connection;
db.on("error", err => {
  console.log(`connection error is ${err}`);
});
db.once("open", () => {
  console.log(`Database connection is open!!!`);
});

// run the server
const port = process.env.PORT || 9999;
http.listen(port, () => {
  console.log(`Server is running on port ${port}!!!`);
});
