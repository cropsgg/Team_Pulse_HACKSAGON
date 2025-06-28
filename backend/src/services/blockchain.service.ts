import { ethers } from 'ethers';
import { logger } from '@/utils/logger';
import { cacheService, CACHE_KEYS, CACHE_TTL } from '@/config/redis';
import { Currency } from '@/models/Project.model';

export interface BlockchainConfig {
  rpcUrl: string;
  privateKey: string;
  contractAddresses: {
    impactChain: string;
    donationManager: string;
    equityAllocator: string;
    csrManager: string;
  };
  supportedNetworks: {
    mainnet: string;
    testnet: string;
    polygon: string;
  };
}

export interface TransactionResult {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  gasUsed?: string;
  effectiveGasPrice?: string;
}

export interface TokenBalance {
  currency: Currency;
  balance: string;
  balanceUSD: number;
}

export interface FundingTransaction {
  projectId: string;
  donorAddress: string;
  amount: string;
  currency: Currency;
  transactionHash: string;
  blockNumber: number;
  timestamp: Date;
}

export class BlockchainService {
  private provider: ethers.Provider;
  private wallet: ethers.Wallet;
  private config: BlockchainConfig;
  private contracts: Record<string, ethers.Contract>;

  constructor() {
    this.config = {
      rpcUrl: process.env.BLOCKCHAIN_RPC_URL || 'https://polygon-rpc.com',
      privateKey: process.env.BLOCKCHAIN_PRIVATE_KEY || '',
      contractAddresses: {
        impactChain: process.env.IMPACT_CHAIN_CONTRACT || '',
        donationManager: process.env.DONATION_MANAGER_CONTRACT || '',
        equityAllocator: process.env.EQUITY_ALLOCATOR_CONTRACT || '',
        csrManager: process.env.CSR_MANAGER_CONTRACT || ''
      },
      supportedNetworks: {
        mainnet: 'https://mainnet.infura.io/v3/',
        testnet: 'https://sepolia.infura.io/v3/',
        polygon: 'https://polygon-rpc.com'
      }
    };

    this.initializeProvider();
    this.initializeContracts();
  }

  /**
   * Initialize blockchain provider and wallet
   */
  private initializeProvider(): void {
    try {
      this.provider = new ethers.JsonRpcProvider(this.config.rpcUrl);
      
      if (this.config.privateKey) {
        this.wallet = new ethers.Wallet(this.config.privateKey, this.provider);
      }

      logger.info('Blockchain provider initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize blockchain provider:', error);
      throw new Error('Blockchain service initialization failed');
    }
  }

  /**
   * Initialize smart contracts
   */
  private initializeContracts(): void {
    try {
      this.contracts = {};
      
      // Initialize contract instances (would need actual ABIs in production)
      const contractABI = [
        "function donate(string projectId, uint256 amount) external payable",
        "function withdrawFunds(string projectId, uint256 amount) external",
        "function getProjectFunding(string projectId) external view returns (uint256)",
        "function allocateEquity(address investor, uint256 percentage) external",
        "function verifyMilestone(string milestoneId) external",
        "event DonationReceived(string indexed projectId, address indexed donor, uint256 amount)",
        "event FundsWithdrawn(string indexed projectId, uint256 amount)",
        "event MilestoneVerified(string indexed milestoneId, bool verified)"
      ];

      if (this.config.contractAddresses.impactChain) {
        this.contracts.impactChain = new ethers.Contract(
          this.config.contractAddresses.impactChain,
          contractABI,
          this.wallet || this.provider
        );
      }

      logger.info('Smart contracts initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize smart contracts:', error);
    }
  }

  /**
   * Process a donation to a project
   */
  async processDonation(
    projectId: string,
    donorAddress: string,
    amount: string,
    currency: Currency
  ): Promise<TransactionResult> {
    try {
      logger.info('Processing donation', { projectId, donorAddress, amount, currency });

      if (!this.contracts.impactChain) {
        throw new Error('ImpactChain contract not initialized');
      }

      // Convert amount to Wei if dealing with ETH
      const amountWei = currency === Currency.ETH 
        ? ethers.parseEther(amount)
        : ethers.parseUnits(amount, 18); // Assuming 18 decimals for tokens

      // Call smart contract donation function
      const tx = await this.contracts.impactChain.donate(projectId, amountWei, {
        value: currency === Currency.ETH ? amountWei : 0,
        gasLimit: 300000
      });

      const result: TransactionResult = {
        hash: tx.hash,
        status: 'pending'
      };

      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      result.status = receipt.status === 1 ? 'confirmed' : 'failed';
      result.blockNumber = receipt.blockNumber;
      result.gasUsed = receipt.gasUsed.toString();
      result.effectiveGasPrice = receipt.effectiveGasPrice.toString();

      logger.info('Donation processed successfully', {
        projectId,
        transactionHash: result.hash,
        status: result.status
      });

      return result;
    } catch (error) {
      logger.error('Donation processing failed:', error);
      throw new Error('Failed to process donation on blockchain');
    }
  }

