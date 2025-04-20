import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
// This adds support for typescript paths mappings
import "tsconfig-paths/register";

import dotenv from 'dotenv';
dotenv.config();  // Load environment variables from .env file 

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    localhost: {},
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: process.env.PRIVATE_KEYS?.split(',')
    }
  }
};

export default config;
