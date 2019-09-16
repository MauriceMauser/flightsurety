
var FlightSuretyApp = artifacts.require("FlightSuretyApp");
var FlightSuretyData = artifacts.require("FlightSuretyData");
var BigNumber = require('bignumber.js');

var Test = require('./config.json');
var Web3 = require('web3');

let config = Test['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider('ws://127.0.0.1:9545'));

// const flightSuretyData = new web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);
// const flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);

var Config = async function(accounts) {
    
    let ownerAirline = accounts[0];
    // assert(ownerAirline == 0x7d3f45862f69E1Cfc4Cf4Be5B80a65d186D47875, "Expected owner airline to be 0x7d3f45862f69E1Cfc4Cf4Be5B80a65d186D47875");
    let secondAirline = accounts[1];
    let thirdAirline = accounts[2];
    let fourthAirline = accounts[3];
    let fifthAirline = accounts[4];
    let passenger = accounts[5];

    let flightSuretyData = await FlightSuretyData.new({value: web3.utils.toWei('10', 'ether'), from: ownerAirline });
    let flightSuretyApp = await FlightSuretyApp.new(flightSuretyData.address, { from: ownerAirline });
    
    return {
        ownerAirline: ownerAirline,
        secondAirline: secondAirline,
        thirdAirline: thirdAirline,
        fourthAirline: fourthAirline,
        fifthAirline: fifthAirline,
        passenger: passenger,
        departureTimestamp: Math.floor(Date.now() / 1000),
        flight: 'ND1309',
        weiMultiple: (new BigNumber(10)).pow(18),
        flightSuretyData: flightSuretyData,
        flightSuretyApp: flightSuretyApp
    }
}

module.exports = {
    Config: Config
};


// const Web3 = require('web3');
// const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://127.0.0.1:9545'));
/*
let web3;
// Is there is an injected web3 instance?
if (typeof window.ethereum !== 'undefined'
|| (typeof window.web3 !== 'undefined')) {
  // Web3 browser user detected. You can now use the provider.
  const provider = window['ethereum'] || window.web3.currentProvider
} else {
    // If no injected web3 instance is detected, fallback to Truffle Develop.
    window.web3Provider = new Web3.providers.WebsocketProvider('ws://127.0.0.1:8545');
    web3 = new Web3(window.web3Provider);
}
*/

