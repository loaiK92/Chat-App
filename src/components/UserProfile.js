import React from "react";
import axios from "axios";
import moment from "moment";
import { Link } from "react-router-dom";
import styled from "styled-components";

// styled components :
const ImageWrapper = styled.div`
  width: 200px;
  height: 200px;
  @media (max-width: 500px) {
    width: 150px;
    height: 150px;
  }
`;
const UserImg = styled.img`
  width: 100%;
  height: 100%;
  border: 2px solid #999;
  border-radius: 50%;
`;
const Button = styled.button`
  background-color: #fff;
  padding: 3% 5%;
  border: none;
  border-radius: 2%;
  cursor: pointer;
  font-size: 16px;
  font-weight: lighter;
  box-shadow: 0 8px 12px rgba(54, 91, 155, 0.102),
    0 5px 12px rgba(0, 0, 0, 0.071);
  &:focus {
    outline: none;
  }
`;
const GroupWrapper = styled.ul`
  width: 100%;
  padding: 0;
  margin: 0;
`;
const Group = styled.li`
  width: 99%;
  padding: 3%;
  margin: 0.5%;
  list-style: none;
  border: 1px solid #ccc;
  border-radius: 2%;
`;

class UserProfile extends React.Component {
  state = {
    username: "",
    image: "",
    chatGroups: [],
    allChats: [],
    createdOn: null
  };

  componentDidMount() {
    // get the username from the params
    const username = this.props.match.params.username;
    // send a request to get user data from the server
    axios.get(`http://localhost:8000/profile/${username}`).then(result => {
      // if the user not exist, redirect him to sign up page again
      if (result.data === "error") {
        alert("ooooops you are not logged in ");
        return this.props.history.push("/signup");
      }
      // create two empty arrays for the all existing groups, and another one for groups you are participated in
      let chatGroups = [];
      let allChats = [];
      // take a copy of the returned data
      const userData = result.data.userData[0];
      const allChatGroups = result.data.result;
      // push the groups that you are participated in to chatGroups array
      userData.chatGroup.map(item => {
        chatGroups.push({ groupname: item.groupName, groupId: item.fakeID });
      });
      // push all groups to allChats array
      allChatGroups.map(item => {
        allChats.push({ groupname: item.groupName, groupId: item.fakeID });
      });

      // update the state with user data
      this.setState({
        username: userData.username,
        image: userData.image,
        chatGroups,
        allChats,
        createdOn: moment(userData.createdOn).format("Do-MMMM-YYYY")
      });

      // set "currentUser" item to session storage which we need it in the chat group to know the current user
      sessionStorage.setItem(
        "currentUser",
        JSON.stringify({
          name: this.state.username,
          userID: userData._id
        })
      );
    });
  }

  deleteAcount = username => {
    axios
      .post(`http://localhost:8000/profile/delete-acount/${username}`)
      .then(result => {
        console.log(username);
        return this.props.history.push("/");
      })
      .catch(err => console.log(err));
  };

  render() {
    const { username, image, chatGroups, allChats, createdOn } = this.state;

    return (
      <div className="row d-flex justify-content-center flex-column">
        <div className="col-12">
          <div
            className="col-lg-6 col-md-12 col-sm-12 py-3 my-0 mx-auto d-flex align-items-center flex-column"
            style={{
              backgroundColor: "#0e9eb2"
            }}
          >
            <ImageWrapper>
              <UserImg src={image} alt={`${username}-profile-img`} />
            </ImageWrapper>
            <div className="text-center py-3 text-light">
              <h2> {username}</h2>
              <small> On: {createdOn}</small>
            </div>
            <Link
              to={`/profile/${username}/create-chat-group`}
              className="btn btn-dark col-lg-6 col-sm-4 "
            >
              Create Your Group
            </Link>
          </div>
        </div>
        <div className="col-12">
          <div
            className="col-lg-6 col-md-12 col-sm-12 py-5 my-0 mx-auto d-flex align-items-center flex-column"
            style={{
              minHeight: "50vh",
              background:
                "linear-gradient(180deg,rgba(75, 145, 225, 0.05) 0,rgba(74, 144, 226, 0.04) 100%)",
              boxShadow:
                "0 18px 35px rgba(54, 91, 155, 0.102),0 8px 15px rgba(0, 0, 0, 0.071)"
            }}
          >
            <div id="accordion" className="col-lg-10">
              <div className="card mt-3">
                <div className="card-header p-0" id="headingOne">
                  <h5 className="mb-0 text-center">
                    <Button
                      className="w-100 d-flex "
                      data-toggle="collapse"
                      data-target="#collapseOne"
                      aria-expanded="false"
                      aria-controls="collapseOne"
                    >
                      Your Chat Groups :
                      <span className="pl-5">{chatGroups.length}</span>
                      <span className="text-right flex-fill">&#129175;</span>
                    </Button>
                  </h5>
                </div>

                <div
                  id="collapseOne"
                  className="collapse"
                  aria-labelledby="headingOne"
                  data-parent="#accordion"
                >
                  <div className="card-body p-0">
                    <GroupWrapper>
                      {chatGroups.map(item => {
                        return (
                          <Link
                            key={item.groupId}
                            to={`/chat/${item.groupId}`}
                            style={{ textDecoration: "none" }}
                          >
                            <Group>{item.groupname}</Group>
                          </Link>
                        );
                      })}
                    </GroupWrapper>
                  </div>
                </div>
              </div>

              <div className="card mt-3">
                <div className="card-header p-0" id="headingTwo">
                  <h5 className="mb-0 text-center">
                    <Button
                      className="w-100 d-flex collapsed"
                      data-toggle="collapse"
                      data-target="#collapseTwo"
                      aria-expanded="false"
                      aria-controls="collapseTwo"
                    >
                      All Chat Groups :
                      <span className="pl-5">{allChats.length}</span>
                      <span className="text-right flex-fill"> &#129175;</span>
                    </Button>
                  </h5>
                </div>
                <div
                  id="collapseTwo"
                  className="collapse"
                  aria-labelledby="headingTwo"
                  data-parent="#accordion"
                >
                  <div className="card-body p-0">
                    <GroupWrapper>
                      {allChats.map(item => {
                        return (
                          <Link
                            key={item.groupId}
                            style={{ textDecoration: "none" }}
                            to={`/chat/${item.groupId}`}
                          >
                            <Group>{item.groupname}</Group>
                          </Link>
                        );
                      })}
                    </GroupWrapper>
                  </div>
                </div>
              </div>

              <div className="card mt-3">
                <div className="card-header p-0" id="headingThree">
                  <h5 className="mb-0 text-center">
                    <Button
                      className=" d-flex w-100 collapsed"
                      data-toggle="collapse"
                      data-target="#collapseThree"
                      aria-expanded="false"
                      aria-controls="collapseThree"
                    >
                      Manage Your Acount
                      <span className="text-right flex-fill"> &#129175;</span>
                    </Button>
                  </h5>
                </div>
                <div
                  id="collapseThree"
                  className="collapse"
                  aria-labelledby="headingThree"
                  data-parent="#accordion"
                >
                  <div className="card-body p-0">
                    <GroupWrapper>
                      <Link to={"/"} style={{ textDecoration: "none" }}>
                        <Group>Log Out</Group>
                      </Link>
                      <Group
                        onClick={() => this.deleteAcount(username)}
                        style={{ cursor: "pointer", color: "red" }}
                      >
                        Delete Acount
                      </Group>
                    </GroupWrapper>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default UserProfile;
