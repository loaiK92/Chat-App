import React from "react";
import io from "socket.io-client";
import axios from "axios";
import moment from "moment";
import { Link } from "react-router-dom";
import styled from "styled-components";
import uuidv4 from "uuid/v4";

// styled components :
const UserImg = styled.img`
  width: 75px;
  height: 75px;
  margin: 10px auto;
  border-radius: 50%;
  @media (max-width: 600px) {
    width: 50px;
    height: 50px;
  }
`;
const UsersWrapper = styled.ul`
  min-height: 150px;
  height: 25vh;
  margin: 0;
  padding: 0 2vw;
  overflow-x: scroll;
  &::-webkit-scrollbar {
    display: none;
  }
  @media (max-width: 600px) {
    h3 {
      font-size: 1rem !important;
    }
    h5 {
      font-size: 0.9rem !important;
    }
  }
`;
const MessagesWrapper = styled.div`
  height: 70vh;
  margin: 0;
  padding: 0 2vw 5px;
`;
const MEssagesContainer = styled.ul`
  overflow: scroll;
  &::-webkit-scrollbar {
    display: none;
  }
`;
const Message = styled.li`
  width: 99%;
  padding: 0.7% 1%;
  margin: 0.8%;
  list-style: none;
  border: 1px solid #ccc;
  font-size: 1.4rem;
  box-shadow: -1px 2px 7px #cecece;
  border-radius: 20px;
  border-bottom-left-radius: 3px;
  &:hover > .btnWrapper {
    opacity: 1;
  }
  @media (max-width: 600px) {
    font-size: 1rem;
  }
`;

const BtnWrapper = styled.div`
  opacity: 0;
  transition: all 0.4s ease-out;
`;

const EditCancelBtn = styled.button`
  margin: 0 5px;
  cursor: pointer;
  background-color: transparent;
  border: none;
`;

const TypingAlert = styled.div`
  width: fit-content;
  position: sticky;
  top: 0;
  left: 49%;
  border: 2px solid #ccc;
  border-top: 0;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  padding: 0.2% 2%;
  background: #efefef;
  color: rgba(76, 64, 64, 0.72);
`;

class ChatGroup extends React.Component {
  state = {
    groupId: "",
    groupName: "",
    createdBy: "",
    createdOn: null,
    users: [],
    messages: [],
    typing: {
      status: false,
      username: ""
    },
    currentUser: {}
  };
  // connect to server
  socket = io("http://localhost:8000");

  componentDidMount() {
    // get group ID from the params
    const groupId = this.props.match.params.groupId;
    // get current username data from session storage
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

    // set the state with group ID and current user
    this.setState({ groupId, currentUser });

    // send a request to get group data from the server
    axios
      .get(
        `http://localhost:8000/group/${groupId}?currentUserName=${
          currentUser.name
        }&currentUserID=${currentUser.userID}`
      )
      .then(result => {
        // emit login event when you open the group
        const user = this.state.currentUser;
        this.socket.emit("login", user);

        const users = [];
        // take a copy of the returned data
        const groupData = result.data.groupData[0];
        const usersData = result.data.usersData;
        // push usersData to users array
        usersData.map(item => {
          users.push({
            username: item.username,
            image: item.image,
            createdOn: item.createdOn,
            status: item.status,
            id: item._id
          });
        });

        // delete current user from the users array
        users.map((item, i) => {
          if (item.username === this.state.currentUser.name) {
            users.splice(i, 1);
          }
        });

        // set all messages editing property to false
        // Note: set editing property to true when you click on edit message to show up the editing form
        groupData.messages.map(item => {
          item.editing = false;
        });

        // set the state with group data
        this.setState({
          groupName: groupData.groupName,
          createdBy: groupData.createdBy,
          createdOn: groupData.createdOn,
          users,
          messages: groupData.messages
        });
      })
      .catch(err => console.log(err));

    this.socket.on("typing", data => {
      this.setState({ typing: { status: data.status, user: data.username } });
    });

    // call login event
    this.socket.on("login", user => {
      // take a copy of users from the state
      const users = [...this.state.users];
      // find the user who's logged in and update his status to true
      users.map(item => {
        if (item.username === user.name) {
          item.status = true;
        }
      });
      // then set the state with updated user
      this.setState({ users });
    });

    // call delete message event
    this.socket.on("delete message", message => {
      // take a copy of old messages from the state
      const oldMessages = [...this.state.messages];
      // find the message which's deleted and delete it from the state
      oldMessages.map((item, i) => {
        if (item.msgFakeID === message.msgFakeID) {
          oldMessages.splice(i, 1);
        }
      });
      // then set the state after delete message
      this.setState({ messages: oldMessages });
    });

    // call edit message event
    this.socket.on("edit message", message => {
      // take a copy of the messages from the state
      const messages = [...this.state.messages];
      // find the message which's updated and update its content and set editing property to false
      messages.map(item => {
        if (item.msgFakeID === message.msgID) {
          item.content = message.message;
          item.editing = false;
        }
      });
      // then set the state with updated message
      this.setState({ messages });
    });

    // call chat message event
    this.socket.on("chat message", message => {
      //take a copy of the messages and push the new message to it
      message.editing = false;
      this.setState({ messages: [...this.state.messages, message] });
    });
  }

