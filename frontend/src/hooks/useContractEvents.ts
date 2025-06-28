import { useWatchContractEvent, useChainId } from 'wagmi';
import { useCallback, useState, useEffect } from 'react';
import { getContractAddresses, CONTRACT_ABIS } from '@/lib/contracts/config';
import { toast } from 'sonner';
import type { Address } from 'viem';

export interface ContractEvent {
  eventName: string;
  contractName: string;
  args: any;
  blockNumber: bigint;
  transactionHash: string;
  timestamp: number;
}

export function useContractEvents() {
  const chainId = useChainId();
  const contracts = getContractAddresses(chainId);
  const [events, setEvents] = useState<ContractEvent[]>([]);

  const addEvent = useCallback((event: ContractEvent) => {
    setEvents(prev => [event, ...prev.slice(0, 49)]); // Keep last 50 events
  }, []);

  // NGO Events
  useWatchContractEvent({
    address: contracts.NGORegistry as Address,
    abi: CONTRACT_ABIS.NGORegistry,
    eventName: 'NGORegistered',
    onLogs: (logs) => {
      logs.forEach(log => {
        addEvent({
          eventName: 'NGORegistered',
          contractName: 'NGORegistry',
          args: log.args,
          blockNumber: log.blockNumber!,
          transactionHash: log.transactionHash!,
          timestamp: Date.now(),
        });
        toast.success(`New NGO registered: ID ${log.args.ngoId}`);
      });
    },
  });

  useWatchContractEvent({
    address: contracts.NGORegistry as Address,
    abi: CONTRACT_ABIS.NGORegistry,
    eventName: 'NGOVerified',
    onLogs: (logs) => {
      logs.forEach(log => {
        addEvent({
          eventName: 'NGOVerified',
          contractName: 'NGORegistry',
          args: log.args,
          blockNumber: log.blockNumber!,
          transactionHash: log.transactionHash!,
          timestamp: Date.now(),
        });
        toast.success(`NGO verified: ID ${log.args.ngoId}`);
      });
    },
  });

  // Donation Events
  useWatchContractEvent({
    address: contracts.DonationManager as Address,
    abi: CONTRACT_ABIS.DonationManager,
    eventName: 'DonationIn',
    onLogs: (logs) => {
      logs.forEach(log => {
        addEvent({
          eventName: 'DonationIn',
          contractName: 'DonationManager',
          args: log.args,
          blockNumber: log.blockNumber!,
          transactionHash: log.transactionHash!,
          timestamp: Date.now(),
        });
        const args = log.args as any;
        toast.success(`New donation: ${args.amount} ETH to NGO ${args.ngoId}`);
      });
    },
  });

  useWatchContractEvent({
    address: contracts.DonationManager as Address,
    abi: CONTRACT_ABIS.DonationManager,
    eventName: 'FundsReleased',
    onLogs: (logs) => {
      logs.forEach(log => {
        addEvent({
          eventName: 'FundsReleased',
          contractName: 'DonationManager',
          args: log.args,
          blockNumber: log.blockNumber!,
          transactionHash: log.transactionHash!,
          timestamp: Date.now(),
        });
        const args = log.args as any;
        toast.info(`Funds released: ${args.amount} ETH to NGO ${args.ngoId}`);
      });
    },
  });

  // Startup Events
  useWatchContractEvent({
    address: contracts.StartupRegistry as Address,
    abi: CONTRACT_ABIS.StartupRegistry,
    eventName: 'StartupListed',
    onLogs: (logs) => {
      logs.forEach(log => {
        addEvent({
          eventName: 'StartupListed',
          contractName: 'StartupRegistry',
          args: log.args,
          blockNumber: log.blockNumber!,
          transactionHash: log.transactionHash!,
          timestamp: Date.now(),
        });
        const args = log.args as any;
        toast.success(`New startup registered: ID ${args.startupId}`);
      });
    },
  });

  useWatchContractEvent({
    address: contracts.StartupRegistry as Address,
    abi: CONTRACT_ABIS.StartupRegistry,
    eventName: 'FundingRoundOpened',
    onLogs: (logs) => {
      logs.forEach(log => {
        addEvent({
          eventName: 'FundingRoundOpened',
          contractName: 'StartupRegistry',
          args: log.args,
          blockNumber: log.blockNumber!,
          transactionHash: log.transactionHash!,
          timestamp: Date.now(),
        });
        const args = log.args as any;
        toast.info(`Funding round created for startup ${args.startupId}`);
      });
    },
  });

  useWatchContractEvent({
    address: contracts.StartupRegistry as Address,
    abi: CONTRACT_ABIS.StartupRegistry,
    eventName: 'VCVoteCast',
    onLogs: (logs) => {
      logs.forEach(log => {
        addEvent({
          eventName: 'VCVoteCast',
          contractName: 'StartupRegistry',
          args: log.args,
          blockNumber: log.blockNumber!,
          transactionHash: log.transactionHash!,
          timestamp: Date.now(),
        });
        const args = log.args as any;
        toast.info(`VC vote cast for round ${args.roundId}`);
      });
    },
  });

  // Milestone Events
  useWatchContractEvent({
    address: contracts.MilestoneManager as Address,
    abi: CONTRACT_ABIS.MilestoneManager,
    eventName: 'MilestoneCreated',
    onLogs: (logs) => {
      logs.forEach(log => {
        addEvent({
          eventName: 'MilestoneCreated',
          contractName: 'MilestoneManager',
          args: log.args,
          blockNumber: log.blockNumber!,
          transactionHash: log.transactionHash!,
          timestamp: Date.now(),
        });
        const args = log.args as any;
        toast.info(`Milestone created: ${args.milestoneId}`);
      });
    },
  });

  useWatchContractEvent({
    address: contracts.MilestoneManager as Address,
    abi: CONTRACT_ABIS.MilestoneManager,
    eventName: 'VerificationProofSubmitted',
    onLogs: (logs) => {
      logs.forEach(log => {
        addEvent({
          eventName: 'VerificationProofSubmitted',
          contractName: 'MilestoneManager',
          args: log.args,
          blockNumber: log.blockNumber!,
          transactionHash: log.transactionHash!,
          timestamp: Date.now(),
        });
        const args = log.args as any;
        toast.info(`Proof submitted for milestone ${args.milestoneId}`);
      });
    },
  });

  useWatchContractEvent({
    address: contracts.MilestoneManager as Address,
    abi: CONTRACT_ABIS.MilestoneManager,
    eventName: 'MilestoneCompleted',
    onLogs: (logs) => {
      logs.forEach(log => {
        addEvent({
          eventName: 'MilestoneCompleted',
          contractName: 'MilestoneManager',
          args: log.args,
          blockNumber: log.blockNumber!,
          transactionHash: log.transactionHash!,
          timestamp: Date.now(),
        });
        const args = log.args as any;
        toast.success(`Milestone completed: ${args.milestoneId}`);
      });
    },
  });

  // Governance Events
  useWatchContractEvent({
    address: contracts.ImpactGovernor as Address,
    abi: CONTRACT_ABIS.ImpactGovernor,
    eventName: 'ProposalCreated',
    onLogs: (logs) => {
      logs.forEach(log => {
        addEvent({
          eventName: 'ProposalCreated',
          contractName: 'ImpactGovernor',
          args: log.args,
          blockNumber: log.blockNumber!,
          transactionHash: log.transactionHash!,
          timestamp: Date.now(),
        });
        const args = log.args as any;
        toast.info(`New governance proposal created: ${args.proposalId}`);
      });
    },
  });

  useWatchContractEvent({
    address: contracts.ImpactGovernor as Address,
    abi: CONTRACT_ABIS.ImpactGovernor,
    eventName: 'VoteCast',
    onLogs: (logs) => {
      logs.forEach(log => {
        addEvent({
          eventName: 'VoteCast',
          contractName: 'ImpactGovernor',
          args: log.args,
          blockNumber: log.blockNumber!,
          transactionHash: log.transactionHash!,
          timestamp: Date.now(),
        });
        const args = log.args as any;
        toast.info(`Governance vote cast on proposal ${args.proposalId}`);
      });
    },
  });

  useWatchContractEvent({
    address: contracts.ImpactGovernor as Address,
    abi: CONTRACT_ABIS.ImpactGovernor,
    eventName: 'ProposalExecuted',
    onLogs: (logs) => {
      logs.forEach(log => {
        addEvent({
          eventName: 'ProposalExecuted',
          contractName: 'ImpactGovernor',
          args: log.args,
          blockNumber: log.blockNumber!,
          transactionHash: log.transactionHash!,
          timestamp: Date.now(),
        });
        toast.success(`Governance proposal executed: ${log.args.proposalId}`);
      });
    },
  });

  return {
    events,
    clearEvents: () => setEvents([]),
    contractAddresses: contracts,
  };
}

// Hook for specific contract events
export function useContractEvent(
  contractName: keyof typeof CONTRACT_ABIS,
  eventName: string,
  onEvent?: (event: ContractEvent) => void
) {
  const chainId = useChainId();
  const contracts = getContractAddresses(chainId);
  const [latestEvent, setLatestEvent] = useState<ContractEvent | null>(null);

  useWatchContractEvent({
    address: contracts[contractName] as Address,
    abi: CONTRACT_ABIS[contractName],
    eventName: eventName as any,
    onLogs: (logs) => {
      logs.forEach(log => {
        const event: ContractEvent = {
          eventName,
          contractName,
          args: log.args,
          blockNumber: log.blockNumber!,
          transactionHash: log.transactionHash!,
          timestamp: Date.now(),
        };
        setLatestEvent(event);
        onEvent?.(event);
      });
    },
  });

  return latestEvent;
} 