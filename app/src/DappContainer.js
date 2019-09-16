import { drizzleConnect } from "drizzle-react";
import DappComponent from "./DappComponent";
const Config = require('./config.json');
const config = Config['localhost'];


const mapStateToProps = state => {
  // console.log("accounts: ", state.accounts);
  // console.log("FlightSuretyData: ", state.contracts.FlightSuretyData);
  // console.log("FlightSuretyApp: ", state.contracts.FlightSuretyApp);
  // console.log("flights: ", config.flights);
  // console.log("drizzleStatus: ", state.drizzleStatus);

  return {
    accounts: state.accounts,
    FlightSuretyData: state.contracts.FlightSuretyData,
    FlightSuretyApp: state.contracts.FlightSuretyApp,
    flights: config.flights,
    gas: 3000000,
    drizzleStatus: state.drizzleStatus
  };
};

const DappContainer = drizzleConnect(DappComponent, mapStateToProps);

export default DappContainer;
