import React from "react";
import axios from "axios";
import styled from "styled-components";

// styled components :
const SignupWrapper = styled.div`
  padding: 2% 0px;
  min-height: 70vh;
  background: linear-gradient(
    180deg,
    rgba(75, 145, 225, 0.05) 0,
    rgba(74, 144, 226, 0.04) 100%
  );
  box-shadow: 0 18px 35px rgba(54, 91, 155, 0.102),
    0 8px 15px rgba(0, 0, 0, 0.071);
`;
const Heading = styled.h3`
  font-family: "Acme", sans-serif;
  font-size: 1.9rem;
  font-weight: lighter;
  letter-spacing: 2px;
`;

class Signup extends React.Component {
  state = {
    username: "",
    userImage: ""
  };

  // onChange set inputs value to the state
  onChange = e => {
    switch (e.target.name) {
      case "userImage":
        this.setState({ userImage: e.target.files[0] });
        break;
      default:
        this.setState({ [e.target.name]: e.target.value });
    }
  };

  // onSubmit send the data to the server
  userProfile = e => {
    e.preventDefault();
    // take a copy of the current state and check if the input value is empty
    const { username, userImage } = this.state;
    if (username === "" || userImage === "") return;
    // set the data to formData
    const data = new FormData();
    data.append("username", username);
    data.append("userImage", userImage);
    data.append("date", Date.now());
    // send a request to the server to check if the username is unique in database
    axios("http://localhost:8000/login")
      .then(res => {
        const checkUsername = res.data.filter(name => {
          return name.includes(username);
        });
        // if the username is already exist, alert a message and return
        if (checkUsername.includes(username)) {
          alert(
            "Ooooops this username's already taken. \n Try another username."
          );
          return;
        }
        // if the username is unique, send the data to the server
        else {
          axios
            .post("http://localhost:8000/signup", data)
            .then(res => {
              if (res.status === 200) {
                this.props.history.push(`/profile/${username}`);
              } else {
                throw new Error("Error");
              }
            })
            .catch(err => console.log(err));
        }
      })
      .catch(err => console.log(err));
  };

  render() {
    const { username } = this.state;
    return (
      <SignupWrapper className="col-lg-5 col-md-12 col-sm-12 my-3 mx-auto d-flex justify-content-center">
        <form
          onSubmit={this.userProfile}
          className="col-md-12 col-sm-12 my-0 mx-auto d-flex justify-content-center flex-column text-center py-5"
        >
          <Heading className="py-2">
            Welcome to{" "}
            <span style={{ color: "rgb(102, 51, 153)", fontWeight: "bolder" }}>
              HOMELIKE-CHAT
            </span>
          </Heading>
          <p className="text-muted w-75 my-0 mx-auto pb-4">
            Please keep in mind that the username is unique and we use it as
            your ID to log in
          </p>
          <div className="d-flex justify-content-center flex-column pb-3 pt-4 w-50 my-0 mx-auto">
            <label className="text-left">
              Choose a username <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={username}
              onChange={this.onChange}
              required
              autoFocus
            />
          </div>
          <div className="d-flex justify-content-center flex-column pt-2 pb-5 w-50 my-0 mx-auto">
            <input
              type="file"
              name="userImage"
              onChange={this.onChange}
              required
            />
          </div>
          <button
            type="submit"
            className="btn w-50 mb-0 mt-4 mx-auto"
            style={{ backgroundColor: "#663399" }}
          >
            Sign up
          </button>
        </form>
      </SignupWrapper>
    );
  }
}

export default Signup;
