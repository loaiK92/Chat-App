import React from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import styled from "styled-components";

// styled components :
const CreateGroupWrapper = styled.div`
  padding: 1% 0px;
  min-height: 70vh;
  background: linear-gradient(
    180deg,
    rgba(75, 145, 225, 0.05) 0,
    rgba(74, 144, 226, 0.04) 100%
  );
  box-shadow: 0 18px 35px rgba(54, 91, 155, 0.102),
    0 8px 15px rgba(0, 0, 0, 0.071);
`;

class CreateChatGroup extends React.Component {
  state = {
    createdBy: "",
    groupName: ""
  };

  componentDidMount() {
    // set the username to the state to use it as a default value to createdBy input
    const username = this.props.match.params.username;
    this.setState({ createdBy: username });
  }

  // onChange set inputs value to the state
  onChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  // onSubmit send the data to the server
  createGroup = e => {
    e.preventDefault();
    // take a copy of the current state and check if the input value is empty
    const { createdBy, groupName } = this.state;
    const username = this.props.match.params.username;
    if (createdBy === "" || groupName === "") return;
    // set the data to data object
    const data = {
      createdBy,
      groupName,
      user: username,
      createdOn: Date.now()
    };
    // send the data to the server to create group, and update user profile with new group
    axios
      .post("http://localhost:8000/create-chat-group", data)
      .then(res => {
        if (res.status === 200) {
          const groupId = res.data.fakeID;
          this.props.history.push(`/chat/${groupId}`);
        } else {
          throw new Error("Error");
        }
        console.log(res.data.fakeID);
      })
      .catch(err => console.log(err));
  };

  render() {
    const { createdBy, groupName } = this.state;
    const username = this.props.match.params.username;
    return (
      <CreateGroupWrapper className="col-lg-5 col-md-12 col-sm-12 my-3 mx-auto d-flex justify-content-center">
        <form
          onSubmit={this.createGroup}
          className="col-md-12 col-sm-12 my-0 mx-auto d-flex justify-content-center flex-column text-center py-5"
        >
          <h3 className="pb-4">Create your own chat group</h3>
          <div className="d-flex justify-content-center flex-column text-left py-3">
            <label>
              Created By (Your Username)
              <span className="text-danger"> *</span> :
            </label>
            <input
              type="text"
              name="createdBy"
              value={createdBy}
              onChange={this.onChange}
              required
            />
          </div>
          <div className="d-flex justify-content-center flex-column text-left py-3">
            <label>
              Group Name <span className="text-danger"> *</span> :
            </label>
            <input
              type="text"
              name="groupName"
              value={groupName}
              onChange={this.onChange}
              required
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="btn mt-5 mb-2"
            style={{ backgroundColor: "#663399" }}
          >
            Submit
          </button>
          <Link
            to={`/profile/${username}`}
            className="btn mb-5"
            style={{ backgroundColor: "rgb(14, 158, 178)", color: "#000" }}
          >
            Cancel
          </Link>
        </form>
      </CreateGroupWrapper>
    );
  }
}

export default CreateChatGroup;
