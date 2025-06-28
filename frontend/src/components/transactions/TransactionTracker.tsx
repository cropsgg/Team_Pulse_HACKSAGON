'use client';

import { useState, useEffect, useCallback } from 'react';
import { useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ExternalLink,
  RefreshCw,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface TrackedTransaction {
  id: string;
  hash: string;
  type: string;
  description: string;
  status: TransactionStatus;
  timestamp: number;
  confirmations: number;
  requiredConfirmations: number;
  gasUsed?: bigint;
  gasPrice?: bigint;
  blockNumber?: number;
  metadata?: Record<string, any>;
}

interface TransactionTrackerProps {
  transactions: TrackedTransaction[];
  onRemove?: (transactionId: string) => void;
  onRetry?: (transactionId: string) => void;
  className?: string;
  maxVisible?: number;
}

export function TransactionTracker({
  transactions,
  onRemove,
  onRetry,
  className,
  maxVisible = 5,
}: TransactionTrackerProps) {
  const publicClient = usePublicClient();
  const [expandedTx, setExpandedTx] = useState<string | null>(null);

  // Get status color and icon
  const getStatusDisplay = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.PENDING:
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          icon: <Clock className="w-4 h-4" />,
          badgeVariant: 'secondary' as const,
        };
      case TransactionStatus.CONFIRMED:
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          icon: <CheckCircle className="w-4 h-4" />,
          badgeVariant: 'default' as const,
        };
      case TransactionStatus.FAILED:
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          icon: <AlertCircle className="w-4 h-4" />,
          badgeVariant: 'destructive' as const,
        };
      case TransactionStatus.CANCELLED:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          icon: <X className="w-4 h-4" />,
          badgeVariant: 'outline' as const,
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          icon: <Clock className="w-4 h-4" />,
          badgeVariant: 'outline' as const,
        };
    }
  };

  // Calculate confirmation progress
  const getConfirmationProgress = (transaction: TrackedTransaction) => {
    if (transaction.status !== TransactionStatus.PENDING) return 100;
    return Math.min((transaction.confirmations / transaction.requiredConfirmations) * 100, 100);
  };

  // Format transaction time
  const formatTransactionTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s ago`;
    }
    return `${seconds}s ago`;
  };

  // Format gas amount
  const formatGas = (gasUsed?: bigint, gasPrice?: bigint) => {
    if (!gasUsed || !gasPrice) return 'N/A';
    const gasCost = Number(gasUsed * gasPrice) / 1e18;
    return `${gasCost.toFixed(6)} ETH`;
  };

  // Get explorer URL
  const getExplorerUrl = (hash: string) => {
    // This would be dynamic based on the current chain
    return `https://basescan.org/tx/${hash}`;
  };

  // Transaction item component
  const TransactionItem = ({ transaction }: { transaction: TrackedTransaction }) => {
    const statusDisplay = getStatusDisplay(transaction.status);
    const progress = getConfirmationProgress(transaction);
    const isExpanded = expandedTx === transaction.id;

    return (
      <Card className={cn('transition-all', statusDisplay.bgColor)}>
        <CardHeader 
          className="pb-3 cursor-pointer"
          onClick={() => setExpandedTx(isExpanded ? null : transaction.id)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={statusDisplay.color}>
                {statusDisplay.icon}
              </div>
              <div>
                <CardTitle className="text-sm font-medium">
                  {transaction.type}
                </CardTitle>
                <CardDescription className="text-xs">
                  {transaction.description}
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={statusDisplay.badgeVariant} className="text-xs">
                {transaction.status}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatTransactionTime(transaction.timestamp)}
              </span>
            </div>
          </div>
          
          {transaction.status === TransactionStatus.PENDING && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Confirmations</span>
                <span>{transaction.confirmations}/{transaction.requiredConfirmations}</span>
              </div>
              <Progress value={progress} className="h-1" />
            </div>
          )}
        </CardHeader>

        {isExpanded && (
          <CardContent className="pt-0">
            <div className="space-y-3">
              {/* Transaction Hash */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Transaction Hash
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">
                    {transaction.hash}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(getExplorerUrl(transaction.hash), '_blank')}
                    className="h-7 w-7 p-0"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Block Number */}
              {transaction.blockNumber && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Block Number
                  </label>
                  <p className="text-xs mt-1">#{transaction.blockNumber}</p>
                </div>
              )}

              {/* Gas Information */}
              {transaction.gasUsed && transaction.gasPrice && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Gas Cost
                  </label>
                  <p className="text-xs mt-1">
                    {formatGas(transaction.gasUsed, transaction.gasPrice)}
                  </p>
                </div>
              )}

              {/* Metadata */}
              {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground">
                    Details
                  </label>
                  <div className="mt-1 space-y-1">
                    {Object.entries(transaction.metadata).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{key}:</span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t">
                {transaction.status === TransactionStatus.FAILED && onRetry && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRetry(transaction.id)}
                    className="text-xs"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Retry
                  </Button>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(getExplorerUrl(transaction.hash), '_blank')}
                  className="text-xs"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  View on Explorer
                </Button>
                
                {onRemove && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(transaction.id)}
                    className="text-xs text-red-600 hover:text-red-700 ml-auto"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  if (transactions.length === 0) {
    return null;
  }

  const visibleTransactions = transactions.slice(0, maxVisible);
  const hiddenCount = Math.max(0, transactions.length - maxVisible);

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Recent Transactions</h3>
        {hiddenCount > 0 && (
          <Badge variant="outline" className="text-xs">
            +{hiddenCount} more
          </Badge>
        )}
      </div>
      
      <div className="space-y-2">
        {visibleTransactions.map((transaction) => (
          <TransactionItem 
            key={transaction.id} 
            transaction={transaction} 
          />
        ))}
      </div>
    </div>
  );
}

