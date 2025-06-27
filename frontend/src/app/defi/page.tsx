'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockDeFiVaults, portfolioData } from '@/data/mock';
import { formatCurrency, formatDate, formatNumber } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Shield,
  Zap,
  Target,
  Activity,
  PieChart,
  BarChart3,
  RefreshCw,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Info,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star,
  Settings,
  Download,
  Eye,
  Lock,
  Unlock,
  Coins,
  Layers,
  Globe,
  Percent,
  PiggyBank,
  ArrowUpCircle,
  ArrowDownCircle,
  Calculator
} from 'lucide-react';
import { DeFiVault } from '@/types';

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  vault: any;
}

const DepositModal = ({ isOpen, onClose, vault }: DepositModalProps) => {
  const [amount, setAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('USDC');

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Deposit to Vault</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              ×
            </Button>
          </div>

          <div className="space-y-6">
            <div className="text-center p-4 bg-gradient-to-r from-charity-50 to-impact-50 dark:from-charity-950 dark:to-impact-950 rounded-lg">
              <h3 className="font-semibold">{vault.name}</h3>
              <p className="text-sm text-muted-foreground">{vault.description}</p>
              <div className="flex justify-center items-center space-x-4 mt-2 text-sm">
                <span className="text-green-600 font-semibold">{vault.apy}% APY</span>
                <Badge variant={vault.riskLevel === 'low' ? 'success' : vault.riskLevel === 'medium' ? 'warning' : 'destructive'}>
                  {vault.riskLevel} risk
                </Badge>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Select Token</label>
              <div className="grid grid-cols-2 gap-2">
                {['USDC', 'USDT', 'DAI', 'ETH'].map((token) => (
                  <Button
                    key={token}
                    variant={selectedToken === token ? 'default' : 'outline'}
                    onClick={() => setSelectedToken(token)}
                    className="justify-start"
                  >
                    <Coins className="h-4 w-4 mr-2" />
                    {token}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Deposit Amount</label>
              <div className="relative">
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="pr-16"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  {selectedToken}
                </span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Balance: 1,250.00 {selectedToken}</span>
                <Button variant="ghost" size="sm" className="h-auto p-0 text-xs">
                  Max
                </Button>
              </div>
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span>Deposit Amount:</span>
                <span className="font-medium">{amount || '0'} {selectedToken}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Expected Annual Yield:</span>
                <span className="text-green-600">
                  {amount ? ((parseFloat(amount) || 0) * (vault.apy || 0) / 100).toFixed(2) : '0'} {selectedToken}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Estimated Gas Fee:</span>
                <span>~$5.50</span>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
              <div className="flex items-start space-x-2">
                <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">Important Notice</p>
                  <p className="text-yellow-700 dark:text-yellow-300">
                    Funds will be automatically reinvested to maximize returns. You can withdraw at any time.
                  </p>
                </div>
              </div>
            </div>

            <Button
              className="w-full"
              variant="charity"
              disabled={!amount || parseFloat(amount) <= 0}
            >
              <DollarSign className="mr-2 h-4 w-4" />
              Deposit {amount || '0'} {selectedToken}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const VaultCard = ({ vault }: { vault: any }) => {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  return (
    <>
      <Card className="p-6 hover:shadow-lg transition-all">
        <CardContent className="p-0">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold mb-1">{vault.name}</h3>
              <p className="text-sm text-muted-foreground">{vault.description}</p>
            </div>
            <Badge variant={vault.riskLevel === 'low' ? 'success' : vault.riskLevel === 'medium' ? 'warning' : 'destructive'}>
              {vault.riskLevel} risk
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{vault.apy}%</p>
              <p className="text-xs text-muted-foreground">APY</p>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <p className="text-lg font-bold">{formatCurrency(vault.tvl)}</p>
              <p className="text-xs text-muted-foreground">TVL</p>
            </div>
          </div>

          <div className="space-y-2 mb-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Strategy:</span>
              <span className="font-medium">{vault.strategy}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Protocol:</span>
              <span className="font-medium">{vault.protocol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Auto-compound:</span>
              <Badge variant="success" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Enabled
              </Badge>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span>Performance (30d)</span>
              <span className={`font-medium ${vault.performance30d >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {vault.performance30d >= 0 ? '+' : ''}{(vault.performance30d || 0).toFixed(2)}%
              </span>
            </div>
            <Progress
              value={Math.abs(vault.performance30d)}
              max={10}
              variant={vault.performance30d >= 0 ? 'charity' : 'default'}
              size="sm"
            />
          </div>

          <div className="flex space-x-2">
            <Button
              variant="charity"
              className="flex-1"
              onClick={() => setIsDepositModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Deposit
            </Button>
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Details
            </Button>
            <Button variant="outline" size="icon">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        vault={vault}
      />
    </>
  );
};

const PortfolioCard = ({ deposit }: { deposit: any }) => {
  const roi = ((deposit.currentValue - deposit.amount) / deposit.amount) * 100;

  return (
    <Card className="p-4">
      <CardContent className="p-0">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">{deposit.vaultName}</h3>
          <Badge variant="outline">{deposit.strategy}</Badge>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="text-center">
            <p className="text-lg font-bold">{formatCurrency(deposit.amount)}</p>
            <p className="text-xs text-muted-foreground">Deposited</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-green-600">{formatCurrency(deposit.currentValue)}</p>
            <p className="text-xs text-muted-foreground">Current Value</p>
          </div>
          <div className="text-center">
                          <p className={`text-lg font-bold ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {roi >= 0 ? '+' : ''}{(roi || 0).toFixed(2)}%
              </p>
            <p className="text-xs text-muted-foreground">ROI</p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Yield Earned:</span>
            <span className="font-medium text-green-600">+{formatCurrency(deposit.yield)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Deposited:</span>
            <span>{formatDate(deposit.depositDate)}</span>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Plus className="h-3 w-3 mr-1" />
            Add
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Minus className="h-3 w-3 mr-1" />
            Withdraw
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function DeFiPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'vaults' | 'staking' | 'liquidity'>('overview');
  const [selectedVault, setSelectedVault] = useState<string | null>(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [stakingDuration, setStakingDuration] = useState('30');

  const totalValueLocked = mockDeFiVaults.reduce((sum: number, vault: DeFiVault) => sum + vault.tvl, 0);
  const userPortfolioValue = portfolioData.totalValue;
  const userYield24h = portfolioData.yield24h;

  const stakingOptions = [
    { duration: '30', apy: 8.5, label: '30 Days' },
    { duration: '90', apy: 12.5, label: '90 Days' },
    { duration: '180', apy: 18.0, label: '180 Days' },
    { duration: '365', apy: 25.0, label: '1 Year' }
  ];

  const liquidityPools = [
    {
      id: 'impact-eth',
      name: 'IMPACT/ETH',
      token1: 'IMPACT',
      token2: 'ETH',
      apy: 45.2,
      tvl: 2_450_000,
      volume24h: 125_000,
      fees24h: 2_500,
      userLiquidity: 0,
      impactMultiplier: 2.5
    },
    {
      id: 'charity-usdc',
      name: 'CHARITY/USDC',
      token1: 'CHARITY',
      token2: 'USDC',
      apy: 32.8,
      tvl: 1_850_000,
      volume24h: 89_000,
      fees24h: 1_780,
      userLiquidity: 5_500,
      impactMultiplier: 3.0
    },
    {
      id: 'hope-dai',
      name: 'HOPE/DAI',
      token1: 'HOPE',
      token2: 'DAI',
      apy: 28.5,
      tvl: 980_000,
      volume24h: 45_000,
      fees24h: 900,
      userLiquidity: 0,
      impactMultiplier: 2.0
    }
  ];

  const renderOverviewTab = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={itemVariants}>
          <Card className="p-6 bg-gradient-to-br from-charity-50 to-charity-100 dark:from-charity-900/20 dark:to-charity-800/20 border-charity-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5 text-charity-600" />
                <span className="text-sm font-medium text-charity-700 dark:text-charity-300">Total Portfolio</span>
              </div>
              <Badge variant="secondary" className="bg-charity-200 text-charity-800">
                +{userYield24h.toFixed(2)}%
              </Badge>
            </div>
            <div className="text-3xl font-bold text-charity-800 dark:text-charity-200">
              ${userPortfolioValue.toLocaleString()}
            </div>
            <div className="text-sm text-charity-600 dark:text-charity-400 mt-1">
              24h: +${(userPortfolioValue * userYield24h / 100).toFixed(2)}
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="p-6 bg-gradient-to-br from-impact-50 to-impact-100 dark:from-impact-900/20 dark:to-impact-800/20 border-impact-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-impact-600" />
                <span className="text-sm font-medium text-impact-700 dark:text-impact-300">Active Positions</span>
              </div>
              <Badge variant="secondary" className="bg-impact-200 text-impact-800">
                5 Pools
              </Badge>
            </div>
            <div className="text-3xl font-bold text-impact-800 dark:text-impact-200">
              ${portfolioData.activePositions.toLocaleString()}
            </div>
            <div className="text-sm text-impact-600 dark:text-impact-400 mt-1">
              Across vaults & liquidity
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Percent className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Avg APY</span>
              </div>
              <Badge variant="secondary" className="bg-green-200 text-green-800">
                High Yield
              </Badge>
            </div>
            <div className="text-3xl font-bold text-green-800 dark:text-green-200">
              {portfolioData.averageApy.toFixed(1)}%
            </div>
            <div className="text-sm text-green-600 dark:text-green-400 mt-1">
              Weighted average
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          DeFi Platform Statistics
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">${(totalValueLocked / 1_000_000).toFixed(1)}M</div>
            <div className="text-sm text-muted-foreground">Total Value Locked</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">{mockDeFiVaults.length}</div>
            <div className="text-sm text-muted-foreground">Active Vaults</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">{liquidityPools.length}</div>
            <div className="text-sm text-muted-foreground">Liquidity Pools</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">15.2%</div>
            <div className="text-sm text-muted-foreground">Avg Platform APY</div>
          </div>
        </div>
      </Card>

      {/* Top Performing Vaults */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Top Performing Vaults
        </h3>
        <div className="space-y-4">
          {mockDeFiVaults.slice(0, 3).map((vault: DeFiVault) => (
            <div key={vault.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">{vault.name}</div>
                  <div className="text-sm text-muted-foreground">{vault.description}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">{vault.apy.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">APY</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );

  const renderVaultsTab = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Yield Farming Vaults</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calculator className="h-4 w-4 mr-2" />
            Calculator
          </Button>
          <Button variant="outline" size="sm">
            <Info className="h-4 w-4 mr-2" />
            Learn More
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {mockDeFiVaults.map((vault: DeFiVault) => (
          <motion.div key={vault.id} variants={itemVariants}>
            <Card className="p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">{vault.name}</h3>
                  <p className="text-sm text-muted-foreground">{vault.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={vault.riskLevel === 'low' ? 'secondary' : vault.riskLevel === 'medium' ? 'default' : 'destructive'}>
                    {vault.riskLevel} Risk
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{vault.apy.toFixed(1)}%</div>
                    <div className="text-sm text-muted-foreground">Current APY</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">${(vault.tvl / 1000).toFixed(0)}K</div>
                    <div className="text-sm text-muted-foreground">TVL</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Lock Period</span>
                    <span>{vault.lockPeriod} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Min Deposit</span>
                    <span>${vault.minimumDeposit}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    className="flex-1" 
                    onClick={() => setSelectedVault(vault.id)}
                  >
                    <ArrowUpCircle className="h-4 w-4 mr-2" />
                    Deposit
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <ArrowDownCircle className="h-4 w-4 mr-2" />
                    Withdraw
                  </Button>
                </div>

                <div className="bg-charity-50 dark:bg-charity-900/20 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-charity-600" />
                    <span className="font-medium text-charity-700 dark:text-charity-300">
                      Protocol: {vault.protocol}
                    </span>
                  </div>
                  <div className="text-xs text-charity-600 dark:text-charity-400 mt-1">
                    Secured by verified smart contracts
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  const renderStakingTab = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Stake IMPACT Tokens</h2>
        <p className="text-muted-foreground">
          Earn rewards while supporting the platform governance and charity matching
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Coins className="h-5 w-5" />
            Stake Tokens
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Amount to Stake</label>
              <div className="relative">
                <input
                  type="number"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  IMPACT
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Available: 10,000 IMPACT
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Staking Duration</label>
              <div className="grid grid-cols-2 gap-2">
                {stakingOptions.map((option) => (
                  <button
                    key={option.duration}
                    onClick={() => setStakingDuration(option.duration)}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      stakingDuration === option.duration
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="font-semibold">{option.label}</div>
                    <div className="text-sm text-green-600">{option.apy}% APY</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Estimated Rewards:</span>
                  <span className="font-semibold">
                    {stakeAmount ? 
                      (parseFloat(stakeAmount) * stakingOptions.find(o => o.duration === stakingDuration)!.apy / 100).toFixed(2) 
                      : '0.00'
                    } IMPACT
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Lock Period:</span>
                  <span className="font-semibold">{stakingOptions.find(o => o.duration === stakingDuration)?.label}</span>
                </div>
                <div className="flex justify-between">
                  <span>Impact Contribution:</span>
                  <span className="font-semibold text-charity-600">2x Matching</span>
                </div>
              </div>
            </div>

            <Button className="w-full" disabled={!stakeAmount || parseFloat(stakeAmount) <= 0}>
              <Target className="h-4 w-4 mr-2" />
              Stake Tokens
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Your Staking Positions
          </h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-semibold">5,000 IMPACT</div>
                  <div className="text-sm text-muted-foreground">90 Days @ 12.5% APY</div>
                </div>
                <Badge variant="outline">Active</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Time Remaining:</span>
                  <span>67 days</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Rewards Earned:</span>
                  <span className="text-green-600">+143.75 IMPACT</span>
                </div>
                <Progress value={25} className="h-2" />
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-semibold">2,500 IMPACT</div>
                  <div className="text-sm text-muted-foreground">30 Days @ 8.5% APY</div>
                </div>
                <Badge variant="secondary">Completed</Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Rewards:</span>
                  <span className="text-green-600">+177.08 IMPACT</span>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Claim Rewards
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-charity-50 dark:bg-charity-900/20 rounded-lg">
            <div className="text-sm">
              <div className="font-semibold text-charity-700 dark:text-charity-300 mb-1">
                Total Charity Impact
              </div>
              <div className="text-charity-600 dark:text-charity-400">
                Your staking has contributed $2,456 to charity matching funds this month
              </div>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );

  const renderLiquidityTab = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Liquidity Pools</h2>
        <p className="text-muted-foreground">
          Provide liquidity to earn trading fees and LP rewards
        </p>
      </div>

      <div className="space-y-4">
        {liquidityPools.map((pool) => (
          <motion.div key={pool.id} variants={itemVariants}>
            <Card className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-sm font-bold">
                      {pool.token1.charAt(0)}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-secondary to-secondary/60 flex items-center justify-center text-white text-sm font-bold">
                      {pool.token2.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{pool.name}</h3>
                    <div className="text-sm text-muted-foreground">
                      {pool.token1} + {pool.token2}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{pool.apy.toFixed(1)}%</div>
                  <div className="text-sm text-muted-foreground">APY</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold">${(pool.tvl / 1000).toFixed(0)}K</div>
                  <div className="text-xs text-muted-foreground">TVL</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold">${(pool.volume24h / 1000).toFixed(0)}K</div>
                  <div className="text-xs text-muted-foreground">24h Volume</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold">${pool.fees24h.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">24h Fees</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg font-bold">{pool.impactMultiplier}x</div>
                  <div className="text-xs text-muted-foreground">Impact</div>
                </div>
              </div>

              {pool.userLiquidity > 0 && (
                <div className="bg-impact-50 dark:bg-impact-900/20 p-4 rounded-lg mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-semibold text-impact-700 dark:text-impact-300">
                        Your Liquidity
                      </div>
                      <div className="text-sm text-impact-600 dark:text-impact-400">
                        ${pool.userLiquidity.toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        +${((pool.userLiquidity * pool.apy) / 100 / 365).toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">Daily Earnings</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button className="flex-1">
                  <ArrowUpCircle className="h-4 w-4 mr-2" />
                  Add Liquidity
                </Button>
                {pool.userLiquidity > 0 && (
                  <Button variant="outline" className="flex-1">
                    <ArrowDownCircle className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold">
            DeFi <span className="text-primary">Yields</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Maximize your impact through decentralized finance. Earn yields while contributing to charity.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="border-b">
            <nav className="flex space-x-8 overflow-x-auto">
              {['overview', 'vaults', 'staking', 'liquidity'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                  }`}
                >
                  {tab === 'overview' && <BarChart3 className="h-4 w-4" />}
                  {tab === 'vaults' && <PiggyBank className="h-4 w-4" />}
                  {tab === 'staking' && <Coins className="h-4 w-4" />}
                  {tab === 'liquidity' && <TrendingUp className="h-4 w-4" />}
                  <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                </button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'vaults' && renderVaultsTab()}
          {activeTab === 'staking' && renderStakingTab()}
          {activeTab === 'liquidity' && renderLiquidityTab()}
        </motion.div>
      </main>
    </div>
  );
} 