  /**
   * Withdraw funds for a project
   */
  async withdrawProjectFunds(
    projectId: string,
    amount: string,
    recipientAddress: string
  ): Promise<TransactionResult> {
    try {
      logger.info('Withdrawing project funds', { projectId, amount, recipientAddress });

      if (!this.contracts.impactChain) {
        throw new Error('ImpactChain contract not initialized');
      }

      const amountWei = ethers.parseEther(amount);

      const tx = await this.contracts.impactChain.withdrawFunds(projectId, amountWei, {
        gasLimit: 250000
      });

      const receipt = await tx.wait();

      const result: TransactionResult = {
        hash: tx.hash,
        status: receipt.status === 1 ? 'confirmed' : 'failed',
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        effectiveGasPrice: receipt.effectiveGasPrice.toString()
      };

      logger.info('Funds withdrawn successfully', {
        projectId,
        transactionHash: result.hash,
        amount
      });

      return result;
    } catch (error) {
      logger.error('Fund withdrawal failed:', error);
      throw new Error('Failed to withdraw funds from blockchain');
    }
  }

  /**
   * Get project funding from blockchain
   */
  async getProjectFunding(projectId: string): Promise<string> {
    try {
      const cacheKey = CACHE_KEYS.PROJECT_FUNDING(projectId);
      const cached = await cacheService.get<string>(cacheKey);

      if (cached) {
        return cached;
      }

      if (!this.contracts.impactChain) {
        throw new Error('ImpactChain contract not initialized');
      }

      const fundingWei = await this.contracts.impactChain.getProjectFunding(projectId);
      const fundingEth = ethers.formatEther(fundingWei);

      // Cache for 5 minutes
      await cacheService.set(cacheKey, fundingEth, 300);

      return fundingEth;
    } catch (error) {
      logger.error('Error fetching project funding:', error);
      throw new Error('Failed to fetch project funding from blockchain');
    }
  }

  /**
   * Get wallet balances for multiple currencies
   */
  async getWalletBalances(walletAddress: string): Promise<TokenBalance[]> {
    try {
      const cacheKey = CACHE_KEYS.WALLET_BALANCE(walletAddress);
      const cached = await cacheService.get<TokenBalance[]>(cacheKey);

      if (cached) {
        return cached;
      }

      const balances: TokenBalance[] = [];

      // Get ETH balance
      const ethBalance = await this.provider.getBalance(walletAddress);
      const ethBalanceFormatted = ethers.formatEther(ethBalance);
      
      balances.push({
        currency: Currency.ETH,
        balance: ethBalanceFormatted,
        balanceUSD: parseFloat(ethBalanceFormatted) * await this.getTokenPrice(Currency.ETH)
      });

      // Get token balances (would need token contract addresses)
      const supportedTokens = [Currency.USDC, Currency.USDT, Currency.DAI];
      
      for (const token of supportedTokens) {
        try {
          const tokenBalance = await this.getTokenBalance(walletAddress, token);
          balances.push(tokenBalance);
        } catch (error) {
          logger.warn(`Failed to fetch ${token} balance:`, error);
        }
      }

      // Cache for 2 minutes
      await cacheService.set(cacheKey, balances, 120);

      return balances;
    } catch (error) {
      logger.error('Error fetching wallet balances:', error);
      throw new Error('Failed to fetch wallet balances');
    }
  }

