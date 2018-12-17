import React from "react";
import axios from "axios";
import styled from "styled-components";

// styled components :
const LoginWrapper = styled.div`
  padding: 5% 0px;
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

class Login extends React.Component {
  state = {
    username: ""
  };

  // onChange set input value to the state
  onChange = e => {
    this.setState({ [e.target.name]: e.target.value });
  };

  // onSubmit send the data to the server
  userProfile = e => {
    e.preventDefault();
    // take a copy of the current state and check if the input value is empty
    const { username } = this.state;
    if (username === "") return;
    // send a request to the server to check if the user already logged in
    axios("http://localhost:8000/login")
      .then(res => {
        const checkUsername = res.data.filter(name => {
          return name.includes(username);
        });
        // if he's logged in, redirect him to his profile page
        if (checkUsername.includes(username)) {
          this.props.history.push(`/profile/${username}`);
        }
        // if not logged in, redirect him to sign up page
        else {
          alert("Ooooops you are not signed up !!!");
          this.props.history.push("/signup");
        }
      })
      .catch(err => console.log(err));
  };

  render() {
    const { username } = this.state;
    return (
      <LoginWrapper className="col-lg-5 col-md-12 col-sm-12 my-3 mx-auto d-flex justify-content-center">
        <form
          onSubmit={this.userProfile}
          className="col-md-12 col-sm-12 my-0 mx-auto d-flex justify-content-center flex-column text-center"
        >
          <Heading className="py-2">
            Welcome to{" "}
            <span style={{ color: "rgb(102, 51, 153)", fontWeight: "bolder" }}>
              HOMELIKE-CHAT
            </span>
          </Heading>
          <div className="d-flex justify-content-center flex-column py-5 w-50 my-0 mx-auto">
            <label className="text-left">
              Enter Your Username <span className="text-danger">*</span>
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
          <button
            type="submit"
            className="btn w-50 my-0 mx-auto"
            style={{ backgroundColor: "rgb(14, 158, 178)" }}
          >
            Submit
          </button>
        </form>
      </LoginWrapper>
    );
  }
}

export default Login;
