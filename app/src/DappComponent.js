import PropTypes from 'prop-types';
import React, { Component } from "react";
import {
  AccountData,
  ContractData,
} from "drizzle-react-components";

import flightImage from "./flight.jpg";

export default class DappComponent extends Component {
  state = {
    myAccount: this.props.accounts[0],
    flight: this.props.flights[0].flight,
    departureTimestamp: this.props.flights[0].departureTimestamp,
    status: 0
  }

  constructor(props, context) {
    super(props);

    this.contracts = context.drizzle.contracts;
    this.web3 = context.drizzle.web3;
    this.statusCodes = {
      0: 'UNKNOWN',
      10: 'ON TIME',
      20: 'LATE AIRLINE',
      30: 'LATE WEATHER',
      40: 'LATE TECHNICAL',
      50: 'LATE OTHER'
    };
  }

  buyInsurance = async (e) => {
    e.preventDefault();
    const { myAccount, flight, departureTimestamp } = this.state;
    const { gas } = this.props;
    const { FlightSuretyData } = this.contracts;


    await FlightSuretyData.methods.buy.cacheSend(myAccount, flight, departureTimestamp, {
      from: myAccount,
      value: this.web3.utils.toWei('0.6', 'ether'),
      gas
    });
  }

  fetchFlightStatus = async (e) => {
    e.preventDefault();
    const { myAccount, flight, departureTimestamp } = this.state;
    const { gas } = this.props;
    const { FlightSuretyApp } = this.contracts;

    await FlightSuretyApp.methods.fetchFlightStatus.cacheSend(myAccount, flight, departureTimestamp, {
      from: myAccount,
      gas
    });
  }

  onSelectFlight = flight => {
    let instance = this.props.flights.filter(f => f.flight === flight)[0];
    this.setState({ flight, departureTimestamp: instance.departureTimestamp });
  }

  render() {
    const { accounts, flights } = this.props;
    const { myAccount, flight, departureTimestamp } = this.state;
    return (
      <div className="App">
        <div>
          <img src={flightImage} alt="flight" style={{ width: '100%' } } />
          <h1>FlightSurety</h1>
          <p>Udacity Blockchain Developer Nanodegree</p>
        </div>

        <div className="section">
          <h2>Active Account</h2>
          <AccountData accountIndex={0} units="ether" precision={3} />
        </div>

        <div className="section">
          <h2>Operational Status</h2>
          <p>
            <strong>Contract is operational: </strong>
            <ContractData 
              contract="FlightSuretyData" 
              method="isOperational" 
              methodArgs={[{from: myAccount}]}
            />
          </p>
        </div>

        <div className="section">
          <h2>Purchase Insurance</h2>
          <p>
            Protect yourself against delay.
            Select your flight and transfer up to 1 Ether but not more. 
          </p>
          <select
            value={flights}
            onChange={e => {
              e.preventDefault();
              this.onSelectFlight(e.target.value);
            }}
          >
            <option value="pickFlight">Select flight...</option>
            {
              flights.map(({ 
                airline,
                airlineName,
                flight,
                departureTimestamp
              }) => (
                  <option value={flight} key={flight}>
                    {`[${airlineName}:${flight}] DEP ${departureTimestamp}`}
                  </option>
                )
              )
            }
          </select>
          <p>
            <strong>[{`${this.state.flight}`}] Coverage: </strong>
            <ContractData 
              contract="FlightSuretyData" 
              method="insuranceCoverageForFlight" 
              methodArgs={[myAccount, myAccount, flight, departureTimestamp]}
            /> wei insurance
          </p>
          <button onClick={this.buyInsurance}>
            Buy Insurance
          </button>
        </div>

        <div className="section">
          <h2>Flight Status</h2>
          <p>
            Ask oracles to give you an update on your flight's status.
          </p>
          <p>
            <strong>Payouts credited: </strong>
            <ContractData 
              contract="FlightSuretyData" 
              method="getCredits" 
              methodArgs={[{ from: myAccount }]}
            />
          </p>
          <div>
            <strong>STATUS</strong>
            <ul>
              <li>{`[FLIGHT INFO - ${this.state.flight}] ${this.statusCodes[this.state.status]}`}</li>
            </ul>
          </div>
          <button onClick={this.fetchFlightStatus}>
            Fetch Flight Status
          </button>
        </div>
      </div>
    );
  }
}

DappComponent.contextTypes = {
  drizzle: PropTypes.object
}

// DROPDOWN: select flight <-- harcoded
// BUTTON: buy insurance
// display result

// DROPDOWN: select flight
// BUTTON: fetch flight status
// display result
