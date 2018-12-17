import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import IntroPage from "./IntroPage";
import Signup from "./Signup";
import Login from "./Login";
import UserProfile from "./UserProfile";
import CreateChatGroup from "./CreateChatGroup";
import ChatGroup from "./ChatGroup";

class Router extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route exact path="/">
            <IntroPage />
          </Route>
          <Route exact path="/signup" component={Signup} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/profile/:username" component={UserProfile} />
          <Route
            path="/profile/:username/create-chat-group"
            component={CreateChatGroup}
          />
          <Route exact path="/chat/:groupId" component={ChatGroup} />
        </Switch>
      </BrowserRouter>
    );
  }
}

export default Router;
