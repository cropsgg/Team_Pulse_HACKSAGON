"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  Home, 
  Search, 
  Vote, 
  BarChart3, 
  Plus, 
  Settings,
  HelpCircle,
  LogOut,
  User,
  Heart,
  TrendingUp,
  Globe,
  BookOpen
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/authStore';

const navigationItems = [
  {
    title: 'Home',
    href: '/',
    icon: Home,
    description: 'Back to homepage'
  },
  {
    title: 'Explore Projects',
    href: '/explore',
    icon: Search,
    description: 'Discover causes & startups'
  },
  {
    title: 'How It Works',
    href: '/how-it-works',
    icon: BookOpen,
    description: 'Learn about our process'
  },
  {
    title: 'Governance',
    href: '/governance',
    icon: Vote,
    description: 'Participate in DAO voting'
  },
  {
    title: 'Impact Dashboard',
    href: '/impact',
    icon: TrendingUp,
    description: 'View global impact metrics'
  },
  {
    title: 'Public Ledger',
    href: '/ledger',
    icon: BarChart3,
    description: 'Transparent transaction history'
  }
];

const authItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: User,
    description: 'Your personal dashboard'
  },
  {
    title: 'Console',
    href: '/console',
    icon: Settings,
    description: 'Manage your projects'
  }
];

const createItems = [
  {
    title: 'Create NGO Project',
    href: '/create/ngo',
    icon: Heart,
    description: 'Submit charity project'
  },
  {
    title: 'Create Startup',
    href: '/create/startup',
    icon: Plus,
    description: 'Apply for funding'
  }
];

const supportItems = [
  {
    title: 'Support Center',
    href: '/support',
    icon: HelpCircle,
    description: 'Get help & assistance'
  },
  {
    title: 'CSR Hub',
    href: '/csr',
    icon: Globe,
    description: 'Corporate partnerships'
  },
  {
    title: 'Blog',
    href: '/blog',
    icon: BookOpen,
    description: 'Latest news & insights'
  }
];

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLinkClick = () => {
    setOpen(false);
  };

  const handleLogout = () => {
    logout();
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="md:hidden"
          size="sm"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">IC</span>
              </div>
              <div>
                <div className="font-semibold text-sm">ImpactChain</div>
                <div className="text-xs text-muted-foreground">& CharityChain</div>
              </div>
            </div>
          </div>

          {/* User Info */}
          {isAuthenticated && user && (
            <div className="py-4 border-b">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{user.name || 'User'}</div>
                  <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                  <div className="flex items-center space-x-1 mt-1">
                    <Badge variant="secondary" className="text-xs">
                      {user.role}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Sections */}
          <div className="flex-1 py-4 space-y-6">
            {/* Main Navigation */}
            <div>
              <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Navigate
              </h3>
              <div className="space-y-1 mt-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleLinkClick}
                      className={`flex items-center space-x-3 px-2 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{item.title}</div>
                        <div className={`text-xs ${isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {item.description}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Authenticated User Items */}
            {isAuthenticated && (
              <div>
                <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Your Account
                </h3>
                <div className="space-y-1 mt-2">
                  {authItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={handleLinkClick}
                        className={`flex items-center space-x-3 px-2 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{item.title}</div>
                          <div className={`text-xs ${isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {item.description}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Create Projects */}
            <div>
              <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Create Project
              </h3>
              <div className="space-y-1 mt-2">
                {createItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleLinkClick}
                      className={`flex items-center space-x-3 px-2 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? 'bg-red-500 text-white'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{item.title}</div>
                        <div className={`text-xs ${isActive ? 'text-white/70' : 'text-muted-foreground'}`}>
                          {item.description}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Support & Resources */}
            <div>
              <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Support & Resources
              </h3>
              <div className="space-y-1 mt-2">
                {supportItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleLinkClick}
                      className={`flex items-center space-x-3 px-2 py-2 rounded-lg text-sm transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{item.title}</div>
                        <div className={`text-xs ${isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {item.description}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t pt-4 space-y-2">
            {isAuthenticated ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            ) : (
              <div className="space-y-2">
                <Button size="sm" className="w-full">
                  Connect Wallet
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  Sign In
                </Button>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
} 