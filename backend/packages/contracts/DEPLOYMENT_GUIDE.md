# ImpactChain Deployment Guide

## Step-by-Step Deployment Process

### Step 1: Environment Setup ✅

1. **Copy environment template**:
   ```bash
   cp .env.example .env
   ```

2. **Get API Keys**:
   - **Alchemy**: Sign up at https://alchemy.com for RPC endpoints
   - **PolygonScan**: Get API key at https://polygonscan.com/apis

3. **Configure .env**:
   ```env
   MUMBAI_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
   PRIVATE_KEY=your_wallet_private_key_here
   POLYGONSCAN_API_KEY=your_polygonscan_api_key
   ```

### Step 2: Mumbai Testnet Deployment 🚀

1. **Get Mumbai MATIC**:
   ```bash
   # Visit https://faucet.polygon.technology/
   # Request MATIC for your deployer address
   # Need at least 0.1 MATIC for deployment
   ```

2. **Deploy Contracts**:
   ```bash
   pnpm deploy:mumbai
   ```

3. **Expected Output**:
   ```
   🚀 Deploying to Polygon Mumbai Testnet...
   📍 Deployer address: 0x...
   💰 Deployer balance: 1.0 MATIC
   
   1️⃣ Deploying MinimalToken...
   ✅ MinimalToken deployed to: 0x...
   
   2️⃣ Deploying MinimalBadge...
   ✅ MinimalBadge deployed to: 0x...
   
   3️⃣ Deploying FundingRound...
   ✅ FundingRound deployed to: 0x...
   
   🎉 DEPLOYMENT COMPLETE!
   ```

### Step 3: Verify Contracts 🔍

1. **Automatic Verification** (included in deployment):
   ```bash
   npx hardhat verify --network mumbai <ADDRESS> <ARGS>
   ```

2. **Manual Verification** (if needed):
   ```bash
   pnpm verify:mumbai 0xTOKEN_ADDRESS "ImpactChain Token" "ICT" "0xDEPLOYER"
   ```

### Step 4: Backend Integration 🔗

1. **Update Backend Environment**:
   ```env
   # Add to backend/.env
   BLOCKCHAIN_NETWORK=mumbai
   CONTRACT_TOKEN_ADDRESS=0x...
   CONTRACT_BADGE_ADDRESS=0x...
   CONTRACT_FUNDING_ROUND_ADDRESS=0x...
   ```

2. **Test Blockchain Queries**:
   ```bash
   # Start backend services
   cd ../../
   pnpm dev:gateway
   
   # Test GraphQL queries
   query {
     blockchainStatus {
       network
       tokenAddress
       totalSupply
     }
   }
   ```

### Step 5: Frontend Integration 🌐

1. **Update Frontend Config**:
   ```typescript
   // frontend/src/lib/blockchain/config.ts
   export const CONTRACTS = {
     TOKEN: "0x...",
     BADGE: "0x...", 
     FUNDING_ROUND: "0x..."
   };
   ```

2. **Test Wallet Connection**:
   - Connect MetaMask to Mumbai testnet
   - Add Mumbai network (Chain ID: 80001)
   - Test contract interactions

### Step 6: Testing & Validation ✅

1. **Contract Interactions**:
   - Mint test tokens
   - Create funding campaign
   - Make test donation
   - Verify milestone tracking

2. **End-to-End Testing**:
   - Frontend → Backend → Blockchain
   - GraphQL queries return blockchain data
   - Wallet transactions work correctly

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Mumbai MATIC obtained (>0.1 MATIC)
- [ ] Contracts deployed successfully
- [ ] Contracts verified on PolygonScan
- [ ] Backend environment updated
- [ ] GraphQL blockchain queries working
- [ ] Frontend contract addresses updated
- [ ] Wallet integration tested
- [ ] End-to-end flow validated

## Troubleshooting

### Common Issues

1. **Insufficient MATIC Balance**:
   ```
   Error: insufficient funds for intrinsic transaction cost
   ```
   **Solution**: Get more MATIC from faucet

2. **Network Connection Issues**:
   ```
   Error: could not detect network
   ```
   **Solution**: Check RPC URL in .env

3. **Verification Failures**:
   ```
   Error: contract verification failed
   ```
   **Solution**: Ensure constructor arguments match exactly

### Support Resources

- **Discord**: Join ImpactChain development community
- **Documentation**: Check contract README.md
- **Issues**: Report bugs on GitHub

## Next Steps After Deployment

1. **Security Audit**: Professional contract review
2. **Advanced Features**: Deploy DAO governance contracts  
3. **Mainnet Preparation**: Production deployment checklist
4. **Monitoring**: Set up contract monitoring and alerts

---

**Status**: Ready for Mumbai deployment 🚀 