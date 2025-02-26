# Monad-BOT

Monad-BOT is a blockchain automation tool designed to interact with various cryptocurrency services on the Monad network for swapping and staking tokens. It provides a dashboard interface to monitor operations and logs, and it cycles through tasks like swapping, wrapping/unwrapping, and staking/unstaking tokens.

## Features

- **Modular Architecture**: Well-organized codebase with separate modules for services, contracts, API interactions, and UI components.
- **Interactive Dashboard**: Real-time updates on balance, network status, transaction history, and service statuses.
- **Multiple Exchange Support**: Interact with different swap platforms including Rubic, Izumi, and Beanswap.
- **Staking Integration**: Automated staking and unstaking operations with the Magma staking platform.
- **Automated Cycles**: Configurable cycles for executing swap and staking operations with randomized amounts and delays.
- **Comprehensive Logging**: Detailed logging system for monitoring and debugging.

## Project Structure

```
Monad-BOT/
├── config/ # Configuration files
│ ├── config.js
│ ├── config.json
│ └── BeanswapABI.js
├── src/
│ ├── core/ # Core functionality
│ │ ├── Provider.js # Ethereum provider
│ │ └── Utils.js # Utility functions
│ ├── api/ # API handlers
│ │ ├── ApiClient.js
│ │ └── BlockvisionApi.js
│ ├── services/ # Service layer
│ │ ├── BaseService.js
│ │ ├── StakingService.js
│ │ ├── SwapService.js
│ │ ├── TokenService.js
│ │ ├── BeanswapService.js
│ │ └── index.js
│ ├── contracts/ # Contract interactions
│ │ ├── ContractBase.js
│ │ ├── WMonContract.js
│ │ ├── StakingContract.js
│ │ ├── NftContract.js
│ │ └── BeanswapContract.js
│ ├── ui/ # UI components
│ │ ├── Dashboard.js
│ │ ├── InfoDisplay.js
│ │ ├── LogPanel.js
│ │ ├── ChartPanel.js
│ │ └── StatusPanel.js
│ └── app.js # Application logic
├── logs/ # Log files directory
├── main.js # Entry point
└── private.key
```

## Installation

1. Clone the repository:

   ```bash
   git clone https://codeberg.org/Galkurta/Monad-BOT.git
   cd Monad-BOT
   ```

2. Install dependencies:

```bash
npm install
```

3. Add your private key to the private.key file:

```
your_private_key
```

## Usage

Start the bot:

```bash
npm start
```

Run in development mode (with auto-reload):

```bash
npm run dev
```

## Dashboard Interface: The TUI (Terminal User Interface) dashboard will display real-time information about the bot's operations, including:

Current wallet balance
Network status
Token balances
Transaction logs
Service statuses
Transaction amount chart

## Configuration

Network Settings: Configure the RPC URL and explorer URL in config/config.json.
API Endpoints: Set the API endpoints for liquid staking and Blockvision.
Contract Addresses: Update the contract addresses for WMON, Apriori, Magma, NFT, and Beanswap.
Cycle Parameters: Adjust the cycle count, cooldown time, and delay settings.
Gas Settings: Configure gas limits and maximum gas price.

## Supported Platforms

- **Rubic Swap**: Token swapping via Rubic
- **Izumi Swap**: Token swapping via Izumi
- **Beanswap: Token**: swapping via Beanswap
- **Magma Staking**: Staking and unstaking operations

## Dependencies

ethers: For interacting with the Monad blockchain
axios: For making HTTP requests to external APIs
blessed & blessed-contrib: For creating the terminal-based dashboard interface
dotenv: For environment variable management

## License

This project is licensed under the ISC License.

## Contact

Codeberg: https://codeberg.org/Galkurta
Telegram: https://t.me/galkutaarchive
