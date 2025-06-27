# ImpactChain Smart Contracts

Production-ready smart contracts for the ImpactChain AI × Blockchain Charity Platform.

## Contracts Overview

### MinimalToken (ERC-20)
- **Symbol**: ICT (ImpactChain Token)
- **Features**: Donation-based minting, transparent distribution
- **Use Case**: Governance and reward tokens for donors

### MinimalBadge (ERC-721)
- **Type**: SoulBound NFT badges
- **Features**: Non-transferable reputation badges
- **Use Case**: Reputation system for contributors and organizations

### FundingRound
- **Type**: Milestone-based fundraising contract
- **Features**: Escrow, milestone tracking, oracle verification
- **Use Case**: Transparent campaign funding with accountability

## Deployment Guide

### Prerequisites

1. **Environment Setup**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. **Required Environment Variables**:
   ```env
   MUMBAI_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_API_KEY
   PRIVATE_KEY=your_private_key_here
   POLYGONSCAN_API_KEY=your_polygonscan_api_key_here
   ```

3. **Get Mumbai MATIC**:
   - Visit: https://faucet.polygon.technology/
   - Request test MATIC for your deployer address

### Local Development

```bash
# Start local Hardhat node
pnpm node

# Deploy to local network
pnpm deploy:local
```

### Mumbai Testnet Deployment

```bash
# Deploy to Mumbai testnet
pnpm deploy:mumbai

# Verify contracts (after deployment)
pnpm verify:mumbai <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

### Polygon Mainnet Deployment

```bash
# Deploy to Polygon mainnet (use with caution)
pnpm deploy:polygon
```

## Contract Addresses

### Mumbai Testnet
After deployment, addresses will be saved to `deployment-mumbai.json`:
```json
{
  "network": "mumbai",
  "contracts": {
    "token": "0x...",
    "badge": "0x...",
    "fundingRound": "0x..."
  }
}
```

### Verification

Contracts can be verified on PolygonScan:
```bash
npx hardhat verify --network mumbai <ADDRESS> <CONSTRUCTOR_ARGS>
```

## Integration with Backend

Update your backend environment with deployed addresses:
```env
# Contract Addresses (Mumbai)
CONTRACT_TOKEN_ADDRESS=0x...
CONTRACT_BADGE_ADDRESS=0x...
CONTRACT_FUNDING_ROUND_ADDRESS=0x...
```

## Security Considerations

1. **Private Key Management**: Never commit private keys to version control
2. **Oracle Security**: Oracle address should be a secure multi-sig wallet
3. **Fee Configuration**: Platform fees are set to 2.5% (250 basis points)
4. **Milestone Verification**: Requires oracle approval for milestone completion

## Testing

```bash
# Run contract tests
pnpm test

# Run with coverage
pnpm coverage

# Check contract sizes
pnpm size
```

## Development Scripts

- `pnpm compile` - Compile contracts
- `pnpm test` - Run tests
- `pnpm node` - Start local node
- `pnpm clean` - Clean artifacts
- `pnpm flatten` - Flatten contracts for verification

## Architecture

```
FundingRound
├── Milestone tracking
├── Escrow management
├── Oracle verification
└── Fee distribution

MinimalToken (ERC-20)
├── Donation-based minting
├── Transparent supply
└── Governance rights

MinimalBadge (ERC-721)
├── SoulBound properties
├── Reputation tracking
└── Achievement system
```

## Next Steps

1. **Deploy to Mumbai**: Complete testnet deployment
2. **Backend Integration**: Connect GraphQL resolvers
3. **Frontend Integration**: Wallet connection and UI
4. **Advanced Features**: DAO governance contracts
5. **Security Audit**: Professional security review
6. **Mainnet Deployment**: Production deployment

## Resources

- [Polygon Mumbai Faucet](https://faucet.polygon.technology/)
- [Mumbai PolygonScan](https://mumbai.polygonscan.com/)
- [Hardhat Documentation](https://hardhat.org/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)

---

**⚠️ Security Notice**: These contracts are for development/testing. Conduct thorough security audits before mainnet deployment. 