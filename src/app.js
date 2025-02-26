const { ethers } = require("ethers");
const Dashboard = require("./ui/Dashboard");
const {
  StakingService,
  SwapService,
  TokenService,
  BeanswapService,
} = require("./services");
const Utils = require("./core/Utils");
const defaultConfig = require("../config/config");
const Provider = require("./core/Provider").getInstance;

class Application {
  constructor(customConfig = null) {
    // Use custom config if provided, otherwise use default
    this.config = customConfig || defaultConfig;
    
    this.dashboard = null;
    this.services = {};
    this.transactionHistory = [];
    this.cycleCount = 0;
    this.tokenService = null;
    
    // Set log prefix for identification in logs
    this.logPrefix = this.config.logPrefix || "";

    process.on("unhandledRejection", this.handleUnhandledRejection.bind(this));
  }

  // Log with account prefix for better identification
  log(message) {
    const prefixedMessage = this.logPrefix ? `[${this.logPrefix}] ${message}` : message;
    this.dashboard?.updateLog(prefixedMessage);
    Utils.logger("info", prefixedMessage);
  }

  handleUnhandledRejection(error) {
    this.log(`Unhandled error: ${error.message}`);
    Utils.logger("error", `[${this.logPrefix}] Unhandled rejection: ${error.message}`);
  }

  initializeDashboard() {
    try {
      // You may need to modify Dashboard to support custom titles/ports
      this.dashboard = new Dashboard({
        title: this.logPrefix || "Monad Bot",
        port: this.config.uiPort || 3000
      });
      this.dashboard.screen.render();
    } catch (error) {
      Utils.logger("error", `[${this.logPrefix}] Failed to initialize dashboard: ${error.message}`);
      process.exit(1);
    }
  }

  async initialize() {
    try {
      this.initializeDashboard();

      this.dashboard.updateTable([
        ["Initializing...", "Pending", new Date().toLocaleTimeString()],
      ]);

      this.log("Initializing services...");
      this.dashboard.updateStatus("Initializing");

      // Get provider with the account's private key
      const provider = Provider(this.config.wallet?.privateKey);

      // Initialize TokenService with wallet config
      this.tokenService = new TokenService(this.config.wallet);
      await this.tokenService.initialize();

      this.log("NFT access verified successfully");

      const walletInfo = await this.tokenService.getWalletInfo();
      this.dashboard.updateTokens(walletInfo.tokens);
      this.dashboard.updateBalance(walletInfo.balance);
      this.dashboard.updateNetwork(walletInfo.network);
      this.dashboard.setCycles(0, this.config.cycles.default);

      const serviceDefinitions = {
        rubicSwap: { name: "Rubic Swap", service: SwapService },
        izumiSwap: { name: "Izumi Swap", service: SwapService },
        beanSwap: { name: "Bean Swap", service: BeanswapService },
        magmaStaking: {
          name: "Magma Staking",
          service: StakingService,
          address: this.config.contracts.magma,
        },
      };

      for (const [key, info] of Object.entries(serviceDefinitions)) {
        this.log(`Initializing ${info.name}...`);
        this.dashboard.addService(info.name, "Initializing");

        try {
          // Pass wallet config to each service
          this.services[key] = info.address
            ? new info.service(info.address, this.config.wallet)
            : new info.service(null, this.config.wallet);

          await this.services[key].initialize();
          this.log(`${info.name} initialized successfully`);
          this.dashboard.updateServiceStatus(info.name, "Active");
        } catch (error) {
          this.log(`Failed to initialize ${info.name}: ${error.message}`);
          this.dashboard.updateServiceStatus(info.name, "Error");
          this.dashboard.updateStatus("Error");
          throw error;
        }

        await Utils.delay(1000);
      }

      this.dashboard.updateLineChart([
        { time: new Date().toLocaleTimeString(), amount: 0 },
      ]);
      this.dashboard.updateStatus("Active");

      return true;
    } catch (error) {
      this.log(`Initialization error: ${error.message}`);
      this.dashboard?.updateStatus("Error");
      return false;
    }
  }

  // Rest of the Application class - update methods to use this.config instead of config
  // and update log calls to use this.log() instead of this.dashboard?.updateLog()
  
  // ... other methods from the original Application class (with modifications)
  
  async start() {
    try {
      Utils.logger("info", `[${this.logPrefix}] Starting Monad Bot...`);

      const initialized = await this.initialize();

      if (!initialized) {
        throw new Error("Failed to initialize services");
      }

      this.log("All services initialized. Starting cycles...");

      while (true) {
        for (let i = 0; i < this.config.cycles.default; i++) {
          this.cycleCount++;
          await this.runCycle();

          this.dashboard.setCycles(this.cycleCount, this.config.cycles.default);

          if (i < this.config.cycles.default - 1) {
            const delay = Utils.getRandomDelay();
            this.log(`Waiting ${delay / 1000} seconds before next cycle...`);
            await Utils.delay(delay);
          }
        }

        this.log("Starting cooldown period of 12 hours...");
        this.dashboard.updateStatus("Cooling Down");
        await Utils.delay(this.config.cycles.cooldownTime);
        this.cycleCount = 0;
        this.dashboard.setCycles(0, this.config.cycles.default);
        this.dashboard.updateStatus("Active");
      }
    } catch (error) {
      this.log(`Fatal error: ${error.message}`);
      this.dashboard?.updateStatus("Error");
      Utils.logger("error", `[${this.logPrefix}] Fatal error: ${error.message}`);
      await new Promise(() => {});
    }
  }

  // Include other methods like runCycle with this.config and this.log
}

module.exports = Application;
