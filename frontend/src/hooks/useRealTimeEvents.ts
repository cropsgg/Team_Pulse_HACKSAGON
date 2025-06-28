'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePublicClient, useWatchContractEvent } from 'wagmi';
import { useAuth } from '@/hooks/useAuth';
import { getContractAddresses, CONTRACT_ABIS } from '@/lib/contracts/config';
import { useChainId } from 'wagmi';
import { toast } from 'sonner';

// Event types for different contracts
export interface ContractEvent {
  id: string;
  contractName: string;
  eventName: string;
  args: Record<string, any>;
  blockNumber: number;
  transactionHash: string;
  timestamp: number;
  processed: boolean;
}

export interface DonationEvent extends ContractEvent {
  donor: string;
  ngoId: number;
  amount: bigint;
  currency: string;
  message?: string;
}

export interface MilestoneEvent extends ContractEvent {
  ngoId: number;
  milestoneId: number;
  status: string;
  verifier?: string;
}

export interface InvestmentEvent extends ContractEvent {
  investor: string;
  startupId: number;
  amount: bigint;
  equityPercentage: number;
}

export interface GovernanceEvent extends ContractEvent {
  proposalId: number;
  voter?: string;
  support?: number;
  votes?: bigint;
}

// Event listener configuration
interface EventListenerConfig {
  contractName: keyof typeof CONTRACT_ABIS;
  eventName: string;
  enabled: boolean;
  userSpecific?: boolean; // Only listen for events related to current user
  onEvent?: (event: ContractEvent) => void;
}

