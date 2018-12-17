import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

// styled components :
const IntroWrapper = styled.div`
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

class IntroPage extends React.Component {
  render() {
    return (
      <IntroWrapper className="col-lg-5 col-md-9 col-sm-10 my-3 mx-auto d-flex justify-content-center flex-column text-center">
        <Heading className="py-2">
          Welcome to{" "}
          <span style={{ color: "rgb(102, 51, 153)", fontWeight: "bolder" }}>
            HOMELIKE-CHAT
          </span>
        </Heading>
        <p style={{ letterSpacing: "1px" }} className="py-3 text-muted">
          Join us and start your chat group now
        </p>
        <div className="col-lg-6 col-md-6 col-sm-6 my-0 mx-auto d-flex justify-content-center flex-column pt-3">
          <Link to={`/login/`}>
            <h2
              className="btn text-light w-100 my-4"
              style={{ backgroundColor: "rgb(14, 158, 178)" }}
            >
              Log in
            </h2>
          </Link>
          <Link to={`/signup`}>
            <h2
              className="btn btn-secondary text-light w-100 my-2"
              style={{ backgroundColor: "#663399" }}
            >
              Sign up
            </h2>
          </Link>
        </div>
      </IntroWrapper>
    );
  }
}

export default IntroPage;