  /**
   * Verify milestone completion on blockchain
   */
  async verifyMilestone(milestoneId: string): Promise<TransactionResult> {
    try {
      logger.info('Verifying milestone on blockchain', { milestoneId });

      if (!this.contracts.impactChain) {
        throw new Error('ImpactChain contract not initialized');
      }

      const tx = await this.contracts.impactChain.verifyMilestone(milestoneId, {
        gasLimit: 200000
      });

      const receipt = await tx.wait();

      const result: TransactionResult = {
        hash: tx.hash,
        status: receipt.status === 1 ? 'confirmed' : 'failed',
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        effectiveGasPrice: receipt.effectiveGasPrice.toString()
      };

      logger.info('Milestone verified on blockchain', {
        milestoneId,
        transactionHash: result.hash
      });

      return result;
    } catch (error) {
      logger.error('Milestone verification failed:', error);
      throw new Error('Failed to verify milestone on blockchain');
    }
  }

  /**
   * Listen for blockchain events
   */
  async startEventListeners(): Promise<void> {
    try {
      if (!this.contracts.impactChain) {
        logger.warn('Cannot start event listeners: ImpactChain contract not initialized');
        return;
      }

      // Listen for donation events
      this.contracts.impactChain.on('DonationReceived', async (projectId, donor, amount, event) => {
        logger.info('Donation event received', {
          projectId,
          donor,
          amount: ethers.formatEther(amount),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash
        });

        // TODO: Update project funding in database
        // await this.updateProjectFundingInDB(projectId, amount);
      });

      // Listen for withdrawal events
      this.contracts.impactChain.on('FundsWithdrawn', async (projectId, amount, event) => {
        logger.info('Withdrawal event received', {
          projectId,
          amount: ethers.formatEther(amount),
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash
        });
      });

      // Listen for milestone verification events
      this.contracts.impactChain.on('MilestoneVerified', async (milestoneId, verified, event) => {
        logger.info('Milestone verification event received', {
          milestoneId,
          verified,
          blockNumber: event.blockNumber,
          transactionHash: event.transactionHash
        });
      });

      logger.info('Blockchain event listeners started successfully');
    } catch (error) {
      logger.error('Failed to start event listeners:', error);
    }
  }

  /**
   * Get current gas price
   */
  async getCurrentGasPrice(): Promise<string> {
    try {
      const feeData = await this.provider.getFeeData();
      return ethers.formatUnits(feeData.gasPrice || 0, 'gwei');
    } catch (error) {
      logger.error('Error fetching gas price:', error);
      return '20'; // Default gas price in gwei
    }
  }

  /**
   * Estimate transaction gas
   */
  async estimateTransactionGas(
    to: string,
    data: string,
    value: string = '0'
  ): Promise<string> {
    try {
      const gasEstimate = await this.provider.estimateGas({
        to,
        data,
        value: ethers.parseEther(value)
      });

      return gasEstimate.toString();
    } catch (error) {
      logger.error('Error estimating gas:', error);
      return '200000'; // Default gas limit
    }
  }

  // Private helper methods

  private async getTokenBalance(walletAddress: string, currency: Currency): Promise<TokenBalance> {
    // This would require actual token contract addresses and ABIs
    // For now, return mock data
    return {
      currency,
      balance: '0',
      balanceUSD: 0
    };
  }

  private async getTokenPrice(currency: Currency): Promise<number> {
    try {
      const cacheKey = `token_price:${currency}`;
      const cached = await cacheService.get<number>(cacheKey);

      if (cached) {
        return cached;
      }

      // Mock price data - in production, integrate with price APIs like CoinGecko
      const mockPrices: Record<Currency, number> = {
        [Currency.ETH]: 2000,
        [Currency.USDC]: 1,
        [Currency.USDT]: 1,
        [Currency.DAI]: 1,
        [Currency.MATIC]: 0.8
      };

      const price = mockPrices[currency] || 0;

      // Cache for 5 minutes
      await cacheService.set(cacheKey, price, 300);

      return price;
    } catch (error) {
      logger.error('Error fetching token price:', error);
      return 0;
    }
  }

  /**
   * Check if address is valid Ethereum address
   */
  isValidAddress(address: string): boolean {
    try {
      return ethers.isAddress(address);
    } catch {
      return false;
    }
  }

  /**
   * Format currency amount for display
   */
  formatCurrencyAmount(amount: string, currency: Currency, decimals: number = 4): string {
    try {
      const numAmount = parseFloat(amount);
      return `${numAmount.toFixed(decimals)} ${currency}`;
    } catch {
      return `0 ${currency}`;
    }
  }
} 