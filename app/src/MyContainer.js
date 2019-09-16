import MyComponent from "./MyComponent";
import { drizzleConnect } from "drizzle-react";

const mapStateToProps = state => {
  console.log("accounts: ", state.accounts);
  console.log("SimpleStorage: ", state.contracts.SimpleStorage);
  console.log("TutorialToken: ", state.contracts.TutorialToken);
  console.log("drizzleStatus: ", state.drizzleStatus);
  return {
    accounts: state.accounts,
    SimpleStorage: state.contracts.SimpleStorage,
    TutorialToken: state.contracts.TutorialToken,
    drizzleStatus: state.drizzleStatus,
  };
};

const MyContainer = drizzleConnect(MyComponent, mapStateToProps);

export default MyContainer;
