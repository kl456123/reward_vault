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
    sei: {
      url: "https://evm-rpc.sei-apis.com",
      accounts: [PRIVATE_KEY],
    },
    bera: {
      url: "https://bartio.rpc.berachain.com/",
      accounts: [PRIVATE_KEY],
    },
    bitlayer: {
      url: "https://rpc.bitlayer.org",
      chainId: 200901,
      accounts: [PRIVATE_KEY],
    },
    bitlayertestnet: {
      url: "https://testnet-rpc.bitlayer.org",
      chainId: 200810,
      accounts: [PRIVATE_KEY],
    },
    zeta: {
      chainId: 7000,
      url: "https://zetachain-evm.blockpi.network/v1/rpc/public",
      accounts: [PRIVATE_KEY],
    },
    zetatestnet: {
      chainId: 7001,
      url: "https://zetachain-athens-evm.blockpi.network/v1/rpc/public",
      accounts: [PRIVATE_KEY],
    },
    storytestnet: {
      url: "https://rpc.odyssey.storyrpc.io",
      chainId: 1516,
      accounts: [PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      optimisticEthereum: "DAFYQIQZRSHHJAKI537DUG34I5EISE6TYR",
      mainnet: "9K1972CHBWVUHDIHH925J8Q9F9369RK6IH",
      arbitrumOne: "34DMWUNIFUBU89E9X6H7E8PGT1U6QVDJHV",
      base: "HSX9552HB65CH8AVDQ4Y45V9S9XTHPERNJ",
      bsc: "8VIU3SVRIUYRTP492AC8ZQGBVUDDV7MGV5",
      bscTestnet: "8VIU3SVRIUYRTP492AC8ZQGBVUDDV7MGV5",
      polygon: "SWZNZAZS9JU75B5WP3HEDSV3ZPQ9HFZSWI",
      opbnb: "PKEAHEUI9QJTBKW1TYSNXGEBR924T85KN5",
      sepolia: "9K1972CHBWVUHDIHH925J8Q9F9369RK6IH",
      sei: "0f4a8c6a-8ad3-4492-b9fb-dbc31fe4cb2b",
      // apiKey is not required, just set a placeholder
      berachain_bartio: "berachain_bartio",
      bitlayertestnet: "1234",
      bitlayer: "1234",
      zeta: "1234",
      zetatestnet: "1234",
      story: "1234",
      storytestnet: "1234",
    },
    customChains: [
      {
        network: "opbnb",
        chainId: 204,
        urls: {
          apiURL: "https://api-opbnb.bscscan.com/api",
          browserURL: "https://opbnb.bscscan.com",
        },
      },
      {
        network: "berachain_bartio",
        chainId: 80084,
        urls: {
          apiURL:
            "https://api.routescan.io/v2/network/testnet/evm/80084/etherscan",
          browserURL: "https://bartio.beratrail.io",
        },
      },
      {
        network: "sei",
        chainId: 1329,
        urls: {
          apiURL: "https://seitrace.com/pacific-1/api",
          browserURL: "https://seitrace.com",
        },
      },
      {
        network: "bitlayertestnet",
        chainId: 200810,
        urls: {
          apiURL: "https://api-testnet.btrscan.com/scan/api",
          browserURL: "https://testnet.btrscan.com/",
        },
      },
      {
        network: "bitlayer",
        chainId: 200901,
        urls: {
          apiURL: "https://api.btrscan.com/scan/api",
          browserURL: "https://www.btrscan.com/",
        },
      },
      {
        network: "zeta",
        chainId: 7000,
        urls: {
          apiURL: "",
          browserURL: "https://explorer.zetachain.com/",
        },
      },
      {
        network: "zetatestenet",
        chainId: 7001,
        urls: {
          apiURL: "",
          browserURL: "https://athens.explorer.zetachain.com/",
        },
      },
      {
        network: "storytestnet",
        chainId: 1516,
        urls: {
          apiURL: "https://odyssey.storyscan.xyz/api",
          browserURL: "https://odyssey.storyscan.xyz/",
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
