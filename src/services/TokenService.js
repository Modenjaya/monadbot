const { ethers } = require("ethers");
const Provider = require("../core/Provider").getInstance;
const Utils = require("../core/Utils");
const config = require("../../config/config");
const WMonContract = require("../contracts/WMonContract");
const NftContract = require("../contracts/NftContract");

class TokenService {
  constructor(walletConfig = null) {
    this.walletConfig = walletConfig;
    this.provider = null;
    this.wallet = null;
    this.wmonContract = null;
    this.nftContract = null;
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

      // Initialize token contracts with the wallet
      this.wmonContract = new WMonContract(this.wallet);
      this.nftContract = new NftContract(config.contracts.nft, this.wallet);

      await this.wmonContract.initialize();
      await this.nftContract.initialize();

      // Verify NFT access if required
      const hasNft = await this.verifyNftAccess();
      
      if (!hasNft && config.nftRequired) {
        throw new Error("NFT access verification failed. Bot access denied.");
      }

      return true;
    } catch (error) {
      Utils.logger("error", `Failed to initialize TokenService: ${error.message}`);
      throw error;
    }
  }

  async verifyNftAccess() {
    try {
      // Check if the wallet holds the required NFT
      const balance = await this.nftContract.balanceOf(this.wallet.address);
      return balance > 0;
    } catch (error) {
      Utils.logger("error", `NFT verification error: ${error.message}`);
      return false;
    }
  }

  async getWalletInfo() {
    try {
      const address = this.wallet.address;
      
      // Get native token balance
      const balance = await this.provider.getBalance(address);
      
      // Get network information
      const network = await this.provider.getNetwork();
      
      // Get various token balances
      const wmonBalance = await this.wmonContract.balanceOf(address);
      
      // You can add other token checks here
      
      return {
        address: address,
        balance: ethers.formatEther(balance),
        network: network.name,
        tokens: {
          WMON: ethers.formatEther(wmonBalance),
          // Add other tokens here
        }
      };
    } catch (error) {
      Utils.logger("error", `Failed to get wallet info: ${error.message}`);
      throw error;
    }
  }

  // Other methods from the original TokenService
}

module.exports = TokenService;
