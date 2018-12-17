# Chat-App

This project is an assignment, which is chat application based on `react.js`, `node.js` and `mongoDB`

### Implemented requirements :

- Chat list:
  - list chats in which you are participant (there can be multiple participants in a chat)
  - clicking on an item in the chat list will take you to the overview of the chat details
- Chat detail overview:
  - list all messages in the chat.
  - functionality to send a new chat message

### Implemented extensions :

- Build a profile page for each user
- Allow editing and deleting of messages

## Getting Started :

1- Clone this repo `git clone https://github.com/loaiK92/Chat-App.git`

2- Create `variables.env` file in the folder route which should contain : `MongoDB URI` & `port`

- Example:
  - `DATABASE = mongodb://<dbuser>:<dbpassword>@ds254215.mlab.com:254215/database name`
  - `PORT = 8000`

3- Install dependencies `npm install`

4- Run the server `npm run server`