  componentDidUpdate() {
    // call disconnect event
    this.socket.on("disconnect", id => {
      // take a copy of users from the state
      const users = [...this.state.users];
      // find the user who's disconnected and update his status to false
      users.map(item => {
        if (item.id === id) {
          item.status = false;
        }
      });
      // then set the state with updated user
      this.setState({ users });
    });
  }

  // the function for sending msgs to the server
  sendMessage = e => {
    e.preventDefault();
    // check if the input value is empty
    if (this.refs.chatinput.value === "") return;
    // take input value
    const message = this.refs.chatinput.value;
    // send the chat message
    this.socket.emit("chat message", {
      content: message,
      timestamp: Date.now(),
      username: this.state.currentUser.name,
      groupId: this.state.groupId,
      msgFakeID: uuidv4()
    });
    // empty the input value
    this.refs.chatinput.value = "";
    // emit typing event with empty values after sending the message to remove "user is typing..."
    this.socket.emit("typing", {
      status: false,
      username: ""
    });
  };

  // the function for deleting msgs
  deleteMessage = messageID => {
    // set the required data to delete message to a const
    const message = { groupID: this.state.groupId, msgFakeID: messageID };
    // then send this data to server
    this.socket.emit("delete message", message);
  };

  // the function for submit edited message
  submitEditMessage = (message, msgID) => {
    // set the required data to edit message to a const
    const data = { message, msgID, groupID: this.state.groupId };
    // then send this data to server
    this.socket.emit("edit message", data);
  };

  // the function for start editing message when you click on edit button
  editMessage = messageID => {
    // take a copy of the msgs from the state
    const messages = [...this.state.messages];
    // find the required message and update its editing prperty to true
    messages.map(item => {
      if (item.msgFakeID === messageID) {
        item.editing = true;
      }
    });
    // set the state with updated property
    this.setState({ messages });
  };

  // the function for cancel editing message when you click on cancel button
  cancelEditing = messageID => {
    // take a copy of the msgs from the state
    const messages = [...this.state.messages];
    // find the required message and update its editing prperty to false
    messages.map(item => {
      if (item.msgFakeID === messageID) {
        item.editing = false;
      }
    });
    // set the state with updated property
    this.setState({ messages });
  };

  // the function for emit "typing" event when user is typing a message
  typing = () => {
    // get the current user
    const user = this.state.currentUser.name;
    // if the input value is null will emit the event with empty values
    if (this.refs.chatinput.value === "") {
      this.socket.emit("typing", {
        status: false,
        username: ""
      });
    }
    // else will emit the event with a true status and username
    else {
      this.socket.emit("typing", {
        status: true,
        username: user
      });
    }
  };

