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

// Contract addresses for Base Sepolia (testnet)
export const BASE_SEPOLIA_CONTRACTS = {
  Router: '0xE45Fed3fda2135DF22463f616973A4CC6B55b23e' as const,
  NGORegistry: '0x6b7669e678A4fcd184f226337AF1D3F3E8444bEA' as const,
  FeeManager: '0xBb78afccf0c468f1FFE3880aFD9F782C30c8DbB1' as const,
  DonationManager: '0x42AE7560a93AE0A8a79B0b5Bdc6dEFA94C2c46C0' as const,
  MilestoneManager: '0x166001992691D4AbE3DFD949Cc3F53722F3C5b9a' as const,
  StartupRegistry: '0xcc5c186F02C1D6D0FF88f9354B5F190c46af2fF2' as const,
  EquityAllocator: '0xA45e9Fd7acE2aDa60C99D1387Da0Ac3301bA2A44' as const,
  CSRManager: '0x661D76508A0deA574DeD647DA0cd41Ad8A034d2e' as const,
  QAMemory: '0x66Eb36585a2224D294Af9bbEFa03A7d44a97DdA1' as const,
  // Governance contracts (same for testing)
  ImpactGovernor: '0xFa07a5c4dbCe5C35f8fE2EaD24483E5fdb73452E' as const,
  ImpactTimelock: '0xe53820245Fc4bD96Eb6a386EC847f4f3ec54623C' as const,
  ImpactToken: '0x6c8319A887Bd1d734399cD56AEAE73a797274BA8' as const,
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
      return BASE_MAINNET_CONTRACTS;
    case baseSepolia.id:
      return BASE_SEPOLIA_CONTRACTS;
    default:
      return BASE_MAINNET_CONTRACTS; // Default to mainnet
  }
}

// Contract types
export type ContractName = keyof typeof BASE_MAINNET_CONTRACTS;
export type ContractAddresses = typeof BASE_MAINNET_CONTRACTS; 