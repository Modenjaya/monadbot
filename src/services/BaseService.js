const Provider = require("../core/Provider").getInstance;
const { ethers } = require("ethers");
const Utils = require("../core/Utils");

class BaseService {
  constructor(contractAddress = null, walletConfig = null) {
    this.contractAddress = contractAddress;
    this.walletConfig = walletConfig;
    this.provider = null;
    this.wallet = null;
    this.contract = null;
  }

  async initialize() {
    try {
      this.provider = Provider();
      
      // Initialize wallet based on provided config or default
      if (this.walletConfig && this.walletConfig.privateKey) {
        this.wallet = new ethers.Wallet(this.walletConfig.privateKey, this.provider);
      } else {
        this.wallet = this.provider.getSigner();
      }

      if (this.contractAddress) {
        // Initialize contract if address is provided
        // This would depend on your actual implementation
      }

      return true;
    } catch (error) {
      Utils.logger("error", `Failed to initialize service: ${error.message}`);
      throw error;
    }
  }

  // Common service methods
}

module.exports = BaseService;
