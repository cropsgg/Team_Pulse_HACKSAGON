import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';

// Import contract ABIs
const MinimalTokenABI = require('../abi/MinimalToken.json');
const MinimalBadgeABI = require('../abi/MinimalBadge.json');
const FundingRoundABI = require('../abi/FundingRound.json');

@Injectable()
export class BlockchainService {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: ethers.JsonRpcProvider;
  private tokenContract: ethers.Contract;
  private badgeContract: ethers.Contract;
  private fundingRoundContract: ethers.Contract;

  constructor() {
    this.initializeProvider();
    this.initializeContracts();
  }

  private initializeProvider() {
    const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.logger.log(`Connected to blockchain: ${rpcUrl}`);
  }

  private initializeContracts() {
    const tokenAddress = process.env.CONTRACT_TOKEN_ADDRESS;
    const badgeAddress = process.env.CONTRACT_BADGE_ADDRESS;
    const fundingRoundAddress = process.env.CONTRACT_FUNDING_ROUND_ADDRESS;

    if (tokenAddress) {
      this.tokenContract = new ethers.Contract(
        tokenAddress,
        MinimalTokenABI,
        this.provider
      );
    }

    if (badgeAddress) {
      this.badgeContract = new ethers.Contract(
        badgeAddress,
        MinimalBadgeABI,
        this.provider
      );
    }

    if (fundingRoundAddress) {
      this.fundingRoundContract = new ethers.Contract(
        fundingRoundAddress,
        FundingRoundABI,
        this.provider
      );
    }

    this.logger.log('Smart contracts initialized');
  }

  // Token Contract Methods
  async getTokenBalance(address: string): Promise<string> {
    try {
      if (!this.tokenContract) {
        throw new Error('Token contract not initialized');
      }
      const balance = await this.tokenContract.balanceOf(address);
      return ethers.formatEther(balance);
    } catch (error) {
      this.logger.error('Error getting token balance:', error);
      throw error;
    }
  }

  async getTotalSupply(): Promise<string> {
    try {
      if (!this.tokenContract) {
        throw new Error('Token contract not initialized');
      }
      const supply = await this.tokenContract.totalSupply();
      return ethers.formatEther(supply);
    } catch (error) {
      this.logger.error('Error getting total supply:', error);
      throw error;
    }
  }

  async getTokenInfo() {
    try {
      if (!this.tokenContract) {
        throw new Error('Token contract not initialized');
      }
      
      const [name, symbol, totalSupply] = await Promise.all([
        this.tokenContract.name(),
        this.tokenContract.symbol(),
        this.tokenContract.totalSupply()
      ]);

      return {
        name,
        symbol,
        totalSupply: ethers.formatEther(totalSupply)
      };
    } catch (error) {
      this.logger.error('Error getting token info:', error);
      throw error;
    }
  }

  // Badge Contract Methods
  async getBadgeBalance(address: string): Promise<string> {
    try {
      if (!this.badgeContract) {
        throw new Error('Badge contract not initialized');
      }
      const balance = await this.badgeContract.balanceOf(address);
      return balance.toString();
    } catch (error) {
      this.logger.error('Error getting badge balance:', error);
      throw error;
    }
  }

  async getBadgeMetadata(tokenId: string) {
    try {
      if (!this.badgeContract) {
        throw new Error('Badge contract not initialized');
      }
      const tokenURI = await this.badgeContract.tokenURI(tokenId);
      return { tokenURI };
    } catch (error) {
      this.logger.error('Error getting badge metadata:', error);
      throw error;
    }
  }

  // Funding Round Contract Methods
  async getCampaignInfo(campaignId?: string) {
    try {
      if (!this.fundingRoundContract) {
        throw new Error('FundingRound contract not initialized');
      }
      
      // For now, we'll use the deployed contract as the campaign
      const [title, description, beneficiary, target, raised, deadline, isActive] = await Promise.all([
        this.fundingRoundContract.title(),
        this.fundingRoundContract.description(),
        this.fundingRoundContract.beneficiary(),
        this.fundingRoundContract.target(),
        this.fundingRoundContract.raised(),
        this.fundingRoundContract.deadline(),
        this.fundingRoundContract.isActive()
      ]);

      return {
        id: process.env.CONTRACT_FUNDING_ROUND_ADDRESS,
        title,
        description,
        beneficiary,
        target: ethers.formatEther(target),
        raised: ethers.formatEther(raised),
        deadline: new Date(Number(deadline) * 1000),
        isActive,
        progress: Number(raised) / Number(target) * 100
      };
    } catch (error) {
      this.logger.error('Error getting campaign info:', error);
      throw error;
    }
  }

  async getMilestones() {
    try {
      if (!this.fundingRoundContract) {
        return [];
      }
      
      const milestoneCount = await this.fundingRoundContract.getMilestoneCount();
      const milestones = [];

      for (let i = 0; i < milestoneCount; i++) {
        const milestone = await this.fundingRoundContract.milestones(i);
        milestones.push({
          id: i,
          title: milestone.title,
          description: milestone.description,
          amount: ethers.formatEther(milestone.amount),
          deadline: new Date(Number(milestone.deadline) * 1000),
          isCompleted: milestone.isCompleted,
          isApproved: milestone.isApproved
        });
      }

      return milestones;
    } catch (error) {
      this.logger.error('Error getting milestones:', error);
      throw error;
    }
  }

  // Donation Methods
  async getDonationHistory(address?: string) {
    try {
      // For now, return empty array - can be implemented later with proper event handling
      // This avoids ethers.js typing complexity
      this.logger.log('Donation history queried - returning mock data for now');
      return [];
    } catch (error) {
      this.logger.error('Error getting donation history:', error);
      return [];
    }
  }

  // Blockchain Status
  async getBlockchainStatus() {
    try {
      const [blockNumber, network] = await Promise.all([
        this.provider.getBlockNumber(),
        this.provider.getNetwork()
      ]);

      return {
        network: network.name,
        chainId: Number(network.chainId),
        blockNumber,
        tokenAddress: process.env.CONTRACT_TOKEN_ADDRESS,
        badgeAddress: process.env.CONTRACT_BADGE_ADDRESS,
        fundingRoundAddress: process.env.CONTRACT_FUNDING_ROUND_ADDRESS,
        isConnected: true
      };
    } catch (error) {
      this.logger.error('Error getting blockchain status:', error);
      return {
        network: 'disconnected',
        chainId: 0,
        blockNumber: 0,
        isConnected: false
      };
    }
  }

  // Utility Methods
  async getGasPrice(): Promise<string> {
    try {
      const gasPrice = await this.provider.getFeeData();
      return ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei');
    } catch (error) {
      this.logger.error('Error getting gas price:', error);
      return '0';
    }
  }

  async getTransaction(txHash: string) {
    try {
      const [tx, receipt] = await Promise.all([
        this.provider.getTransaction(txHash),
        this.provider.getTransactionReceipt(txHash)
      ]);

      return {
        hash: txHash,
        from: tx?.from,
        to: tx?.to,
        value: tx?.value ? ethers.formatEther(tx.value) : '0',
        gasUsed: receipt?.gasUsed?.toString(),
        status: receipt?.status,
        blockNumber: receipt?.blockNumber
      };
    } catch (error) {
      this.logger.error('Error getting transaction:', error);
      throw error;
    }
  }
} 