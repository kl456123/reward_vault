import { HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const ALCHEMY_API_KEY = vars.get("ALCHEMY_API_KEY");

const PRIVATE_KEY = vars.get("PRIVATE_KEY");

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    eth: {
      url: `https://eth-mainnet.g.alchemy.com/v2/Vf2BpEUqjAj4fV8pZ6hFXuyNLAFDb0s2`,
      accounts: [PRIVATE_KEY],
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [PRIVATE_KEY],
    },
    bsc: {
      url: `https://bsc-dataseed1.binance.org/`,
      accounts: [PRIVATE_KEY],
    },
    bsc_test: {
      url: `https://data-seed-prebsc-1-s1.binance.org:8545`,
      accounts: [PRIVATE_KEY],
    },
    base: {
      url: `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [PRIVATE_KEY],
    },
    arb: {
      url: "https://arbitrum-mainnet.infura.io/v3/4afef93554c240f98c1a3644fbe181d1",
      accounts: [PRIVATE_KEY],
    },
    polygon: {
      url: "https://polygon-mainnet.infura.io/v3/4afef93554c240f98c1a3644fbe181d1",
      accounts: [PRIVATE_KEY],
    },
    op: {
      url: "https://optimism-mainnet.infura.io/v3/4afef93554c240f98c1a3644fbe181d1",
      accounts: [PRIVATE_KEY],
    },
    opbnb: {
      url: "https://opbnb-mainnet-rpc.bnbchain.org",
      accounts: [PRIVATE_KEY],
      // gasPrice: 1011
    },
  },
  etherscan: {
    apiKey: "PKEAHEUI9QJTBKW1TYSNXGEBR924T85KN5",
    customChains: [
      {
        network: "opbnb",
        chainId: 204,
        urls: {
          apiURL: "https://api-opbnb.bscscan.com/api",
          browserURL: "https://opbnb.bscscan.com",
        },
      },
    ],
  },
  ignition: {
    strategyConfig: {
      create2: {
        // To learn more about salts, see the CreateX documentation
        salt: "0x0000000000000000000000000000000000000000000000000000000000000002",
      },
    },
  },
};

export default config;
