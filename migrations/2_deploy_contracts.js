const FlightSuretyApp = artifacts.require("FlightSuretyApp");
const FlightSuretyData = artifacts.require("FlightSuretyData");
const fs = require('fs');
const BigNumber = require('bignumber.js');
const weiMultiple = (new BigNumber(10)).pow(18);


let flightNames = ['ND1309', 'CM2395', 'MM1990'];
let airlines = ['U Airlife', 'Mars X', 'Virgin'];
let fee = 10 * weiMultiple;

module.exports = async function(deployer, network, accounts) {

    if (network == 'develop') {
        let ownerAirline = accounts[0];
        deployer.deploy(FlightSuretyData, { value: fee.toString(), from: ownerAirline })
            .then(() => deployer.deploy(FlightSuretyApp, FlightSuretyData.address, { from: ownerAirline }))
            .then(() => FlightSuretyData.deployed())
            .then(async flightSuretyData => {
                await flightSuretyData.authorizeCaller(FlightSuretyApp.address, { from: ownerAirline });
                return;
            })
            .then(() => {
                let config = {
                    localhost: {
                        url: 'http://127.0.0.1:9545/',
                        dataAddress: FlightSuretyData.address,
                        appAddress: FlightSuretyApp.address
                    }
                }
                fs.writeFileSync(__dirname + '/../config/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
            });  
    }
    if (network == 'ganache') {
        // flights
        let flights = [];
        for (let i=0; i<flightNames.length; i++) {
            let airline = accounts[i];
            let timestamp = Math.floor(Date.now() / 1000);
            let flight = {
                airline,
                airlineName: airlines[i],
                flight: flightNames[i],
                departureTimestamp: timestamp
            };
            flights.push(flight);
        }
        // deploy
        let ownerAirline = accounts[0]; // '0x7d3f45862f69E1Cfc4Cf4Be5B80a65d186D47875'
        deployer.deploy(FlightSuretyData, { value: fee.toString(), from: ownerAirline })
            .then(() => deployer.deploy(FlightSuretyApp, FlightSuretyData.address, { from: ownerAirline }))
            .then(() => FlightSuretyData.deployed())
            .then(async flightSuretyData => {
                await flightSuretyData.authorizeCaller(FlightSuretyApp.address, { from: ownerAirline });
                return;
            })
            .then(() => FlightSuretyApp.deployed())
            .then(async flightSuretyApp => {
                // deposit airline fees
                await flightSuretyApp.sendTransaction({from: ownerAirline, value: fee});
                // register flights
                for (let i=0; i<flights.length; i++) {
                    let { airline, flight, departureTimestamp } = flights[0];
                    await flightSuretyApp.registerFlight(flight, departureTimestamp, { from: ownerAirline });
                }
                return;
            })
            .then(() => {
                let config = {
                    localhost: {
                        url: 'ws://127.0.0.1:7545/',
                        network_id: 5777,
                        websockets: true,
                        dataAddress: FlightSuretyData.address,
                        appAddress: FlightSuretyApp.address,
                        flights,
                        rinkebyDataContract: 0xB122b6156D83294eCF24A3e784023a0743551DE1,
                        rinkebyAppContract: 0x78EF503DB621B8FF1E1E31a9C27f167476F32a50
                    }
                }
                fs.writeFileSync(__dirname + '/../app/src/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
                fs.writeFileSync(__dirname + '/../server/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
                fs.writeFileSync(__dirname + '/../config/config.json',JSON.stringify(config, null, '\t'), 'utf-8');
            });  
    }
}
