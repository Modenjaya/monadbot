#!/usr/bin/env node
const path = require('path');
const fs = require('fs');
const MultiAccountManager = require('./src/core/MultiAccountManager');
const Utils = require('./src/core/Utils');

// Command line arguments
const args = process.argv.slice(2);
let accountsFilePath = path.join(__dirname, 'accounts.json');

// Check for custom accounts file path
const fileArgIndex = args.findIndex(arg => arg === '--accounts' || arg === '-a');
if (fileArgIndex !== -1 && args.length > fileArgIndex + 1) {
  accountsFilePath = args[fileArgIndex + 1];
}

async function main() {
  try {
    // Display banner
    console.log("=======================================");
    console.log("           MONAD MULTI-BOT            ");
    console.log("=======================================");
    console.log(`Loading accounts from: ${accountsFilePath}`);
    
    // Check if accounts file exists
    if (!fs.existsSync(accountsFilePath)) {
      console.error(`Error: Accounts file not found: ${accountsFilePath}`);
      console.log("Creating example accounts file template...");
      
      // Create a template file
      const exampleAccounts = [
        {
          "name": "Account 1",
          "privateKey": "your_private_key_here",
          "address": "your_wallet_address_here",
          "cycles": {
            "default": 10,
            "cooldownTime": 43200000
          }
        },
        {
          "name": "Account 2",
          "privateKey": "your_private_key_here",
          "address": "your_wallet_address_here",
          "cycles": {
            "default": 8,
            "cooldownTime": 39600000
          }
        }
      ];
      
      fs.writeFileSync(accountsFilePath, JSON.stringify(exampleAccounts, null, 2));
      console.log(`Template created at: ${accountsFilePath}`);
      console.log("Please edit the file with your account details and run again.");
      process.exit(1);
    }
    
    // Create and initialize the manager
    const manager = new MultiAccountManager();
    
    // Load accounts from file
    const loaded = manager.loadAccountsFromFile(accountsFilePath);
    if (!loaded) {
      throw new Error("Failed to load accounts from file");
    }
    
    // Log the accounts loaded (without private keys for security)
    const accounts = manager.accountConfigs.map(acc => ({
      name: acc.name,
      address: acc.address,
      cycles: acc.cycles
    }));
    
    console.log(`Loaded ${accounts.length} accounts:`);
    accounts.forEach((acc, i) => {
      console.log(`${i+1}. ${acc.name} (${acc.address})`);
    });
    
    // Start all accounts
    console.log("\nStarting all accounts...");
    await manager.startAll();
    
  } catch (error) {
    console.error(`Fatal error: ${error.message}`);
    Utils.logger("error", `Fatal error in multi-account manager: ${error.message}`);
    process.exit(1);
  }
}

// Run the main function
main();
