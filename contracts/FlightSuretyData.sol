pragma solidity ^0.5.8;

import "../node_modules/@openzeppelin/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;                                      // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false
    
    uint256 public constant AIRLINE_FEE = 10 ether;
    // contract funds
    uint private balance;
    // credit balance of given address
    mapping(address => uint256) private credits;
    // for a given flightKey, the insurance balances of each insuree
    mapping(bytes32 => mapping(address => uint256)) private insurances;

    mapping(address => bool) private authorizedContracts;

    // flights
    struct Flight {
        bool isRegistered;
        uint8 statusCode;
        uint256 departureTimestamp;
        uint256 updatedArrivalTimestamp;
        address airline;
    }
    mapping(bytes32 => Flight) private flights;

    // airlines
    struct Airline {
        bool isRegistered;
        uint256 invitations;
        mapping(address => bool) hasInvited;
        uint256 deposit;
    }
    mapping(address => Airline) private airlines;
    uint256 private airlineCount;

    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/


    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor
                                (
                                )
                                public
                                payable
    {
        contractOwner = msg.sender;
        airlineCount = 1;
        _registerAirline(msg.sender);
        fund(msg.value);
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational()
    {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */
    modifier requireContractOwner()
    {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    modifier isCallerAuthorized() {
        require(authorizedContracts[msg.sender], 'Caller is not the authorized app contract');
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */
    function isOperational()
                            external
                            view
                            returns(bool)
    {
        return operational;
    }


    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */
    function setOperatingStatus
                            (
                                bool mode
                            )
                            external
                            requireContractOwner
    {
        operational = mode;
    }

    function authorizeCaller(address dataContract) external requireContractOwner {
        authorizedContracts[dataContract] = true;
    }
    function deauthorizeCaller(address dataContract) external requireContractOwner {
        authorizedContracts[dataContract] = false;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

    function _registerAirline
                            (
                                address airline
                            )
                            internal
    {
        airlines[airline].isRegistered = true;
    }

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */
    function registerAirline
                            (
                                address airline,
                                address endorsingAirline
                            )
                            external
                            isCallerAuthorized()
                            returns(bool success, uint256 votes)
    {
        require(!airlines[airline].isRegistered, 'Airline is already registered.');
        require(!airlines[msg.sender].hasInvited[airline], 'You have voted already.');
        // it takes 1 vote to register the first 4 airlines
        if (airlineCount < 4) {
            airlines[endorsingAirline].hasInvited[airline] = true;
            airlineCount++;
            airlines[airline].isRegistered = true;
            airlines[airline].invitations = 1;
            return (true, 1);
        } else {
            // it takes a majority of registered airlines' votes to register any additional airline
            if (airlines[airline].invitations.mul(2) >= airlineCount) {
                airlineCount++;
                airlines[airline].isRegistered = true;
                airlines[airline].invitations += 1;
                return (true, airlines[airline].invitations);
            } else {
                airlines[airline].invitations += 1;
                return (false, airlines[airline].invitations);
            }
        }
    }

    function registerFlight
                            (
                                address airline,
                                string calldata flight,
                                uint256 departureTimestamp
                            )
                            external
                            isCallerAuthorized()
                            returns(bool)
    {
        require(airlines[airline].isRegistered, "Airline not found");
        bytes32 flightKey = getFlightKey(airline, flight, departureTimestamp);
        flights[flightKey].isRegistered = true;
        flights[flightKey].departureTimestamp = departureTimestamp;
        flights[flightKey].airline = airline;
        // uint8 statusCode;
        // uint256 updatedArrivalTimestamp;
        return true;
    }

    function setFlightStatus
                            (
                                bytes32 flightKey,
                                uint8 statusCode
                            )
                            external // DANGER
                            isCallerAuthorized()
                            returns(uint8)
    {
        flights[flightKey].statusCode = statusCode;
        return statusCode;
    }

    function getCredits
                        (
                        )
                        external
                        view
                        returns(uint256)
    {
        return credits[msg.sender];
    }

   /**
    * @dev Buy insurance for a flight
    *
    */
    function buy
                (
                    address airline,
                    string calldata flight,
                    uint256 timestamp
                )
                external
                payable
    {
        require(msg.value > 0 && msg.value <= 1 ether, 'Pay up to 1 Ether');
        bytes32 flightKey = getFlightKey(airline, flight, timestamp);
        insurances[flightKey][msg.sender] = msg.value;
    }

    function insuranceCoverageForFlight
                                    (
                                        address passenger,
                                        address airline,
                                        string calldata flight,
                                        uint256 departureTimestamp
                                    )
                                    external
                                    view
                                    returns(uint256 coverage)
    {
        bytes32 flightNumber = getFlightKey(airline, flight, departureTimestamp);
        return insurances[flightNumber][passenger];
    }

    /**
     *  @dev Credits payout to insuree
    */
    function creditInsuree
                                (
                                    address passenger,
                                    address airline,
                                    string calldata flight,
                                    uint256 departureTimestamp
                                )
                                external // DANGER
                                isCallerAuthorized()
                                returns(bool)
    {
        bytes32 flightKey = getFlightKey(airline, flight, departureTimestamp);
        require(flights[flightKey].statusCode == 20, 'Airline has caused no delay');
        uint256 total = insurances[flightKey][passenger];
        require(total > 0, "Has not bought insurance");
        uint256 payout = insurances[flightKey][passenger].mul(3).div(2);
        uint256 credit = credits[passenger];
        insurances[flightKey][passenger] = insurances[flightKey][passenger].sub(total);
        credits[passenger] = credit.add(payout);
        require(credit.add(payout) > 0, 'No credits to pay out');
    }
    
    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay
                            (
                            )
                            external
    {
        uint256 credit = credits[msg.sender];
        credits[msg.sender] = 0;
        msg.sender.transfer(credit);
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */
    function fund
                            (
                                uint256 amount
                            )
                            internal
    {
        balance = balance.add(amount);
    }

    function getFlightKey
                        (
                            address airline,
                            string memory flight,
                            uint256 timestamp
                        )
                        internal
                        pure
                        returns(bytes32)
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    function isFlight
                    (
                        address airline,
                        string calldata flight,
                        uint256 timestamp
                    )
                    external
                    view
                    returns(bool)
    {
        bytes32 flightKey = getFlightKey(airline, flight, timestamp);
        return flights[flightKey].isRegistered;
    }

    function isAirline
                    (
                        address candidateAirline
                    )
                    external
                    view
                    returns(bool)
    {
        Airline memory airline = airlines[candidateAirline];
        return airline.isRegistered && (airline.deposit >= 10 ether);
    }

    function isRegistered
                        (
                            address airline
                        )
                        public
                        view
                        returns(bool)
    {
        return airlines[airline].isRegistered;
    }

    function depositAirlineFee
                            (
                                address airline
                            )
                            external
                            payable
                            requireIsOperational()
                            isCallerAuthorized()
                            returns(bool)
    {
        require(airlines[airline].isRegistered, 'Not a registered airline');
        airlines[airline].deposit += msg.value;
        return true;
    }

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function()
                            external
                            payable
    {
        fund(msg.value);
    }


}

