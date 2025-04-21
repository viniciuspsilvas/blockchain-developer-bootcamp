# Blockchain Developer Bootcamp - DApp University

> Author: [Vinicius](https://github.com/viniciuspsilvas)
>
> This project was developed as part of the DApp University course, with the sole purpose of study and learning in blockchain development.

## 🚀 Main Technologies

The project uses the following main technologies:

- **Frontend**:
  - Next.js 15.1.4
  - React 19
  - Redux Toolkit
  - Framer Motion
  - TailwindCSS
  - ApexCharts

- **Blockchain**:
  - Hardhat
  - Ethers.js
  - Solidity
  - TypeChain

- **Infrastructure**:
  - Vercel (Deploy)
  - Infura (RPC Provider)

## 🌐 Deploy

The project is available at: [https://blockchain-developer-bootcamp-zlqb.vercel.app/](https://blockchain-developer-bootcamp-zlqb.vercel.app/)

## 🛠️ Environment Setup

1. Clone the repository:
```bash
git clone [REPOSITORY_URL]
cd blockchain-developer-bootcamp
```

2. Install dependencies:
```bash
yarn install
```

3. Configure environment variables:
Create a `.env` file in the project root with the following variables:
```env
INFURA_API_KEY=your_api_key
PRIVATE_KEY=your_private_key
```

## 🏗️ Contract Compilation and Deploy

The project uses two main deployment scripts:

1. **1_deploy.ts**: Deploys the smart contracts:
   - DAPP (Dapp University token)
   - mETH (mock Ethereum)
   - mDAI (mock DAI)
   - Exchange contract with fee account and 10% fee rate

2. **2_seed-exchange.ts**: Populates the exchange with initial data:
   - Transfers tokens between users
   - Approves and deposits tokens
   - Creates and fills orders
   - Seeds open orders for testing

### Deployment Commands:

1. Compile contracts:
```bash
yarn hardhat:compile
```

2. Deploy to Localhost:
```bash
yarn hardhat:node
yarn hardhat:deploy
yarn hardhat:seed
```

3. Deploy to Sepolia:
```bash
yarn hardhat:deploy:sepolia
yarn hardhat:seed:sepolia
```

## 🚀 Running the Project

1. Start the development server:
```bash
yarn dev
```

2. Access the project at: `http://localhost:3000`

## 🔒 Security and Vulnerabilities

The current project has some known vulnerabilities that need to be addressed:

- Reentrancy attacks
- Integer overflow/underflow
- Front-running
- Gas limit issues

## 🚀 Next Steps and Improvements

1. **Flash Loans Implementation**:
   - Integration with lending protocols
   - Arbitrage logic implementation
   - Fee and repayment system

2. **Security Improvements**:
   - OpenZeppelin Contracts implementation
   - Code audit
   - Penetration testing
   - Protection against common attacks

3. **Contract Upgrades**:
   - Diamond Standard implementation (EIP-2535)
   - Proxy system for upgrades
   - Version management
   - Data migration

## 📚 Resources and References

- [DApp University](https://www.dappuniversity.com/)
- [Hardhat Documentation](https://hardhat.org/)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Diamond Standard (EIP-2535)](https://eips.ethereum.org/EIPS/eip-2535)

## 📝 License

This project is for educational purposes only. Do not use in production without proper audits and security improvements.

## 🤝 Contribution

Contributions are welcome! Please open an issue to discuss the changes you would like to make.

---

Developed as part of the DApp University course - For educational purposes only.

## Hardhat commands:
npx hardhat compile
npx hardhat run --network localhost ./scripts/1_deploy.ts
npx hardhat console --network localhost

npx hardhat test


TODO:
- [ ] Add Make order component 
 - New order 
  - buy or sell
  - amount
  - price



REFERENCES:
- https://ethereum.org/en/developers/docs/smart-contracts/security/
- https://blaize.tech/
- https://github.com/mudgen/diamond-1-hardhat
- https://eips.ethereum.org/EIPS/eip-2535
- https://dev.to/mudgen/what-is-diamond-storage-3n7c
- https://medium.com/1milliondevs/new-storage-layout-for-proxy-contracts-and-diamonds-98d01d0eadb
- https://dev.to/mudgen/understanding-diamonds-on-ethereum-1fb
- https://eips.ethereum.org/EIPS/eip-1822
- https://eips.ethereum.org/EIPS/eip-1538#erc1538query
- https://eips.ethereum.org/EIPS/eip-1538#erc1538query