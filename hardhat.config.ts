import { defineConfig } from "hardhat/config";
import hardhatToolboxViem from "@nomicfoundation/hardhat-toolbox-viem";
import { config as loadEnv } from "dotenv";
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });
export default defineConfig({
  plugins: [hardhatToolboxViem],
  solidity: { version: "0.8.24", settings: { optimizer: { enabled: true, runs: 200 } } },
  networks: {
    baseSepolia: {
      type: "http", chainType: "op",
      url: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
      accounts: process.env.REPORT_PUBLISHER_PRIVATE_KEY ? [process.env.REPORT_PUBLISHER_PRIVATE_KEY] : [],
    },
  },
});
