'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Search, Filter, Heart, DollarSign, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GridSkeleton } from '@/components/ui/LoadingSkeletons';
import { cn } from '@/lib/utils';

// Mock data for demonstration
const mockHelpRequests = [
  {
    id: '1',
    title: 'Emergency Medical Treatment',
    description: 'Need urgent help for medical expenses after unexpected accident.',
    goal: 15000,
    raised: 8500,
    status: 'urgent',
    creator: { id: '1', name: 'Sarah Chen' },
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Education Fund for Orphaned Children',
    description: 'Supporting education for children who lost their parents during the pandemic.',
    goal: 25000,
    raised: 18200,
    status: 'active',
    creator: { id: '2', name: 'Michael Rodriguez' },
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

interface HelpRequest {
  id: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  status: string;
  creator: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export default function HelpPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('active');
  const [loading, setLoading] = useState(false);

  const handleRequestClick = (request: HelpRequest) => {
    router.push(`/help/${request.id}`);
  };

  const handleDonateClick = (request: HelpRequest, e: React.MouseEvent) => {
    e.stopPropagation();
    // Would open contribution modal
    console.log('Donate to:', request.title);
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'urgent':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const renderHelpRequestCard = (request: HelpRequest, index: number) => {
    const progressPercentage = (request.raised / request.goal) * 100;
    const isUrgent = request.status.toLowerCase() === 'urgent';
    const isCompleted = request.status.toLowerCase() === 'completed';

    return (
      <motion.div
        key={request.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        whileHover={{ y: -5 }}
      >
        <Card 
          className={cn(
            "h-full cursor-pointer transition-all duration-300 hover:shadow-lg",
            isUrgent && "ring-2 ring-red-200 dark:ring-red-800"
          )}
          onClick={() => handleRequestClick(request)}
        >
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-red-50 dark:bg-red-950/20 rounded-full">
                  <Heart className="w-4 h-4 text-red-500" />
                </div>
                <Badge variant={getStatusVariant(request.status)}>
                  {request.status}
                </Badge>
              </div>
              {isUrgent && (
                <div className="animate-pulse">
                  <Badge variant="destructive" className="text-xs">
                    URGENT
                  </Badge>
                </div>
              )}
            </div>
            <CardTitle className="text-lg line-clamp-2">
              {request.title}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm line-clamp-3">
              {request.description}
            </p>

            <div className="space-y-2">
              <Progress
                value={request.raised}
                max={request.goal}
                showPercentage
                unit="$"
                variant={isCompleted ? 'charity' : isUrgent ? 'default' : 'default'}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>{request.creator.name}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>2 days ago</span>
              </div>
            </div>

            {!isCompleted && (
              <Button
                onClick={(e) => handleDonateClick(request, e)}
                className="w-full"
                size="sm"
                variant={isUrgent ? "destructive" : "default"}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Help Now
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <GridSkeleton count={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">Help Requests</h1>
                <p className="text-muted-foreground">
                  Connect with people who need assistance and make a difference
                </p>
              </div>
              <Button className="w-full sm:w-auto">
                Request Help
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search help requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                {['active', 'urgent', 'completed'].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                    className="capitalize"
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockHelpRequests.map((request, index) => renderHelpRequestCard(request, index))}
        </div>
      </main>
    </div>
  );
}

// Force static generation
export const dynamic = 'force-static'; 