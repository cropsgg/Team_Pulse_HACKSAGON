import { useState, useCallback } from 'react';
import { useAccount, useWaitForTransactionReceipt } from 'wagmi';
import { toast } from '@/hooks/use-toast';
import { parseUnits, formatEther } from 'viem';

export interface TransactionState {
  isWaiting: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  isError: boolean;
  error: string | null;
  txHash: string | null;
  gasEstimate: bigint | null;
}

export interface UseTransactionOptions {
  onSuccess?: (txHash: string) => void;
  onError?: (error: string) => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useTransaction(options: UseTransactionOptions = {}) {
  const { address, isConnected } = useAccount();
  const [state, setState] = useState<TransactionState>({
    isWaiting: false,
    isConfirming: false,
    isConfirmed: false,
    isError: false,
    error: null,
    txHash: null,
    gasEstimate: null,
  });

  // Wait for transaction receipt
  const {
    data: receipt,
    isError: isReceiptError,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: state.txHash as `0x${string}` | undefined,
    query: {
      enabled: !!state.txHash,
    },
  });

  // Handle transaction confirmation
  const handleConfirmation = useCallback(() => {
    if (receipt && state.isConfirming) {
      setState(prev => ({
        ...prev,
        isConfirming: false,
        isConfirmed: true,
      }));
      
      toast({
        title: "Transaction Confirmed!",
        description: options.successMessage || 'Your transaction has been successfully confirmed on the blockchain.',
      });
      options.onSuccess?.(state.txHash!);
    }
  }, [receipt, state.isConfirming, state.txHash, options]);

  // Handle transaction error
  const handleError = useCallback((error: Error | string) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    setState(prev => ({
      ...prev,
      isWaiting: false,
      isConfirming: false,
      isError: true,
      error: errorMessage,
    }));

    // Parse common Web3 errors
    let userFriendlyMessage = options.errorMessage || 'Transaction failed';
    
    if (errorMessage.includes('User rejected')) {
      userFriendlyMessage = 'Transaction was rejected';
    } else if (errorMessage.includes('insufficient funds')) {
      userFriendlyMessage = 'Insufficient funds for transaction';
    } else if (errorMessage.includes('gas')) {
      userFriendlyMessage = 'Gas estimation failed - please try again';
    } else if (errorMessage.includes('nonce')) {
      userFriendlyMessage = 'Transaction nonce error - please try again';
    }

    toast({
      title: "Transaction Failed",
      description: userFriendlyMessage,
      variant: "destructive"
    });
    options.onError?.(errorMessage);
  }, [options]);

  // Execute transaction
  const execute = useCallback(async (
    transactionFn: () => Promise<`0x${string}`>,
    gasEstimationFn?: () => Promise<bigint>
  ): Promise<{ success: boolean; txHash?: string; error?: string }> => {
    if (!isConnected || !address) {
      const errorMsg = 'Please connect your wallet first';
      handleError(errorMsg);
      return { success: false, error: errorMsg };
    }

    try {
      setState(prev => ({
        ...prev,
        isWaiting: true,
        isError: false,
        error: null,
        isConfirmed: false,
        txHash: null,
      }));

      // Estimate gas if function provided
      if (gasEstimationFn) {
        try {
          const gasEstimate = await gasEstimationFn();
          setState(prev => ({ ...prev, gasEstimate }));
        } catch (gasError) {
          console.warn('Gas estimation failed:', gasError);
          // Continue without gas estimate
        }
      }

      // Execute transaction
      const txHash = await transactionFn();
      
      setState(prev => ({
        ...prev,
        isWaiting: false,
        isConfirming: true,
        txHash,
      }));

      toast({
        title: "Transaction Submitted",
        description: "Waiting for blockchain confirmation...",
      });

      return { success: true, txHash };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Transaction failed';
      handleError(error as Error);
      return { success: false, error: errorMessage };
    }
  }, [isConnected, address, handleError]);

  // Reset transaction state
  const reset = useCallback(() => {
    setState({
      isWaiting: false,
      isConfirming: false,
      isConfirmed: false,
      isError: false,
      error: null,
      txHash: null,
      gasEstimate: null,
    });
  }, []);

  // Call handleConfirmation when receipt is available
  if (receipt && state.isConfirming) {
    handleConfirmation();
  }

  // Handle receipt error
  if (isReceiptError && receiptError) {
    handleError(receiptError);
  }

  return {
    ...state,
    execute,
    reset,
    isLoading: state.isWaiting || state.isConfirming,
    gasEstimateFormatted: state.gasEstimate ? formatEther(state.gasEstimate) : null,
  };
}

// Helper function to format common transaction errors
export function formatTransactionError(error: Error | string): string {
  const message = typeof error === 'string' ? error : error.message;
  
  if (message.includes('User rejected')) {
    return 'Transaction was rejected by user';
  }
  
  if (message.includes('insufficient funds')) {
    return 'Insufficient funds for transaction and gas fees';
  }
  
  if (message.includes('gas required exceeds allowance')) {
    return 'Transaction would fail - please check your inputs';
  }
  
  if (message.includes('nonce too low')) {
    return 'Transaction nonce error - please try again';
  }
  
  if (message.includes('replacement transaction underpriced')) {
    return 'Transaction already pending - please wait';
  }
  
  return 'Transaction failed - please try again';
} 