const path = require("path");


const HDWalletProvider = require("truffle-hdwallet-provider");
const infuraKey = "8471e19cc63c4063b2fc95ab2502a6e8";
const mnemonic = "poet purchase impact cigar large spy romance better ripple this salute uphold";
// const mnemonic = "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "app/src/contracts"),
  networks: {
    develop: {
      port: 9545,
      network_id: 20,
      accounts: 50,
      defaultEtherBalance: 500
      // blockTime: 2
    },
    rinkeby: {
      provider: () => new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/v3/${infuraKey}`),
       network_id: 4,       // Rinkeby's id
       gas: 4500000,        // Rinkeby has a lower block limit than mainnet
       gasPrice: 10000000000,
       // confirmations: 2,    // # of confs to wait between deployments. (default: 0)
       // timeoutBlocks: 200,  // # of blocks before a deployment times out  (minimum/default: 50)
       // skipDryRun: true     // Skip dry run before migrations? (default: false for public nets )
    },
    ganache: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "http://127.0.0.1:7545/", 0, 40);
      },
      network_id: 5777,
      websockets: true,
      // accounts: 50,
      // defaultEtherBalance: 500,
      gas: 4600000
    }
  },
};
