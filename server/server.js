import FlightSuretyApp from '../app/src/contracts/FlightSuretyApp.json';

import Config from './config.json';
import Web3 from 'web3';
import express from 'express';

let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));

const flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);

const ORACLES_COUNT = 20;
let gas = 3000000;
const getRandomStatusCode = () => (Math.random() > 0.5) ? 20 : 10 * Math.floor(Math.random() * 5);
console.log("RANDOM CODE: ", getRandomStatusCode());

const statusCodes = {
  0: 'UNKNOWN',
  10: 'ON TIME',
  20: 'LATE AIRLINE',
  30: 'LATE WEATHER',
  40: 'LATE TECHNICAL',
  50: 'LATE OTHER'
};

(async () => {
  let accounts = await web3.eth.getAccounts(async (error, accounts) => {

    if (error) console.log("[ERROR] ", error);

    web3.eth.defaultAccount = accounts[0];

    let balance = await web3.eth.getBalance(accounts[0]);
    console.log(accounts[0], balance);

    let fee = await flightSuretyApp.methods.REGISTRATION_FEE().call({from: accounts[0]});

    for (let a=0; a<ORACLES_COUNT; a++) {
      await flightSuretyApp.methods.registerOracle()
        .send({ 
          from: accounts[a],
          value: fee,
          gas
        })
        .catch(e => console.log(e));
      
      let indexes = await flightSuretyApp.methods.getMyIndexes()
        .call({
          from: accounts[a],
          gas
        })
        .catch(e => console.log(e));
      console.log(`[${a}] Oracle Registered: ${indexes[0]}, ${indexes[1]}, ${indexes[2]}`);
    }
  });

  await flightSuretyApp.events.OracleRequest({ fromBlock: 0 }, async (error, event) => {
    if (error) console.log(error);
    let { index, airline, flight, timestamp } = event.returnValues;
    for(let a=1; a<ORACLES_COUNT; a++) {
      // Get the 3 indexes to which the oracle answers
      let oracleIndexes = await flightSuretyApp.methods.getMyIndexes().call({from: accounts[a]});

      for(let idx=0;idx<3;idx++) {
        try {
          // Submit a (random) status code for the requested flight
          let statusCode = getRandomStatusCode();

          await flightSuretyApp.methods
            .submitOracleResponse(oracleIndexes[idx], accounts[0], flight, timestamp, statusCode)
            .send({ 
              from: accounts[a],
              gas
            });
          console.log(`[${a}]`, '\nSuccess', idx, oracleIndexes[idx], flight, timestamp, `|*| ${statusCodes[statusCode]} |*|`);
        }
        catch(e) {
          // Enable this when debugging
          let oracleIndex = oracleIndexes[idx];
          console.log(`[${a}]`, '\nError', idx, oracleIndex, flight, timestamp);
          if (index == oracleIndex) console.log("[ERROR] ", e);
        }
      }
    }
  })

})()

const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

export default app;
