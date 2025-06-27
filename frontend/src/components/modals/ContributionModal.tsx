'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, Transition } from '@headlessui/react';
import { useMutation } from '@apollo/client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { X, DollarSign, Heart, Target, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DONATE_HELP, DONATE_FUNDING } from '@/graphql/mutations';
import { cn } from '@/lib/utils';

const contributionSchema = z.object({
  amount: z.number()
    .min(1, 'Amount must be greater than 0')
    .max(1000000, 'Amount cannot exceed $1,000,000')
});

type ContributionFormData = z.infer<typeof contributionSchema>;

interface ContributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'help' | 'funding';
  item: {
    id: string;
    title: string;
    description?: string;
    goal: number;
    raised: number;
    creator?: {
      name: string;
    };
  };
  onSuccess?: (data: any) => void;
}

export const ContributionModal: React.FC<ContributionModalProps> = ({
  isOpen,
  onClose,
  type,
  item,
  onSuccess
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<ContributionFormData>({
    resolver: zodResolver(contributionSchema)
  });

  const [donateHelpMutation] = useMutation(DONATE_HELP);
  const [donateFundingMutation] = useMutation(DONATE_FUNDING);

  const amount = watch('amount');
  const progressPercentage = ((item.raised + (amount || 0)) / item.goal) * 100;

  const predefinedAmounts = [10, 25, 50, 100, 250, 500];

  const handleAmountSelect = (value: number) => {
    setSelectedAmount(value);
    setValue('amount', value);
  };

  const onSubmit = async (data: ContributionFormData) => {
    setIsSubmitting(true);
    
    try {
      const mutation = type === 'help' ? donateHelpMutation : donateFundingMutation;
      
      const { data: result } = await mutation({
        variables: {
          id: item.id,
          amount: data.amount
        },
        refetchQueries: ['HelpRequests', 'HelpRequest', 'FundingRounds', 'FundingRound', 'MyProfile']
      });

      toast.success(
        `Successfully contributed $${data.amount.toLocaleString()} to ${item.title}!`
      );

      onSuccess?.(result);
      reset();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to process contribution');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedAmount(null);
    onClose();
  };

  const getTypeConfig = () => {
    if (type === 'help') {
      return {
        title: 'Help Someone in Need',
        buttonText: 'Send Help',
        icon: Heart,
        color: 'text-red-500',
        bgColor: 'bg-red-50 dark:bg-red-950/20',
        description: 'Your contribution can make a real difference in someone\'s life.'
      };
    }
    
    return {
      title: 'Fund Innovation',
      buttonText: 'Invest Now',
      icon: Target,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      description: 'Support groundbreaking ideas and be part of the innovation journey.'
    };
  };

  const config = getTypeConfig();
  const IconComponent = config.icon;

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-background p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={cn('p-2 rounded-full', config.bgColor)}>
                      <IconComponent className={cn('w-5 h-5', config.color)} />
                    </div>
                    <Dialog.Title className="text-lg font-semibold">
                      {config.title}
                    </Dialog.Title>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {/* Project Info */}
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm mb-2 truncate">
                        {item.title}
                      </h3>
                      {item.creator && (
                        <p className="text-xs text-muted-foreground mb-2">
                          by {item.creator.name}
                        </p>
                      )}
                      <Progress
                        value={item.raised}
                        max={item.goal}
                        showPercentage
                        unit="$"
                        className="mb-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>${item.raised.toLocaleString()} raised</span>
                        <span>${item.goal.toLocaleString()} goal</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Amount Selection */}
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Contribution Amount
                      </label>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {predefinedAmounts.map((value) => (
                          <Button
                            key={value}
                            type="button"
                            variant={selectedAmount === value ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleAmountSelect(value)}
                          >
                            ${value}
                          </Button>
                        ))}
                      </div>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          type="number"
                          placeholder="Enter custom amount"
                          className="pl-10"
                          {...register('amount', { valueAsNumber: true })}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (!isNaN(value)) {
                              setValue('amount', value);
                              setSelectedAmount(null);
                            }
                          }}
                        />
                      </div>
                      {errors.amount && (
                        <p className="text-red-500 text-xs mt-1 flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {errors.amount.message}
                        </p>
                      )}
                    </div>

                    {/* Preview */}
                    {amount && amount > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="border rounded-lg p-3 bg-muted/50"
                      >
                        <div className="flex justify-between text-sm">
                          <span>Your contribution:</span>
                          <span className="font-semibold">${amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>New total:</span>
                          <span className="font-semibold">
                            ${(item.raised + amount).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Progress:</span>
                          <span className="font-semibold">
                            {progressPercentage.toFixed(1)}%
                          </span>
                        </div>
                      </motion.div>
                    )}

                    <p className="text-xs text-muted-foreground">
                      {config.description}
                    </p>

                    <div className="flex space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={!amount || amount <= 0 || isSubmitting}
                        className="flex-1"
                      >
                        {isSubmitting ? 'Processing...' : config.buttonText}
                      </Button>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}; 