import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.10",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    shibuya_local: {
      url: "http://127.0.0.1:42225",
      chainId: 81,
      accounts: ["0x01ab6e801c06e59ca97a14fc0a1978b27fa366fc87450e0b65459dd3515b7391"],
    },
    shiden_local: {
      url: "http://127.0.0.1:42226",
      chainId: 336,
      accounts:
          ["0x01ab6e801c06e59ca97a14fc0a1978b27fa366fc87450e0b65459dd3515b7391"],
    },
  },
};

export default config;
