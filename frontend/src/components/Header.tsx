"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
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
  User,
  Heart,
  TrendingUp,
  Globe,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { WalletButton } from '@/components/wallet/WalletButton';

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

// Desktop Header Component
export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { isConnected, user } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-wide flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-bold text-xl">ImpactChain</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link 
            href="/explore" 
            className={`text-sm font-medium transition-colors ${
              pathname === '/explore' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Explore
          </Link>
          <Link 
            href="/how-it-works" 
            className={`text-sm font-medium transition-colors ${
              pathname === '/how-it-works' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            How it Works
          </Link>
          <Link 
            href="/governance" 
            className={`text-sm font-medium transition-colors ${
              pathname === '/governance' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Governance
          </Link>
          {isConnected && (
            <Link 
              href="/dashboard" 
              className={`text-sm font-medium transition-colors ${
                pathname === '/dashboard' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Dashboard
            </Link>
          )}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-3">
          {/* Web3 Wallet Connection */}
          <WalletButton size="sm" />
          
          {isConnected && (
            <Button variant="outline" size="sm" onClick={() => router.push('/create/startup')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <MobileNav />
        </div>
      </div>
    </header>
  );
}

// Mobile Navigation Component
export function MobileNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { isConnected } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <div className="flex flex-col space-y-4 mt-4">
          {/* Wallet Connection */}
          <div className="border-b pb-4">
            <WalletButton className="w-full" />
          </div>

          {/* Main Navigation */}
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Navigate
            </h3>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`flex items-center space-x-3 rounded-lg px-3 py-2 transition-colors ${
                    pathname === item.href
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <div>
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Authenticated Navigation */}
          {isConnected && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Account
              </h3>
              {authItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`flex items-center space-x-3 rounded-lg px-3 py-2 transition-colors ${
                      pathname === item.href
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Create Actions */}
          {isConnected && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                Create
              </h3>
              {createItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleLinkClick}
                    className="flex items-center space-x-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted"
                  >
                    <Icon className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
} 