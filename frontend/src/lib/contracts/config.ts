import { base, baseSepolia } from 'wagmi/chains';
import { 
  Router__factory,
  NGORegistry__factory,
  DonationManager__factory,
  MilestoneManager__factory,
  StartupRegistry__factory,
  EquityAllocator__factory,
  CSRManager__factory,
  FeeManager__factory,
  QAMemory__factory,
  ImpactGovernor__factory,
  ImpactTimelock__factory,
  ImpactToken__factory,
} from '../../../../contracts/typechain-types';

// Contract addresses for Base mainnet
export const BASE_MAINNET_CONTRACTS = {
  Router: '0xE45Fed3fda2135DF22463f616973A4CC6B55b23e' as const,
  NGORegistry: '0x6b7669e678A4fcd184f226337AF1D3F3E8444bEA' as const,
  FeeManager: '0xBb78afccf0c468f1FFE3880aFD9F782C30c8DbB1' as const,
  DonationManager: '0x42AE7560a93AE0A8a79B0b5Bdc6dEFA94C2c46C0' as const,
  MilestoneManager: '0x166001992691D4AbE3DFD949Cc3F53722F3C5b9a' as const,
  StartupRegistry: '0xcc5c186F02C1D6D0FF88f9354B5F190c46af2fF2' as const,
  EquityAllocator: '0xA45e9Fd7acE2aDa60C99D1387Da0Ac3301bA2A44' as const,
  CSRManager: '0x661D76508A0deA574DeD647DA0cd41Ad8A034d2e' as const,
  QAMemory: '0x66Eb36585a2224D294Af9bbEFa03A7d44a97DdA1' as const,
  // Governance contracts
  ImpactGovernor: '0xFa07a5c4dbCe5C35f8fE2EaD24483E5fdb73452E' as const,
  ImpactTimelock: '0xe53820245Fc4bD96Eb6a386EC847f4f3ec54623C' as const,
  ImpactToken: '0x6c8319A887Bd1d734399cD56AEAE73a797274BA8' as const,
} as const;

// Contract addresses for Base Sepolia (testnet) - These should be deployed separately for testing
export const BASE_SEPOLIA_CONTRACTS = {
  // Core contracts - deployed on Base Sepolia testnet
  Router: '0x6D20F4AA0EA903c73751f351E4a77f7E2A4d5398' as const,
  NGORegistry: '0xa791Cdea8213bD76c1bebdddbd07B88528f9bc43' as const,
  FeeManager: '0xF053473E969C50F2a947b72c7E431Ee1281D02E5' as const,
  DonationManager: '0xC3b85b01057B6675a1334F882ba356987Ccb5820' as const,
  MilestoneManager: '0xbd5F5c47a8d2903c051a559304e44A13Db6bE3Eb' as const,
  StartupRegistry: '0xDAD56C5145B0Ec90BF23d657b3DF3d80f954CE3d' as const,
  EquityAllocator: '0x8de3427e16b2cA9cBE763bd1B4e132886BE1F49A' as const,
  CSRManager: '0xB5f2f0E0d67D8cDF3EA403b122FeB1D3f9Adb156' as const,
  QAMemory: '0x8b5B21226F71Ae8868fc374a08A1aCcC9F01E7A8' as const,
  // Governance contracts (deployed on Base Sepolia testnet)
  ImpactGovernor: '0xd459dD06a287398282d230F4b4530CfEb0750Ccd' as const,
  ImpactTimelock: '0xc0cfA9F56e5fb987ea21be0123A1Ce597978887E' as const,
  ImpactToken: '0xd3324b4e26795FA9daee79B6C0275E7e7Fd9CC53' as const,
} as const;

// Contract ABIs
export const CONTRACT_ABIS = {
  Router: Router__factory.abi,
  NGORegistry: NGORegistry__factory.abi,
  DonationManager: DonationManager__factory.abi,
  MilestoneManager: MilestoneManager__factory.abi,
  StartupRegistry: StartupRegistry__factory.abi,
  EquityAllocator: EquityAllocator__factory.abi,
  CSRManager: CSRManager__factory.abi,
  FeeManager: FeeManager__factory.abi,
  QAMemory: QAMemory__factory.abi,
  ImpactGovernor: ImpactGovernor__factory.abi,
  ImpactTimelock: ImpactTimelock__factory.abi,
  ImpactToken: ImpactToken__factory.abi,
} as const;

// Helper function to get contract addresses for current chain
export function getContractAddresses(chainId: number) {
  switch (chainId) {
    case base.id:
      return BASE_SEPOLIA_CONTRACTS; // Force testnet for safety
    case baseSepolia.id:
      return BASE_SEPOLIA_CONTRACTS;
    default:
      return BASE_SEPOLIA_CONTRACTS; // Default to testnet for safety
  }
}

// Contract types
export type ContractName = keyof typeof BASE_MAINNET_CONTRACTS;
export type ContractAddresses = typeof BASE_MAINNET_CONTRACTS; 