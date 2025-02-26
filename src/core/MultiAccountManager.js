const Application = require("../app");
const Utils = require("./Utils");
const config = require("../../config/config");
const fs = require("fs");
const path = require("path");

class MultiAccountManager {
  constructor(accountConfigs = []) {
    this.accounts = [];
    this.accountConfigs = accountConfigs;
  }

  // Load account configurations from a JSON file
  loadAccountsFromFile(filePath) {
    try {
      const fullPath = path.resolve(filePath);
      if (!fs.existsSync(fullPath)) {
        Utils.logger("error", `Accounts file not found: ${fullPath}`);
        return false;
      }

      const fileContent = fs.readFileSync(fullPath, "utf8");
      this.accountConfigs = JSON.parse(fileContent);
      Utils.logger("info", `Loaded ${this.accountConfigs.length} accounts from ${filePath}`);
      return true;
    } catch (error) {
      Utils.logger("error", `Failed to load accounts from file: ${error.message}`);
      return false;
    }
  }

  async initialize() {
    try {
      if (this.accountConfigs.length === 0) {
        throw new Error("No account configurations provided");
      }

      Utils.logger("info", `Initializing ${this.accountConfigs.length} accounts`);
      
      for (let i = 0; i < this.accountConfigs.length; i++) {
        const accountConfig = this.accountConfigs[i];
        const accountName = accountConfig.name || `Account ${i+1}`;
        Utils.logger("info", `Initializing ${accountName}`);
        
        // Create a custom config for this account
        const appConfig = {
          ...config,
          wallet: {
            privateKey: accountConfig.privateKey,
            address: accountConfig.address
          },
          // Optional: Override other configurations if needed
          cycles: accountConfig.cycles || config.cycles,
          logPrefix: accountName, // Used for logging
          uiPort: 3000 + i // If you want to expose a web UI for each account
        };
        
        // Create a new Application instance with this configuration
        const app = new Application(appConfig);
        this.accounts.push({
          config: appConfig,
          app: app,
          name: accountName,
          active: false
        });
        
        // Delay to avoid resource contention
        await Utils.delay(2000);
      }
      
      return true;
    } catch (error) {
      Utils.logger("error", `Failed to initialize accounts: ${error.message}`);
      return false;
    }
  }

  async startAll() {
    try {
      // Initialize all accounts first
      const initialized = await this.initialize();
      
      if (!initialized) {
        throw new Error("Failed to initialize accounts");
      }
      
      // Start all accounts in parallel
      const promises = this.accounts.map(async (account, index) => {
        try {
          Utils.logger("info", `Starting ${account.name}`);
          
          // Start the application non-blocking
          account.app.start().catch(err => {
            Utils.logger("error", `Error in ${account.name}: ${err.message}`);
          });
          
          account.active = true;
          return true;
        } catch (error) {
          Utils.logger("error", `Failed to start ${account.name}: ${error.message}`);
          return false;
        }
      });
      
      await Promise.all(promises);
      Utils.logger("info", "All accounts started");
      
      // Keep the process running
      await new Promise(() => {});
      
    } catch (error) {
      Utils.logger("error", `Failed to start accounts: ${error.message}`);
      throw error;
    }
  }

  getStatus() {
    return this.accounts.map(account => ({
      name: account.name,
      active: account.active,
      address: account.config.wallet.address
    }));
  }
}

module.exports = MultiAccountManager;