// Hook for managing tracked transactions
export function useTransactionTracker() {
  const [trackedTransactions, setTrackedTransactions] = useState<TrackedTransaction[]>([]);

  // Add new transaction to track
  const addTransaction = useCallback((transaction: Omit<TrackedTransaction, 'id' | 'timestamp'>) => {
    const newTransaction: TrackedTransaction = {
      ...transaction,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    setTrackedTransactions(prev => [newTransaction, ...prev]);
    
    // Show toast notification
    toast.info(`Transaction submitted: ${transaction.type}`, {
      description: transaction.description,
      action: {
        label: 'View',
        onClick: () => window.open(`https://basescan.org/tx/${transaction.hash}`, '_blank'),
      },
    });

    return newTransaction.id;
  }, []);

  // Update transaction status
  const updateTransaction = useCallback((transactionId: string, updates: Partial<TrackedTransaction>) => {
    setTrackedTransactions(prev => 
      prev.map(tx => 
        tx.id === transactionId 
          ? { ...tx, ...updates }
          : tx
      )
    );

    // Show notification for status changes
    if (updates.status) {
      const transaction = trackedTransactions.find(tx => tx.id === transactionId);
      if (transaction) {
        switch (updates.status) {
          case TransactionStatus.CONFIRMED:
            toast.success(`Transaction confirmed: ${transaction.type}`);
            break;
          case TransactionStatus.FAILED:
            toast.error(`Transaction failed: ${transaction.type}`);
            break;
        }
      }
    }
  }, [trackedTransactions]);

  // Remove transaction
  const removeTransaction = useCallback((transactionId: string) => {
    setTrackedTransactions(prev => prev.filter(tx => tx.id !== transactionId));
  }, []);

  // Clear all transactions
  const clearTransactions = useCallback(() => {
    setTrackedTransactions([]);
  }, []);

  // Get transactions by status
  const getTransactionsByStatus = useCallback((status: TransactionStatus) => {
    return trackedTransactions.filter(tx => tx.status === status);
  }, [trackedTransactions]);

  return {
    trackedTransactions,
    addTransaction,
    updateTransaction,
    removeTransaction,
    clearTransactions,
    getTransactionsByStatus,
    pendingCount: getTransactionsByStatus(TransactionStatus.PENDING).length,
    confirmedCount: getTransactionsByStatus(TransactionStatus.CONFIRMED).length,
    failedCount: getTransactionsByStatus(TransactionStatus.FAILED).length,
  };
} 