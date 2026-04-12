# EthLoan — Decentralized Peer-to-Peer Lending Platform

A full-stack decentralized application (DApp) enabling trustless, peer-to-peer lending on the Ethereum blockchain. Borrowers request collateral-backed loans, lenders fund them for interest-based returns, and all state transitions are enforced on-chain via smart contracts.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Smart Contract](#smart-contract)
- [Frontend](#frontend)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [Usage Guide](#usage-guide)
- [Project Structure](#project-structure)
- [Future Scope](#future-scope)

---

## Overview

EthLoan is a decentralized lending marketplace where:

- **Borrowers** lock ETH collateral (minimum 50% of the loan value) and request loans with configurable durations.
- **Lenders** browse available loan requests, evaluate borrower credit scores, and fund loans by sending the exact requested amount to the smart contract.
- **Repayment** is handled directly on-chain. Partial repayments are supported, and once the full repay amount is met, collateral is automatically returned to the borrower.
- **Credit scoring** and **Lender XP** are tracked on-chain to build transparent, immutable reputation.


---

## Architecture

```
Frontend (React + Web3.js)
        |
        | MetaMask / Injected Provider
        |
  Ethereum Network (Ganache / Testnet)
        |
  SimpleLendingContract.sol
        |
  On-chain State: Loans, Credit Scores, Lender XP
```

The frontend communicates with the smart contract through Web3.js, using MetaMask as the signing provider. A global `Web3Context` (React Context API) manages wallet connection state, contract instance, and connected account across all pages.

---

## Smart Contract

**File:** `contracts/SimpleLendingContract.sol`  
**Solidity Version:** ^0.8.19

---


## Prerequisites

Ensure the following are installed before proceeding:

| Tool | Version | Purpose |
|---|---|---|
| **Node.js** | >= 18.x | JavaScript runtime |
| **npm** | >= 9.x | Package manager (bundled with Node.js) |
| **Ganache** | Desktop or CLI | Local Ethereum blockchain for development |
| **MetaMask** | Browser extension | Wallet provider for signing transactions |
| **Truffle** | >= 5.x | Smart contract compilation, migration, and testing |

Install Truffle globally if you do not already have it:

```bash
npm install -g truffle
```

---

## Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Shashwat3012/decentralized-uli.git
cd decentralized-uli
```

### 2. Start Ganache

Open Ganache Desktop and create a new workspace, or run Ganache CLI:

```bash
ganache --port 7545 --networkId 5777
```

Confirm that Ganache is running on `http://127.0.0.1:7545`.

### 3. Compile and Deploy the Smart Contract

```bash
truffle compile
truffle migrate --reset --network development
```

This compiles the Solidity contract and deploys it to your local Ganache instance. The compiled ABI and contract address are automatically written to `frontend/src/contracts/SimpleLendingContract.json`.

### 4. Configure MetaMask

1. Open MetaMask and add a custom network:
   - **Network Name:** Ganache
   - **RPC URL:** `http://127.0.0.1:7545`
   - **Chain ID:** `1337`
   - **Currency Symbol:** ETH
2. Import a Ganache account using its private key for testing.

### 5. Install Frontend Dependencies and Start

```bash
cd frontend
npm install
npm start
```

The application will be available at `http://localhost:3000`.

---

## Usage Guide

### As a Borrower

1. Navigate to **Borrower Vault**.
2. Fill in the loan amount, collateral (minimum 50% of the loan), and duration.
3. Submit the request and confirm the MetaMask transaction.
4. Once a lender funds your loan, it moves to **Active Debt** status.
5. Enter partial or full repayment amounts and click **Repay**.
6. Once the total repay amount is met, your collateral is returned automatically.

### As a Lender

1. Navigate to the **Marketplace** to see open loan requests.
2. Evaluate each request's credit score and risk classification.
3. Click **Fund Loan** and confirm the transaction in MetaMask.
4. Track your funded position in the **Lender Vault**.
5. Once the borrower fully repays, you receive the principal plus interest.

### Viewing Your Profile

Navigate to **On-Chain Profile** to view your credit score, lender XP, lending rank, and a transaction analytics chart.

---

## Project Structure

```
decentralized-uli/
  contracts/
    SimpleLendingContract.sol    # Core lending smart contract
    SafeMath.sol                 # Arithmetic overflow protection
  migrations/
    1_inital_migration.js        # Truffle deployment script
  frontend/
    src/
      App.js                     # Routing, navigation, layout
      index.js                   # React entry point with providers
      index.css                  # Neurobrutalism design system (CSS)
      Web3Context.js             # Global blockchain state (Context API)
      LandingPage.js             # Wallet connection landing page
      MarketplacePage.js         # Loan discovery and funding
      BorrowerPage.js            # Loan request form and vault dashboard
      LenderPage.js              # Investment portfolio and yield tracking
      ProfilePage.js             # On-chain reputation and analytics
      contracts/
        SimpleLendingContract.json  # Compiled ABI + deployed address
    tailwind.config.js           # Tailwind with custom Neobrutalism colors
    package.json
  truffle-config.js              # Truffle network and compiler config
  README.md
```

---


## Future Scope

- **Liquidation Mechanism**: Automatic collateral seizure when loans exceed their duration without repayment.
- **Dynamic Interest Rates**: Credit-score-based interest calculation instead of a flat 10%.
- **Testnet Deployment**: Migration from Ganache to Sepolia or Holesky for public testing.
- **Multi-token Support**: ERC-20 token lending in addition to native ETH.
- **Governance**: On-chain voting for protocol parameters (interest rates, collateral ratios).
- **Security Audit**: Formal verification and third-party audit before any mainnet consideration.

---

## License

This project is licensed under the MIT License.
