'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowLeft, 
  Vote, 
  AlertCircle,
  FileText,
  Target,
  DollarSign,
  Settings,
  Info,
  CheckCircle,
  Clock,
  Users
} from 'lucide-react';
import { useImpactGovernor } from '@/hooks/contracts/useImpactGovernor';
import { useAccount } from 'wagmi';
import { Address } from 'viem';
import { toast } from '@/hooks/use-toast';

type ProposalType = 'parameter' | 'funding' | 'upgrade' | 'general';
type ActionType = 'call' | 'transfer' | 'upgrade';

interface ProposalAction {
  id: string;
  type: ActionType;
  target: string;
  value: string;
  data: string;
  description: string;
}

export default function CreateProposalPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { 
    propose, 
    isLoading, 
    userVotingPower, 
    proposalThreshold,
    quorum,
    votingDelay,
    votingPeriod 
  } = useImpactGovernor();

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '' as ProposalType,
    category: '',
    motivation: '',
    specification: '',
    implementation: ''
  });
  
  const [actions, setActions] = useState<ProposalAction[]>([
    {
      id: '1',
      type: 'call' as ActionType,
      target: '',
      value: '0',
      data: '0x',
      description: ''
    }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Proposal types
  const proposalTypes = [
    { value: 'parameter', label: 'Parameter Change', icon: Settings },
    { value: 'funding', label: 'Funding Request', icon: DollarSign },
    { value: 'upgrade', label: 'Protocol Upgrade', icon: Target },
    { value: 'general', label: 'General Governance', icon: Vote }
  ];

  const categories = [
    'Treasury',
    'Technical',
    'Community',
    'Partnerships',
    'Marketing',
    'Operations',
    'Security',
    'Other'
  ];

  // Action types
  const actionTypes = [
    { value: 'call', label: 'Contract Call' },
    { value: 'transfer', label: 'Token Transfer' },
    { value: 'upgrade', label: 'Contract Upgrade' }
  ];

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }

    if (!formData.type) {
      newErrors.type = 'Proposal type is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.motivation.trim()) {
      newErrors.motivation = 'Motivation is required';
    }

    // Validate actions
    actions.forEach((action, index) => {
      if (!action.target.trim()) {
        newErrors[`action_${index}_target`] = 'Target address is required';
      } else if (!/^0x[a-fA-F0-9]{40}$/.test(action.target)) {
        newErrors[`action_${index}_target`] = 'Invalid address format';
      }

      if (action.type === 'transfer' && (!action.value || action.value === '0')) {
        newErrors[`action_${index}_value`] = 'Transfer amount is required';
      }

      if (!action.description.trim()) {
        newErrors[`action_${index}_description`] = 'Action description is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle action changes
  const updateAction = (id: string, field: keyof ProposalAction, value: string) => {
    setActions(prev => prev.map(action => 
      action.id === id ? { ...action, [field]: value } : action
    ));
    
    const errorKey = `action_${actions.findIndex(a => a.id === id)}_${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  // Add new action
  const addAction = () => {
    const newAction: ProposalAction = {
      id: Date.now().toString(),
      type: 'call',
      target: '',
      value: '0',
      data: '0x',
      description: ''
    };
    setActions(prev => [...prev, newAction]);
  };

  // Remove action
  const removeAction = (id: string) => {
    if (actions.length > 1) {
      setActions(prev => prev.filter(action => action.id !== id));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to create a proposal.",
        variant: "destructive"
      });
      return;
    }

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare proposal data
      const targets = actions.map(action => action.target as Address);
      const values = actions.map(action => BigInt(action.value || '0'));
      const calldatas = actions.map(action => action.data as `0x${string}`);
      
      // Create comprehensive description
      const description = `
# ${formData.title}

## Summary
${formData.description}

## Type
${formData.type}

## Category
${formData.category}

## Motivation
${formData.motivation}

${formData.specification ? `## Specification\n${formData.specification}` : ''}

${formData.implementation ? `## Implementation\n${formData.implementation}` : ''}

## Actions
${actions.map((action, index) => 
  `### Action ${index + 1}: ${action.description}
- Target: ${action.target}
- Value: ${action.value} ETH
- Data: ${action.data}
- Type: ${action.type}`
).join('\n\n')}
      `.trim();

      // Submit proposal
      await propose({
        targets,
        values,
        calldatas,
        description
      });

      toast({
        title: "Proposal Created Successfully!",
        description: "Your proposal has been submitted to the DAO.",
      });
      router.push('/governance');
    } catch (error) {
      console.error('Error creating proposal:', error);
      toast({
        title: "Error Creating Proposal",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if user has enough voting power
  const hasEnoughVotingPower = userVotingPower >= (proposalThreshold || BigInt(0));

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()}
            className="text-gray-300 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">Create Proposal</h1>
            <p className="text-gray-400 mt-1">Submit a proposal to the ImpactChain DAO</p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
            onClick={() => {
              setFormData({
                title: 'Platform Fee Reduction Proposal',
                description: 'This proposal suggests reducing the platform transaction fee from 2.5% to 2.0% to attract more users while maintaining sustainability.',
                type: 'parameter',
                category: 'Technical',
                motivation: 'Current market research shows that our 2.5% fee is higher than most competitors. Reducing it to 2.0% would make us more competitive while still covering operational costs. This change could increase user adoption by an estimated 15-20%.',
                specification: 'Update the FeeManager contract to set the platform fee to 2.0% (200 basis points). The change should be implemented immediately upon proposal approval.',
                implementation: 'The implementation requires calling the setFee function on the FeeManager contract with the new fee parameter. This is a straightforward parameter change that takes effect immediately.'
              });
              setActions([{
                id: '1',
                type: 'call',
                target: '0xF053473E969C50F2a947b72c7E431Ee1281D02E5', // FeeManager contract
                value: '0',
                data: '0x',
                description: 'Call setFee function to update platform fee to 2.0%'
              }]);
              toast({
                title: "Template Applied",
                description: "Example proposal data has been filled in. You can modify it as needed.",
              });
            }}
          >
            <FileText className="h-4 w-4 mr-2" />
            Use Template
          </Button>
        </div>

        {/* Voting Power Check */}
        {!hasEnoughVotingPower && isConnected && (
          <Card className="mb-6 border-yellow-500/20 bg-yellow-500/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-500">Insufficient Voting Power</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    You need at least {proposalThreshold?.toString() || '0'} voting power to create proposals.
                    You currently have {userVotingPower.toString()} voting power.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Governance Info */}
        <Card className="mb-6 bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Info className="h-5 w-5" />
              Proposal Requirements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300">
                  Voting Delay: {votingDelay?.toString() || '1'} blocks
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Vote className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300">
                  Voting Period: {votingPeriod?.toString() || '45818'} blocks
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300">
                  Quorum: {quorum?.toString() || '4'}% of supply
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-gray-300">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Brief, descriptive title for your proposal"
                  className="bg-gray-700/50 border-gray-600 text-white"
                />
                {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-300">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Provide a clear and comprehensive description of your proposal"
                  rows={4}
                  className="bg-gray-700/50 border-gray-600 text-white"
                />
                {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Proposal Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                      <SelectValue placeholder="Select proposal type" />
                    </SelectTrigger>
                    <SelectContent>
                      {proposalTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-red-400 text-sm mt-1">{errors.type}</p>}
                </div>

                <div>
                  <Label className="text-gray-300">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Information */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Detailed Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="motivation" className="text-gray-300">Motivation *</Label>
                <Textarea
                  id="motivation"
                  value={formData.motivation}
                  onChange={(e) => handleInputChange('motivation', e.target.value)}
                  placeholder="Explain why this proposal is necessary and what problem it solves"
                  rows={3}
                  className="bg-gray-700/50 border-gray-600 text-white"
                />
                {errors.motivation && <p className="text-red-400 text-sm mt-1">{errors.motivation}</p>}
              </div>

              <div>
                <Label htmlFor="specification" className="text-gray-300">Specification</Label>
                <Textarea
                  id="specification"
                  value={formData.specification}
                  onChange={(e) => handleInputChange('specification', e.target.value)}
                  placeholder="Technical details and specifications (optional)"
                  rows={3}
                  className="bg-gray-700/50 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="implementation" className="text-gray-300">Implementation</Label>
                <Textarea
                  id="implementation"
                  value={formData.implementation}
                  onChange={(e) => handleInputChange('implementation', e.target.value)}
                  placeholder="Implementation details and timeline (optional)"
                  rows={3}
                  className="bg-gray-700/50 border-gray-600 text-white"
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Proposal Actions</CardTitle>
              <p className="text-gray-400 text-sm">
                Define the on-chain actions that will be executed if this proposal passes
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {actions.map((action, index) => (
                <Card key={action.id} className="bg-gray-700/30 border-gray-600">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-white">Action {index + 1}</h4>
                      {actions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAction(action.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Remove
                        </Button>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-gray-300">Action Type</Label>
                        <Select 
                          value={action.type} 
                          onValueChange={(value) => updateAction(action.id, 'type', value)}
                        >
                          <SelectTrigger className="bg-gray-600/50 border-gray-500 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {actionTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-gray-300">Target Address *</Label>
                        <Input
                          value={action.target}
                          onChange={(e) => updateAction(action.id, 'target', e.target.value)}
                          placeholder="0x..."
                          className="bg-gray-600/50 border-gray-500 text-white"
                        />
                        {errors[`action_${index}_target`] && (
                          <p className="text-red-400 text-sm mt-1">{errors[`action_${index}_target`]}</p>
                        )}
                      </div>

                      <div>
                        <Label className="text-gray-300">Value (ETH)</Label>
                        <Input
                          value={action.value}
                          onChange={(e) => updateAction(action.id, 'value', e.target.value)}
                          placeholder="0"
                          type="number"
                          step="0.001"
                          className="bg-gray-600/50 border-gray-500 text-white"
                        />
                        {errors[`action_${index}_value`] && (
                          <p className="text-red-400 text-sm mt-1">{errors[`action_${index}_value`]}</p>
                        )}
                      </div>

                      <div>
                        <Label className="text-gray-300">Call Data</Label>
                        <Input
                          value={action.data}
                          onChange={(e) => updateAction(action.id, 'data', e.target.value)}
                          placeholder="0x"
                          className="bg-gray-600/50 border-gray-500 text-white"
                        />
                      </div>

                      <div>
                        <Label className="text-gray-300">Description *</Label>
                        <Input
                          value={action.description}
                          onChange={(e) => updateAction(action.id, 'description', e.target.value)}
                          placeholder="Describe what this action does"
                          className="bg-gray-600/50 border-gray-500 text-white"
                        />
                        {errors[`action_${index}_description`] && (
                          <p className="text-red-400 text-sm mt-1">{errors[`action_${index}_description`]}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addAction}
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Add Action
              </Button>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isConnected || !hasEnoughVotingPower || isSubmitting || isLoading}
              className="bg-gray-600 hover:bg-gray-500 text-white"
            >
              {isSubmitting || isLoading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Creating Proposal...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Create Proposal
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
} 