export function useRealTimeEvents() {
  const { user, walletAddress } = useAuth();
  const chainId = useChainId();
  const publicClient = usePublicClient();
  
  // Event storage
  const [events, setEvents] = useState<ContractEvent[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [eventCounts, setEventCounts] = useState<Record<string, number>>({});
  
  // Event listeners state
  const eventListeners = useRef<Map<string, any>>(new Map());
  const processedEvents = useRef<Set<string>>(new Set());

  const contractAddresses = getContractAddresses(chainId);

  // Add event to storage
  const addEvent = useCallback((event: ContractEvent) => {
    const eventId = `${event.transactionHash}-${event.eventName}-${event.blockNumber}`;
    
    // Prevent duplicate processing
    if (processedEvents.current.has(eventId)) return;
    processedEvents.current.add(eventId);

    const newEvent = { ...event, id: eventId };
    
    setEvents(prev => [newEvent, ...prev].slice(0, 100)); // Keep only last 100 events
    setEventCounts(prev => ({
      ...prev,
      [event.contractName]: (prev[event.contractName] || 0) + 1
    }));

    // Show notification for relevant events
    if (shouldNotifyUser(newEvent)) {
      showEventNotification(newEvent);
    }
  }, []);

  // Check if user should be notified about this event
  const shouldNotifyUser = useCallback((event: ContractEvent): boolean => {
    if (!user || !walletAddress) return false;

    // Check if event involves current user
    const userAddress = walletAddress.toLowerCase();
    const eventArgs = event.args;

    // Check common user-related fields
    const userFields = ['donor', 'investor', 'voter', 'user', 'owner', 'creator'];
    return userFields.some(field => 
      eventArgs[field] && eventArgs[field].toLowerCase() === userAddress
    );
  }, [user, walletAddress]);

  // Show notification for events
  const showEventNotification = useCallback((event: ContractEvent) => {
    const eventTitle = formatEventTitle(event);
    const eventMessage = formatEventMessage(event);

    toast.success(eventTitle, {
      description: eventMessage,
      duration: 5000,
      action: {
        label: 'View Details',
        onClick: () => {
          // Navigate to relevant page based on event type
          window.location.href = getEventNavigationUrl(event);
        }
      }
    });
  }, []);

  // Format event title for notifications
  const formatEventTitle = (event: ContractEvent): string => {
    switch (event.eventName) {
      case 'DonationIn':
        return '💝 Donation Received!';
      case 'MilestoneCompleted':
        return '🎯 Milestone Completed!';
      case 'InvestmentMade':
        return '💰 Investment Received!';
      case 'ProposalCreated':
        return '📝 New Proposal Created';
      case 'VoteCast':
        return '🗳️ Vote Cast';
      case 'NGORegistered':
        return '🏢 NGO Registered';
      case 'StartupListed':
        return '🚀 Startup Registered';
      default:
        return `📡 ${event.eventName}`;
    }
  };

  // Format event message for notifications
  const formatEventMessage = (event: ContractEvent): string => {
    const args = event.args;
    
    switch (event.eventName) {
      case 'DonationIn':
        return `${formatAmount(args.amount)} donated to your cause`;
      case 'MilestoneCompleted':
        return `Milestone #${args.milestoneId} has been completed`;
      case 'InvestmentMade':
        return `${formatAmount(args.amount)} invested in your startup`;
      case 'ProposalCreated':
        return `Proposal #${args.proposalId}: ${args.title || 'New governance proposal'}`;
      case 'VoteCast':
        return `Vote cast on proposal #${args.proposalId}`;
      default:
        return `New ${event.eventName} event`;
    }
  };

  // Get navigation URL for event
  const getEventNavigationUrl = (event: ContractEvent): string => {
    const args = event.args;
    
    switch (event.eventName) {
      case 'DonationIn':
        return `/dashboard?tab=donations`;
      case 'MilestoneCompleted':
        return `/dashboard?tab=milestones`;
      case 'InvestmentMade':
        return `/dashboard?tab=investments`;
      case 'ProposalCreated':
      case 'VoteCast':
        return `/governance/proposal/${args.proposalId}`;
      default:
        return '/dashboard';
    }
  };

  // Format amount for display
  const formatAmount = (amount: bigint): string => {
    const ethAmount = Number(amount) / 1e18;
    return `${ethAmount.toFixed(4)} ETH`;
  };

  // Start listening to contract events
  const startListening = useCallback(() => {
    if (isListening || !publicClient) return;

    setIsListening(true);
    
    // Define event listeners configuration
    const eventConfigs: EventListenerConfig[] = [
      // Donation events
      {
        contractName: 'DonationManager',
        eventName: 'DonationIn',
        enabled: true,
        userSpecific: true,
      },
      {
        contractName: 'DonationManager',
        eventName: 'FundsReleased',
        enabled: true,
        userSpecific: true,
      },
      // Milestone events
      {
        contractName: 'MilestoneManager',
        eventName: 'MilestoneCreated',
        enabled: true,
        userSpecific: true,
      },
      {
        contractName: 'MilestoneManager',
        eventName: 'MilestoneCompleted',
        enabled: true,
        userSpecific: true,
      },
      // NGO events
      {
        contractName: 'NGORegistry',
        eventName: 'NGORegistered',
        enabled: true,
        userSpecific: true,
      },
      {
        contractName: 'NGORegistry',
        eventName: 'NGOVerified',
        enabled: true,
        userSpecific: true,
      },
      // Startup events
      {
        contractName: 'StartupRegistry',
        eventName: 'StartupListed',
        enabled: true,
        userSpecific: true,
      },
      // Governance events
      {
        contractName: 'ImpactGovernor',
        eventName: 'ProposalCreated',
        enabled: true,
        userSpecific: false,
      },
      {
        contractName: 'ImpactGovernor',
        eventName: 'VoteCast',
        enabled: true,
        userSpecific: true,
      },
    ];

    // Start listeners for each configured event
    eventConfigs.forEach(config => {
      if (!config.enabled) return;

      const contractAddress = contractAddresses[config.contractName];
      if (!contractAddress) {
        return;
      }

      try {
        // Note: In a real implementation, you'd use useWatchContractEvent or similar
        // For now, we'll simulate with a polling mechanism
        const listenerId = `${config.contractName}-${config.eventName}`;
        
        const pollForEvents = async () => {
          try {
            // This would be replaced with actual event listening
            // For demonstration, we'll create mock events periodically
            if (Math.random() > 0.98) { // 2% chance to simulate an event
              const mockEvent: ContractEvent = {
                id: `mock-${Date.now()}`,
                contractName: config.contractName,
                eventName: config.eventName,
                args: generateMockEventArgs(config.eventName),
                blockNumber: Math.floor(Math.random() * 1000000),
                transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
                timestamp: Date.now(),
                processed: false,
              };
              
              addEvent(mockEvent);
            }
          } catch (error) {
            console.error(`Error polling for ${config.eventName}:`, error);
          }
        };

        // Poll every 5 seconds (in production, use actual event listeners)
        const intervalId = setInterval(pollForEvents, 5000);
        eventListeners.current.set(listenerId, intervalId);
        
      } catch (error) {
        console.error(`Failed to start listener for ${config.contractName}.${config.eventName}:`, error);
      }
    });
  }, [isListening, publicClient, contractAddresses, addEvent]);

  // Stop listening to events
  const stopListening = useCallback(() => {
    setIsListening(false);
    
    // Clear all event listeners
    eventListeners.current.forEach((intervalId) => {
      clearInterval(intervalId);
    });
    eventListeners.current.clear();
  }, []);

  // Generate mock event arguments for testing
  const generateMockEventArgs = (eventName: string): Record<string, any> => {
    switch (eventName) {
      case 'DonationIn':
        return {
          donor: walletAddress || '0x1234567890123456789012345678901234567890',
          ngoId: Math.floor(Math.random() * 100),
          amount: BigInt(Math.floor(Math.random() * 10) * 1e18),
          currency: 'ETH',
        };
      case 'MilestoneCompleted':
        return {
          ngoId: Math.floor(Math.random() * 100),
          milestoneId: Math.floor(Math.random() * 10),
          status: 'completed',
        };
      case 'InvestmentMade':
        return {
          investor: walletAddress || '0x1234567890123456789012345678901234567890',
          startupId: Math.floor(Math.random() * 100),
          amount: BigInt(Math.floor(Math.random() * 50) * 1e18),
          equityPercentage: Math.floor(Math.random() * 20),
        };
      default:
        return {};
    }
  };

  // Clear old events
  const clearEvents = useCallback(() => {
    setEvents([]);
    setEventCounts({});
    processedEvents.current.clear();
  }, []);

  // Get events by contract
  const getEventsByContract = useCallback((contractName: string) => {
    return events.filter(event => event.contractName === contractName);
  }, [events]);

  // Get events by type
  const getEventsByType = useCallback((eventName: string) => {
    return events.filter(event => event.eventName === eventName);
  }, [events]);

  // Auto-start listening when component mounts
  useEffect(() => {
    if (user && walletAddress) {
      startListening();
    }
    
    return () => {
      stopListening();
    };
  }, [user, walletAddress, startListening, stopListening]);

  return {
    // State
    events,
    isListening,
    eventCounts,
    
    // Actions
    startListening,
    stopListening,
    clearEvents,
    
    // Getters
    getEventsByContract,
    getEventsByType,
    
    // Stats
    totalEvents: events.length,
    recentEvents: events.slice(0, 10),
  };
} 