import { useReadContract, useWriteContract, useAccount, useChainId } from 'wagmi';
import { getContractAddresses, CONTRACT_ABIS } from '@/lib/contracts/config';
import { useTransaction } from '@/hooks/useTransaction';
import type { Address } from 'viem';

export function useRouter() {
  const { address } = useAccount();
  const chainId = useChainId();
  const contracts = getContractAddresses(chainId);
  const { execute, ...transactionState } = useTransaction();

  // Read functions
  const { data: allModules, isLoading: isLoadingModules, refetch: refetchModules } = useReadContract({
    address: contracts.Router as Address,
    abi: CONTRACT_ABIS.Router,
    functionName: 'getAllModules',
    query: {
      enabled: !!contracts.Router,
    },
  });

  const { data: isNGOModuleRegistered, isLoading: isLoadingNGOModule } = useReadContract({
    address: contracts.Router as Address,
    abi: CONTRACT_ABIS.Router,
    functionName: 'moduleIsRegistered',
    args: ['NGORegistry'],
    query: {
      enabled: !!contracts.Router,
    },
  });

  const { data: isStartupModuleRegistered, isLoading: isLoadingStartupModule } = useReadContract({
    address: contracts.Router as Address,
    abi: CONTRACT_ABIS.Router,
    functionName: 'moduleIsRegistered',
    args: ['StartupRegistry'],
    query: {
      enabled: !!contracts.Router,
    },
  });

  const { data: isPaused } = useReadContract({
    address: contracts.Router as Address,
    abi: CONTRACT_ABIS.Router,
    functionName: 'paused',
    query: {
      enabled: !!contracts.Router,
    },
  });

  // Write functions
  const { writeContractAsync } = useWriteContract();

  const registerNGO = async (ngoData: {
    profileHash: string;
    ngoAddress: Address;
  }) => {
    return execute(async () => {
      const hash = await writeContractAsync({
        address: contracts.Router as Address,
        abi: CONTRACT_ABIS.Router,
        functionName: 'registerNGO',
        args: [ngoData.profileHash, ngoData.ngoAddress],
      });
      return hash;
    });
  };

  const registerStartup = async (startupData: {
    founder: Address;
    valuationHash: string;
    equityToken: Address;
    targetFunding: bigint;
  }) => {
    return execute(async () => {
      const hash = await writeContractAsync({
        address: contracts.Router as Address,
        abi: CONTRACT_ABIS.Router,
        functionName: 'registerStartup',
        args: [startupData.founder, startupData.valuationHash, startupData.equityToken, startupData.targetFunding],
      });
      return hash;
    });
  };

  const donate = async (donationData: {
    ngoId: bigint;
    message: string;
    value: bigint;
  }) => {
    return execute(async () => {
      const hash = await writeContractAsync({
        address: contracts.Router as Address,
        abi: CONTRACT_ABIS.Router,
        functionName: 'donate',
        args: [donationData.ngoId, donationData.message],
        value: donationData.value,
      });
      return hash;
    });
  };

  return {
    // Read data
    allModules,
    isNGOModuleRegistered: !!isNGOModuleRegistered,
    isStartupModuleRegistered: !!isStartupModuleRegistered,
    isPaused: !!isPaused,
    
    // Loading states
    isLoadingModules,
    isLoadingNGOModule,
    isLoadingStartupModule,
    
    // Write functions
    registerNGO,
    registerStartup,
    donate,
    
    // Transaction state
    ...transactionState,
    
    // Utility
    refetchModules,
    contractAddress: contracts.Router,
  };
}

// Helper types for Router contract
export type AllModules = {
  names: string[];
  addresses: Address[];
};

export type NGORegistrationData = {
  profileHash: string;
  ngoAddress: Address;
};

export type StartupRegistrationData = {
  founder: Address;
  valuationHash: string;
  equityToken: Address;
  targetFunding: bigint;
};

export type DonationData = {
  ngoId: bigint;
  message: string;
  value: bigint;
}; 