'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { mockCampaigns } from '@/data/mock';
import { Campaign, CampaignCategory } from '@/types';
import { formatCurrency, formatDate, calculatePercentage } from '@/lib/utils';
import {
  Search,
  Filter,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  MapPin,
  Clock,
  TrendingUp,
  Users,
  Heart,
  Activity,
  Target,
  Calendar,
  Globe,
  ChevronDown,
  X
} from 'lucide-react';

type SortOption = 'trending' | 'newest' | 'ending-soon' | 'most-funded' | 'alphabetical';
type ViewMode = 'grid' | 'list';

const categories: { value: CampaignCategory; label: string; color: string }[] = [
  { value: 'education', label: 'Education', color: 'bg-blue-100 text-blue-800' },
  { value: 'healthcare', label: 'Healthcare', color: 'bg-red-100 text-red-800' },
  { value: 'environment', label: 'Environment', color: 'bg-green-100 text-green-800' },
  { value: 'poverty', label: 'Poverty', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'disaster-relief', label: 'Disaster Relief', color: 'bg-orange-100 text-orange-800' },
  { value: 'animal-welfare', label: 'Animal Welfare', color: 'bg-purple-100 text-purple-800' },
  { value: 'human-rights', label: 'Human Rights', color: 'bg-pink-100 text-pink-800' },
  { value: 'technology', label: 'Technology', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'infrastructure', label: 'Infrastructure', color: 'bg-gray-100 text-gray-800' },
  { value: 'arts-culture', label: 'Arts & Culture', color: 'bg-violet-100 text-violet-800' }
];

const sortOptions: { value: SortOption; label: string; icon: React.ElementType }[] = [
  { value: 'trending', label: 'Trending', icon: TrendingUp },
  { value: 'newest', label: 'Newest', icon: Calendar },
  { value: 'ending-soon', label: 'Ending Soon', icon: Clock },
  { value: 'most-funded', label: 'Most Funded', icon: Target },
  { value: 'alphabetical', label: 'A-Z', icon: SortAsc }
];

interface FilterState {
  search: string;
  categories: CampaignCategory[];
  sortBy: SortOption;
  viewMode: ViewMode;
  showFilters: boolean;
}

