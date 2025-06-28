"use client";

import { useState, useEffect } from 'react';
import { Search, Filter, X, MapPin, Calendar, Target, Users, Star, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface FilterState {
  search: string;
  category: string[];
  location: string[];
  status: string[];
  fundingRange: { min: number; max: number };
  sortBy: string;
  projectType: 'all' | 'charity' | 'startup' | 'personal';
}

interface SearchFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  resultCount?: number;
}

const categories = {
  charity: [
    'Education', 'Healthcare', 'Environment', 'Poverty Alleviation', 'Disaster Relief',
    'Child Welfare', 'Women Empowerment', 'Animal Welfare', 'Clean Water', 'Food Security'
  ],
  startup: [
    'Technology', 'Healthcare Tech', 'FinTech', 'EdTech', 'Climate Tech', 'AI/ML',
    'Blockchain', 'E-commerce', 'SaaS', 'Mobile Apps', 'IoT', 'Social Impact'
  ],
  personal: [
    'Medical Emergency', 'Education Fund', 'Business Startup', 'Home Repair',
    'Debt Relief', 'Family Crisis', 'Disability Support', 'Memorial Fund'
  ]
};

const locations = [
  'Mumbai, India', 'Delhi, India', 'Bangalore, India', 'Chennai, India',
  'Kolkata, India', 'Hyderabad, India', 'Pune, India', 'Remote/Online'
];

const statusOptions = ['Active', 'Funding', 'Completed', 'Paused', 'Upcoming'];

const sortOptions = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'funded', label: 'Most Funded' },
  { value: 'progress', label: 'Progress %' }
];

export function SearchFilters({ filters, onFiltersChange, resultCount }: SearchFiltersProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(filters.search);

  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange({ ...filters, search: localSearch });
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch]);

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const addToArrayFilter = (key: 'category' | 'location' | 'status', value: string) => {
    if (!filters[key].includes(value)) {
      updateFilter(key, [...filters[key], value]);
    }
  };

  const removeFromArrayFilter = (key: 'category' | 'location' | 'status', value: string) => {
    updateFilter(key, filters[key].filter(item => item !== value));
  };

  const clearAllFilters = () => {
    setLocalSearch('');
    onFiltersChange({
      search: '',
      category: [],
      location: [],
      status: [],
      fundingRange: { min: 0, max: Infinity },
      sortBy: 'recent',
      projectType: 'all'
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category.length > 0) count += filters.category.length;
    if (filters.location.length > 0) count += filters.location.length;
    if (filters.status.length > 0) count += filters.status.length;
    if (filters.projectType !== 'all') count++;
    return count;
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Project Type */}
      <div>
        <label className="text-sm font-medium mb-3 block">Project Type</label>
        <Tabs value={filters.projectType} onValueChange={(value) => updateFilter('projectType', value)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="charity">NGO</TabsTrigger>
            <TabsTrigger value="startup">Startup</TabsTrigger>
            <TabsTrigger value="personal">Personal</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Categories */}
      <div>
        <label className="text-sm font-medium mb-3 block">Categories</label>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {(filters.projectType === 'all' 
            ? [...categories.charity, ...categories.startup, ...categories.personal]
            : categories[filters.projectType === 'charity' ? 'charity' : filters.projectType === 'startup' ? 'startup' : 'personal']
          ).map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`category-${category}`}
                checked={filters.category.includes(category)}
                onChange={(e) => {
                  if (e.target.checked) {
                    addToArrayFilter('category', category);
                  } else {
                    removeFromArrayFilter('category', category);
                  }
                }}
                className="rounded border-gray-300"
              />
              <label htmlFor={`category-${category}`} className="text-sm cursor-pointer">
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search projects..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="md:hidden">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {getActiveFilterCount() > 0 && (
                  <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                    {getActiveFilterCount()}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>

          <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value)}>
            <SelectTrigger className="w-[180px]">
              <TrendingUp className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {getActiveFilterCount() > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAllFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear All ({getActiveFilterCount()})
            </Button>
          )}
        </div>

        {resultCount !== undefined && (
          <div className="text-sm text-muted-foreground">
            {resultCount.toLocaleString()} results
          </div>
        )}
      </div>

      {/* Desktop Filters */}
      <div className="hidden md:block">
        <FilterContent />
      </div>
    </div>
  );
} 