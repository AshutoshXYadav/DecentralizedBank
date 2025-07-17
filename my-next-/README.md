# VaultX: Decentralized Banking & Bitcoin-Backed Lending Platform

## Overview
VaultX is a modern, full-stack decentralized banking platform that lets users:
- Manage ETH and Bitcoin-backed collateral
- Create and repay loans using Bitcoin as collateral
- Schedule, automate, and manage recurring payments on-chain
- Enjoy a beautiful, app-like UI inspired by DigiLocker

## Features
- **User Dashboard**: View balances, loans, collateral, and scheduled payments
- **Bitcoin Collateral Management**: Add/remove BTC collateral (off-chain representation)
- **Bitcoin-Backed Loans**: Borrow ETH using BTC as collateral, with real-time collateral ratio and interest calculation
- **Scheduled Payments**: Create, manage, and automate recurring payments with blockchain automation
- **Automation & Keepers**: Chainlink Keepers integration for true on-chain automation
- **Modern UI/UX**: Sidebar navigation, responsive design, and consistent theming
- **Security**: Wallet-based authentication (MetaMask), no custodial risk

## Tech Stack
- **Frontend**: Next.js (App Router), React, Tailwind CSS
- **Smart Contracts**: Solidity (Hardhat), Chainlink Automation
- **Blockchain**: Ethereum (tested on Sepolia/Testnet)
- **Wallet**: MetaMask, ethers.js v6

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- MetaMask browser extension

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/vaultx.git
   cd vaultx/my-next-
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Configure Environment:**
   - Update contract addresses in `src/utils/contract.js` and `src/app/api/blockchain/route.js` after deploying your contracts.
   - (Optional) Set up your own Infura/Alchemy RPC in the backend API.

4. **Run the app locally:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Smart Contract Deployment
1. **Compile contracts:**
   ```bash
   npx hardhat compile
   ```
2. **Deploy to local/testnet:**
   ```bash
   npx hardhat run scripts/deploy.js --network <network>
   ```
3. **Update contract addresses in the frontend as needed.**

## Usage
- **Connect your wallet** (MetaMask)
- **Add Bitcoin collateral** in the "Collateral" section
- **Create a loan** in the "Make Loan" section
- **View and repay loans** in "History & Repay"
- **Schedule and manage payments** in the "Scheduled Payments" section
- **Monitor automation status and test automation**

## Smart Contract Info
- **Contracts:** `contracts/Bank.sol`, `contracts/Lock.sol`
- **Key Functions:**
  - `addBitcoinCollateral`, `removeBitcoinCollateral`
  - `createLoan`, `repayLoan`, `getRepaymentAmount`
  - `createScheduledPayment`, `executeScheduledPayment`, `cancelScheduledPayment`
  - Chainlink Keepers for automation

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a pull request

## License
[MIT](./LICENSE)

---

**VaultX** — Secure, transparent, and instant blockchain banking for everyone.
