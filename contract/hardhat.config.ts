import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-chai-matchers";
import "@nomicfoundation/hardhat-verify";
import "@typechain/hardhat";
import "@fhevm/hardhat-plugin";
import "hardhat-gas-reporter";
import "dotenv/config";

const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x" + "0".repeat(64);
const SEPOLIA_RPC = process.env.SEPOLIA_RPC_URL || "https://rpc.sepolia.org";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: "cancun",
      viaIR: true,
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    sepolia: {
      url: SEPOLIA_RPC,
      chainId: 11155111,
      accounts: [PRIVATE_KEY],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
};

export default config;
