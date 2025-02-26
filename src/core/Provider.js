const { ethers } = require("ethers");
const config = require("../../config/config");
const fs = require("fs");
const path = require("path");

class Provider {
  constructor() {
    this.provider = null;
    this.wallet = null;
  }

  static instance = null;

  static getInstance(privateKey = null) {
    if (!Provider.instance) {
      Provider.instance = new Provider();
    }

    // If a new private key is provided, create a new provider/wallet
    if (privateKey) {
      Provider.instance.setupWallet(privateKey);
    }

    return Provider.instance.getProvider();
  }

  getProvider() {
    if (!this.provider) {
      this.setupProvider();
    }
    return this.provider;
  }

  setupProvider() {
    try {
      // Use RPC URL from config
      this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
      
      // Setup wallet with default private key if not already set up
      if (!this.wallet) {
        this.setupDefaultWallet();
      }
    } catch (error) {
      throw new Error(`Failed to setup provider: ${error.message}`);
    }
  }

  setupDefaultWallet() {
    try {
      // Try to read private key from file or environment
      let privateKey = null;
      
      // Check if private key file exists
      const keyPath = path.join(__dirname, "../..", "private.key");
      if (fs.existsSync(keyPath)) {
        privateKey = fs.readFileSync(keyPath, "utf8").trim();
      } else if (process.env.PRIVATE_KEY) {
        privateKey = process.env.PRIVATE_KEY.trim();
      }
      
      if (privateKey) {
        this.wallet = new ethers.Wallet(privateKey, this.provider);
      }
    } catch (error) {
      throw new Error(`Failed to setup wallet: ${error.message}`);
    }
  }

  setupWallet(privateKey) {
    try {
      if (privateKey && this.provider) {
        this.wallet = new ethers.Wallet(privateKey, this.provider);
      }
    } catch (error) {
      throw new Error(`Failed to setup wallet with provided key: ${error.message}`);
    }
  }
}

module.exports = Provider;
