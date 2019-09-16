import FlightSuretyData from "./contracts/FlightSuretyData.json";
import FlightSuretyApp from "./contracts/FlightSuretyApp.json";

const options = {
  web3: {
    block: false,
    fallback: {
      type: "ws",
      url: "ws://127.0.0.1:8545",
    },
  },
  contracts: [
    FlightSuretyData, 
    FlightSuretyApp
  ],
  events: {
    FlightSuretyApp: ["OracleReport", "FlightStatusInfo"]
  },
  polls: {
    accounts: 1500,
  },
};

export default options;
