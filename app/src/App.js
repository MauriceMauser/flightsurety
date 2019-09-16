import React, { Component } from "react";
import { DrizzleProvider } from "drizzle-react";
import { LoadingContainer } from "drizzle-react-components";
// import store from './middleware'

import "./App.css";

import drizzleOptions from "./drizzleOptions";
import DappContainer from "./DappContainer";

class App extends Component {
  render() {
    return (
      <DrizzleProvider options={drizzleOptions}>
        <LoadingContainer>
          <DappContainer />
        </LoadingContainer>
      </DrizzleProvider>
    );
  }
}

export default App;
