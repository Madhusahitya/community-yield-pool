# 🌱 Community Yield Pool

> **Earn yield while supporting public goods - A seamless DeFi experience that makes giving back automatic**

[![Built for Octant v2](https://img.shields.io/badge/Built%20for-Octant%20v2-8B5CF6)](https://octant.devfolio.co)
[![ERC-4626](https://img.shields.io/badge/ERC--4626-Compliant-4CAF50)](https://eips.ethereum.org/EIPS/eip-4626)
[![Aave v3](https://img.shields.io/badge/Aave-v3-1E88E5)](https://aave.com)

---

## 🎯 The Vision: Making Public Goods Funding Effortless

**What if every time you earned yield in DeFi, you could automatically support public goods without lifting a finger?**

That's exactly what Community Yield Pool does. We've built an ERC-4626 vault that doesn't just generate yield—it transforms idle capital into sustainable growth for the Ethereum ecosystem. Every deposit, every yield accrual, every transaction becomes an opportunity to fund the infrastructure that makes Web3 possible.

### Why This Matters

The Ethereum ecosystem thrives on public goods—from core infrastructure to developer tools, from educational resources to open-source protocols. Yet, funding these critical projects has always been a challenge. Community Yield Pool solves this by making public goods funding **automatic, transparent, and rewarding**.

**Users earn yield. Public goods get funded. Everyone wins.**

---

## 🏆 Built for Octant v2: A Perfect Match

This project is specifically designed for [Octant v2's yield donation infrastructure](https://octant.devfolio.co). We're not just building a vault—we're building a **yield donating strategy** that demonstrates how DeFi can be a force for good.

### How We Align with Octant v2's Mission

1. **Yield Donation Strategy** ✅ - Our vault automatically donates a configurable percentage of all generated yield to public goods
2. **Aave v3 Integration** ✅ - Leveraging battle-tested Aave v3 for secure, reliable yield generation
3. **ERC-4626 Standard** ✅ - Fully compliant with the tokenized vault standard, ensuring compatibility across DeFi
4. **Public Goods Focus** ✅ - Every design decision prioritizes impact on the public goods ecosystem
5. **Transparent & Trackable** ✅ - All donations are on-chain, verifiable, and trackable via events

---

## ✨ What Makes This Special

### 🎁 **Automatic Yield Donations** (Our Core Innovation)

Unlike traditional vaults that only focus on returns, Community Yield Pool **automatically donates a percentage of generated yield** to public goods on every operation. Users don't need to think about it—it just happens.

- **Configurable Percentage**: Vault owners can set donation percentage (default 10%)
- **Automatic Execution**: Donations happen on every deposit/withdraw operation
- **On-Chain Tracking**: Every donation is recorded via `YieldDonated` events
- **Cumulative Tracking**: `totalDonated` counter shows lifetime impact

### 🏦 **Aave v3 Integration** (Battle-Tested Yield Generation)

We leverage Aave v3's proven lending infrastructure to generate yield:

- Assets are automatically deposited to Aave v3
- Yield accrues continuously through interest-bearing aTokens
- No manual intervention required
- Secure, audited, and battle-tested protocol

### 📊 **ERC-4626 Standard Compliance**

Full compliance with the ERC-4626 tokenized vault standard means:

- Seamless integration with other DeFi protocols
- Standardized deposit/withdraw interfaces
- Share-based accounting for fair yield distribution
- Compatible with Octant v2's infrastructure

### 🎨 **Beautiful, Intuitive Frontend**

We didn't just build smart contracts—we built an experience:

- **Multi-Page UI**: Clean, professional interface with Connect → Deposit → Stats flow
- **Real-Time Updates**: Live balance tracking, transaction status, and impact metrics
- **Demo Mode**: Perfect for showcasing the product without needing testnet tokens
- **Pixel-Perfect Design**: Modern, beach-themed UI with smooth animations
- **Wallet Integration**: Seamless MetaMask/Web3Modal integration

---

## 🏗️ How It Works

```
┌─────────────┐
│   User      │
│  Deposits   │
│    DAI      │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│  Community Yield Pool   │
│   (ERC-4626 Vault)      │
│                         │
│  • Receives DAI         │
│  • Mints shares (CYP)   │
│  • Tracks yield         │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│    Aave v3 Pool         │
│                         │
│  • Lends DAI            │
│  • Generates yield      │
│  • Returns aTokens      │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│   Yield Distribution    │
│                         │
│  90% → User Returns     │
│  10% → Public Goods ✨  │
└─────────────────────────┘
```

### The Flow

1. **User deposits DAI** into the vault
2. **Vault mints shares** (CYP tokens) representing their stake
3. **Assets are automatically deposited** to Aave v3
4. **Yield accrues** continuously through Aave's interest mechanism
5. **On each operation**, the vault calculates generated yield
6. **10% of yield is automatically donated** to the configured public goods address
7. **90% of yield** remains in the vault, increasing share value
8. **User can withdraw** at any time, receiving their principal + 90% of accrued yield

---

## 🛠️ Technical Excellence

### Smart Contracts

- **Solidity 0.8.24** - Latest stable version with built-in overflow protection
- **OpenZeppelin Contracts v5.4.0** - Battle-tested, audited security primitives
- **Aave Core v3** - Industry-standard lending protocol integration
- **ERC-4626 Standard** - Full compliance with tokenized vault standard
- **Comprehensive Testing** - Extensive test suite covering edge cases

### Frontend

- **React 18.3** - Modern React with hooks and concurrent features
- **Wagmi v2** - Type-safe Ethereum interactions
- **Viem** - Efficient Ethereum utilities
- **Web3Modal** - Seamless wallet connection experience
- **TanStack Query** - Optimized data fetching and caching

### Code Quality

- **Clean Architecture**: Separation of concerns, modular design
- **Comprehensive Comments**: Every function documented
- **Error Handling**: Robust error handling throughout
- **Gas Optimization**: Efficient storage and computation patterns
- **Security First**: Access controls, input validation, safe math

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- MetaMask or compatible Web3 wallet
- Sepolia ETH for testing (get some [here](https://sepoliafaucet.com))

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd community-yield-pool

# Install dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Configuration

Create a `.env` file in the root directory:

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

### Deploy

```bash
# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia

# Run tests
npx hardhat test
```

### Run Frontend

```bash
cd frontend
npm start
```

Update `frontend/src/pages/DepositPage.js` with your deployed vault address.

---

## 📖 Usage Guide

### For Users

1. **Connect Your Wallet** - Click "Connect Wallet" and approve the connection
2. **Switch to Sepolia** - Make sure you're on Sepolia testnet
3. **Enter Amount** - Type how much DAI you want to deposit (or click MAX)
4. **Approve DAI** - First-time users need to approve the vault to spend DAI
5. **Deposit** - Click "Deposit" and confirm the transaction in MetaMask
6. **Watch Your Impact** - Navigate to the Stats page to see your contribution

### For Developers

#### Deploy a New Vault

```javascript
const vault = await CommunityYieldPool.deploy(
  DAI_ADDRESS,                    // Underlying asset
  PUBLIC_GOODS_ADDRESS,           // Donation recipient (e.g., Gitcoin)
  1000,                           // Donation percentage (1000 = 10%)
  AAVE_POOL_ADDRESSES_PROVIDER    // Aave v3 addresses provider
);
```

#### Configure Donations

```javascript
// Set donation percentage (owner only, in basis points)
await vault.setDonationPercent(1500); // 15%

// Set donation recipient (owner only)
await vault.setDonationRecipient(newPublicGoodsAddress);

// Check total donated
const totalDonated = await vault.totalDonated();
```

---

## 🎯 Hackathon Track Alignment

### 🥇 **Best Use of a Yield Donating Strategy** ($4,000)

**This is our primary track!** Community Yield Pool is built around a sophisticated yield donation mechanism:

- ✅ **Automatic yield calculation** on every operation
- ✅ **Configurable donation percentage** (default 10%)
- ✅ **On-chain tracking** via `totalDonated` and `YieldDonated` events
- ✅ **Seamless user experience** - donations happen automatically
- ✅ **Octant v2 compatible** - designed for their yield donation infrastructure

### 🥈 **Best Use of Aave v3** ($2,500)

Deep integration with Aave v3:

- ✅ **Direct Aave Pool integration** using official interfaces
- ✅ **aToken-based yield accrual** for efficient asset management
- ✅ **Automatic asset deployment** to Aave on deposit
- ✅ **Real-time yield tracking** through Aave's interest mechanism

### 🥉 **Best Public Goods Projects** ($3,000)

Public goods are at the heart of our mission:

- ✅ **Automatic funding** of public goods through yield donations
- ✅ **Transparent tracking** of all donations on-chain
- ✅ **User impact visibility** - users can see their contribution
- ✅ **Configurable recipients** - can support any public goods organization

### 🏅 **Best Code Quality** ($2,500)

We take code quality seriously:

- ✅ **Comprehensive test coverage** with edge case handling
- ✅ **Clean, documented code** with inline comments
- ✅ **Security best practices** using OpenZeppelin
- ✅ **Gas optimization** throughout
- ✅ **Modern development practices** and tooling

---

## 📊 Impact Metrics

### What Gets Tracked

- **Total Assets in Vault**: Total DAI deposited by all users
- **Total Donated**: Cumulative amount donated to public goods
- **User Shares**: Individual user's stake in the vault
- **Donation Percentage**: Current percentage of yield being donated

### Real-World Impact

Every deposit contributes to:
- **Open-source development** funding
- **Infrastructure improvements** for Ethereum
- **Educational resources** for developers
- **Public goods** that benefit the entire ecosystem

---

## 🔒 Security

### Security Measures

- ✅ **OpenZeppelin Contracts** - Battle-tested, audited security primitives
- ✅ **Access Control** - Owner-only functions for critical operations
- ✅ **Input Validation** - Comprehensive checks on all inputs
- ✅ **Safe Math** - Solidity 0.8+ built-in overflow protection
- ✅ **Comprehensive Testing** - Extensive test suite

### Audit Readiness

The codebase is structured for easy auditing:
- Clear separation of concerns
- Well-documented functions
- Standard patterns and practices
- No complex logic or hidden behaviors

---

## 🎬 Demo & Video

### Live Demo

Try it yourself! The frontend includes a **Demo Mode** that lets you experience the full flow without needing testnet tokens.

1. Connect your wallet
2. Turn on Demo Mode (button in header)
3. Enter an amount and click Deposit
4. Watch the seamless flow to the Stats page

### Video Walkthrough

[Add your video link here]

---

## 📁 Project Structure

```
community-yield-pool/
├── contracts/
│   ├── CommunityYieldPool.sol    # Main ERC-4626 vault with yield donation
│   ├── MockERC20.sol              # Mock tokens for testing
│   ├── MockAavePool.sol           # Mock Aave for testing
│   └── ...
├── scripts/
│   ├── deploy.js                  # Deployment script
│   └── wrap-weth.js               # Utility scripts
├── test/
│   └── CommunityYieldPool.js      # Comprehensive test suite
├── frontend/
│   ├── src/
│   │   ├── App.js                 # Main React app
│   │   ├── pages/
│   │   │   ├── ConnectPage.js     # Wallet connection
│   │   │   ├── DepositPage.js     # Deposit interface
│   │   │   └── StatsPage.js       # Impact metrics
│   │   └── wagmi.js               # Wagmi configuration
│   └── package.json
└── hardhat.config.js
```

---

## 🤝 Contributing

We welcome contributions! This project is built for the community, by the community.

### Areas for Contribution

- Additional yield strategies
- Frontend improvements
- Documentation enhancements
- Test coverage expansion
- Security audits

---

## 📄 License

MIT License - Feel free to build on this!

---

## 🙏 Acknowledgments

- **Octant v2** - For the vision and infrastructure that makes this possible
- **Aave** - For the battle-tested lending protocol
- **OpenZeppelin** - For the security primitives
- **Gitcoin** - For inspiring public goods funding
- **The Ethereum Community** - For building the infrastructure we all rely on

---

## 🔗 Links

- **Live Demo**: [Add your frontend URL]
- **Contract on Etherscan**: [Add your contract address]
- **Video Demo**: [Add your video URL]
- **Octant v2 Docs**: https://docs.v2.octant.build
- **Hackathon Page**: https://octant.devfolio.co

---

## 💬 Contact & Support

Questions? Feedback? Want to collaborate?

- **GitHub Issues**: Open an issue for bugs or feature requests
- **Discord**: [Add your Discord handle]
- **Twitter**: [Add your Twitter handle]

---

<div align="center">

**Built with ❤️ for public goods**

*Making DeFi a force for good, one yield at a time*

</div>