export default function CampaignsPage() {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    categories: [],
    sortBy: 'trending',
    viewMode: 'grid',
    showFilters: false
  });

  const filteredAndSortedCampaigns = useMemo(() => {
    let filtered = mockCampaigns;

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(campaign =>
        campaign.title.toLowerCase().includes(searchLower) ||
        campaign.description.toLowerCase().includes(searchLower) ||
        campaign.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
        campaign.location.country.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(campaign =>
        filters.categories.includes(campaign.category)
      );
    }

    // Sort
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime());
        break;
      case 'ending-soon':
        filtered.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
        break;
      case 'most-funded':
        filtered.sort((a, b) => b.raised - a.raised);
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'trending':
      default:
        filtered.sort((a, b) => b.backers - a.backers);
        break;
    }

    return filtered;
  }, [filters]);

  const toggleCategory = (category: CampaignCategory) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const clearFilters = () => {
    setFilters(prev => ({
      ...prev,
      search: '',
      categories: []
    }));
  };

  const CampaignCard = ({ campaign, index }: { campaign: Campaign; index: number }) => {
    const progressPercentage = calculatePercentage(campaign.raised, campaign.goal);
    const daysLeft = Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const categoryInfo = categories.find(c => c.value === campaign.category);

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        whileHover={{ y: -5 }}
        className="group"
      >
        <Card className="overflow-hidden h-full hover:shadow-xl transition-all duration-300 border-0 bg-card/50 backdrop-blur">
          <div className="relative h-48 overflow-hidden">
            <Image
              src={campaign.image}
              alt={campaign.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            
            {/* Category Badge */}
            <div className="absolute top-4 left-4">
              <Badge className={categoryInfo?.color || 'bg-white/90 text-black'}>
                {categoryInfo?.label || campaign.category}
              </Badge>
            </div>

            {/* Verification Badge */}
            <div className="absolute top-4 right-4">
              <Badge variant="success" className="bg-charity-500 text-white">
                <Activity className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            </div>

            {/* Quick Stats */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center justify-between text-white text-sm">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span>{campaign.location.country}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{daysLeft > 0 ? `${daysLeft} days left` : 'Ended'}</span>
                </div>
              </div>
            </div>
          </div>

          <CardHeader className="pb-3">
            <CardTitle className="line-clamp-2 text-lg group-hover:text-charity-600 transition-colors">
              {campaign.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {campaign.shortDescription}
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Progress */}
            <div className="space-y-2">
              <Progress
                value={campaign.raised}
                max={campaign.goal}
                variant="charity"
                size="sm"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{progressPercentage}% funded</span>
                <span className="font-medium text-foreground">
                  {formatCurrency(campaign.raised)}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex justify-between text-sm">
              <div className="flex items-center space-x-1 text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{campaign.backers} donors</span>
              </div>
              <div className="flex items-center space-x-1 text-muted-foreground">
                <Target className="w-4 h-4" />
                <span>{formatCurrency(campaign.goal)} goal</span>
              </div>
            </div>

            {/* Action Button */}
            <Link href={`/campaigns/detail?id=${campaign.id}`} className="block">
              <Button className="w-full group/btn" variant="charity">
                <Heart className="mr-2 h-4 w-4 transition-transform group-hover/btn:scale-110" />
                Donate Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold tracking-tight">
            Impact <span className="text-charity-500">Campaigns</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover and support verified campaigns creating measurable positive impact worldwide
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-4"
        >
          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search campaigns, causes, or locations..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                leftIcon={<Search className="h-4 w-4" />}
                className="h-12"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setFilters(prev => ({ ...prev, showFilters: !prev.showFilters }))}
                className="h-12 px-6"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${filters.showFilters ? 'rotate-180' : ''}`} />
              </Button>

              <div className="flex border rounded-lg">
                <Button
                  variant={filters.viewMode === 'grid' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setFilters(prev => ({ ...prev, viewMode: 'grid' }))}
                  className="h-12 w-12 rounded-r-none"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={filters.viewMode === 'list' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setFilters(prev => ({ ...prev, viewMode: 'list' }))}
                  className="h-12 w-12 rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {filters.showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <Card className="p-6">
                  <div className="space-y-6">
                    {/* Categories */}
                    <div>
                      <h3 className="font-semibold mb-3">Categories</h3>
                      <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                          <Button
                            key={category.value}
                            variant={filters.categories.includes(category.value) ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => toggleCategory(category.value)}
                            className="text-xs"
                          >
                            {category.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Sort Options */}
                    <div>
                      <h3 className="font-semibold mb-3">Sort By</h3>
                      <div className="flex flex-wrap gap-2">
                        {sortOptions.map((option) => (
                          <Button
                            key={option.value}
                            variant={filters.sortBy === option.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setFilters(prev => ({ ...prev, sortBy: option.value }))}
                            className="text-xs"
                          >
                            <option.icon className="w-3 h-3 mr-1" />
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Clear Filters */}
                    {(filters.search || filters.categories.length > 0) && (
                      <div className="flex justify-between items-center pt-4 border-t">
                        <span className="text-sm text-muted-foreground">
                          {filteredAndSortedCampaigns.length} campaigns found
                        </span>
                        <Button variant="ghost" size="sm" onClick={clearFilters}>
                          <X className="w-3 h-3 mr-1" />
                          Clear Filters
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex justify-between items-center"
        >
          <div>
            <h2 className="text-2xl font-semibold">
              {filteredAndSortedCampaigns.length} Campaign{filteredAndSortedCampaigns.length !== 1 ? 's' : ''}
            </h2>
            {filters.search && (
              <p className="text-muted-foreground">
                Results for "{filters.search}"
              </p>
            )}
          </div>
        </motion.div>

        {/* Campaigns Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {filteredAndSortedCampaigns.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <Globe className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No campaigns found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search terms or filters
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </motion.div>
          ) : (
            <div className={`grid gap-6 ${
              filters.viewMode === 'grid' 
                ? 'md:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1 max-w-4xl mx-auto'
            }`}>
              <AnimatePresence mode="popLayout">
                {filteredAndSortedCampaigns.map((campaign, index) => (
                  <CampaignCard
                    key={campaign.id}
                    campaign={campaign}
                    index={index}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
} 