  render() {
    const {
      groupName,
      createdBy,
      createdOn,
      users,
      messages,
      typing,
      currentUser
    } = this.state;

    return (
      <div className="row d-flex justify-content-center flex-column">
        <div
          className="col-12 d-flex justify-content-between"
          style={{ backgroundColor: "rgb(14, 158, 178)" }}
        >
          <UsersWrapper className="col-lg-10 col-md-8 d-flex align-items-center">
            {createdBy !== "" ? (
              <div>
                <h3
                  className="align-self-center pr-5"
                  style={{ color: "rgba(0,0,0, 0.7)", margin: 0 }}
                >
                  {groupName}
                </h3>
                <h3
                  className="align-self-center pr-5"
                  style={{ color: "rgba(0,0,0, 0.7)", margin: 0 }}
                >
                  {createdBy}{" "}
                  <span style={{ fontSize: "0.85rem", color: "#4c4040b8" }}>
                    {" "}
                    (admin)
                  </span>{" "}
                </h3>
                <p
                  style={{ fontSize: "0.85rem", color: "#4c4040b8", margin: 0 }}
                >
                  {moment(createdOn).format("Do-MMMM-YYYY")} {" / "}
                  {moment(createdOn).format("h:mm:ss a")} <br />{" "}
                  {moment(createdOn)
                    .startOf("minute")
                    .fromNow()}
                </p>
              </div>
            ) : (
              ""
            )}
            {users.length !== 0 ? (
              <div className="d-flex">
                {users.map(item => {
                  return (
                    <li key={item.username} className="d-flex p-3">
                      <div
                        className="flex-column align-items-center text-center"
                        style={{ textDecoration: "none", color: "#000" }}
                      >
                        <div style={{ position: "relative" }}>
                          <UserImg
                            src={item.image}
                            alt={`${item.username}-img`}
                          />
                          <span
                            style={{
                              position: "absolute",
                              right: "7%",
                              bottom: "7%",
                              width: "20px",
                              height: "20px",
                              borderRadius: "50%",
                              border: "1px solid #ccc",
                              backgroundColor: `${
                                item.status === true ? "green" : "#ccc"
                              }`
                            }}
                          />
                        </div>
                        <h5>{item.username} </h5>
                      </div>
                    </li>
                  );
                })}
              </div>
            ) : (
              <div>
                <p className="pl-4">There Is No Other Users Yet, Only You</p>
              </div>
            )}
          </UsersWrapper>
          <Link
            to={`/profile/${this.state.currentUser.name}`}
            className="btn"
            style={{
              height: "fit-content",
              alignSelf: "flex-end",
              color: "#fff",
              marginBottom: " 1%",
              border: "1px solid #663399",
              backgroundColor: "#663399"
            }}
          >
            Back To Profile
          </Link>
        </div>
        <MessagesWrapper className="col-12 d-flex flex-column align-items-around">
          <MEssagesContainer className="d-flex flex-column h-100 w-100 m-0 p-0">
            <div style={{ position: "relative" }}>
              {typing.status && typing.user !== currentUser.name ? (
                <TypingAlert>{typing.user} is typing ...</TypingAlert>
              ) : (
                ""
              )}
              {messages.map(item => {
                return item.editing === false ? (
                  <Message
                    className="d-flex align-items-center pl-4"
                    key={uuidv4()}
                  >
                    <strong
                      className="pr-3"
                      style={{ color: "rgb(102, 51, 153)" }}
                    >
                      {item.username}:
                    </strong>
                    <p
                      className="p-0 m-0"
                      style={{
                        width: "70%",
                        color: "#646464",
                        wordBreak: "break-all"
                      }}
                    >
                      {item.content}
                    </p>
                    <small style={{ fontSize: "0.8rem", color: "#646464" }}>
                      {moment(item.date).format("h:mm:ss a")}
                      {" / "}
                      {moment(item.date)
                        .startOf("minute")
                        .fromNow()}
                    </small>
                    {item.username === currentUser.name ? (
                      <BtnWrapper className="btnWrapper ml-auto">
                        <EditCancelBtn
                          onClick={() => this.editMessage(item.msgFakeID)}
                        >
                          &#9998;
                        </EditCancelBtn>
                        <EditCancelBtn
                          onClick={() => this.deleteMessage(item.msgFakeID)}
                        >
                          &#65336;
                        </EditCancelBtn>
                      </BtnWrapper>
                    ) : (
                      ""
                    )}
                  </Message>
                ) : (
                  <form
                    style={{
                      width: "99%",
                      padding: "0.7% 1%",
                      margin: "0.4%",
                      listStyle: "none",
                      border: "1px solid #ccc",
                      borderRadius: "2%",
                      fontSize: "1.4rem"
                    }}
                    key={uuidv4()}
                    onSubmit={e => {
                      e.preventDefault();
                      const message = this.refs.chatinput2.value;
                      this.submitEditMessage(message, item.msgFakeID);
                    }}
                  >
                    <strong
                      className="pr-3"
                      style={{ color: "rgb(102, 51, 153)" }}
                    >
                      {item.username}:{" "}
                    </strong>
                    <input
                      className="col-10"
                      ref="chatinput2"
                      type="text"
                      defaultValue={item.content}
                      required
                      autoFocus
                    />
                    <EditCancelBtn
                      onClick={() => this.cancelEditing(item.msgFakeID)}
                    >
                      &#65336;
                    </EditCancelBtn>
                    <EditCancelBtn type="submit"> &#9998;</EditCancelBtn>
                  </form>
                );
              })}
            </div>
          </MEssagesContainer>
          <form onSubmit={this.sendMessage} className="d-flex w-100 ">
            <input
              className="col-10"
              ref="chatinput"
              type="text"
              onChange={this.typing}
              required
              autoFocus
            />
            <button
              type="submit"
              className="col-2 btn py-3"
              style={{ backgroundColor: "rgb(14, 158, 178)" }}
            >
              Send
            </button>
          </form>
        </MessagesWrapper>
      </div>
    );
  }
}

export default ChatGroup;
