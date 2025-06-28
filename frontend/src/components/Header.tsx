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
  LogOut,
  User,
  Heart,
  TrendingUp,
  Globe,
  BookOpen,
  Bell,
  Wallet,
  ChevronDown,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { useAuthStore } from '@/store/authStore';
import { WalletButton } from '@/components/wallet/WalletButton';
import { useAuth } from '@/hooks/useAuth';
import { UserProfileCard } from '@/components/profile/UserProfileCard';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { LiveStatusWidget } from '@/components/status/LiveStatusWidget';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  }
];

// Desktop Header Component
export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, signOut } = useAuth();

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
          {isAuthenticated && (
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
          {/* Live Status Widget (Compact) */}
          {isAuthenticated && <LiveStatusWidget compact className="mr-1" />}
          
          {/* Web3 Wallet Connection */}
          <WalletButton size="sm" />
          
          {isAuthenticated ? (
            <>
              {/* Notification Center */}
              <NotificationCenter />
              
              <Button variant="outline" size="sm" onClick={() => router.push('/create/startup')}>
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
              <div className="flex items-center space-x-2">
                {user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center space-x-2">
                        <Avatar className="h-8 w-8">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </Avatar>
                        <span className="text-sm font-medium">{user.name}</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email || 'No email set'}</p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/profile')}>
                        <Settings className="mr-2 h-4 w-4" />
                        Profile Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={signOut} className="text-red-600">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                                 {!user && (
                   <span className="text-sm text-muted-foreground">
                     Connect wallet to sign in
                  </span>
                )}
                <Avatar className="h-8 w-8 cursor-pointer" onClick={() => router.push('/dashboard')}>
                  <div className="h-full w-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                </Avatar>
              </div>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => router.push('/login')}>
                Sign In
              </Button>
              <Button size="sm" onClick={() => router.push('/create/startup')}>
                Create Project
              </Button>
            </>
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
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, signOut } = useAuth();

  const handleLinkClick = () => {
    setOpen(false);
  };

  const handleLogout = () => {
    signOut();
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
                <Sparkles className="text-white h-4 w-4" />
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
                    <div className="inline-flex items-center rounded-full border border-transparent bg-secondary text-secondary-foreground px-2.5 py-0.5 text-xs font-semibold">
                      {user.id?.startsWith('guest-') ? 'Guest User' : (user.role || 'User')}
                    </div>
                    {user.id?.startsWith('guest-') && (
                      <div className="inline-flex items-center rounded-full border border-orange-200 bg-orange-100 text-orange-800 px-2.5 py-0.5 text-xs font-semibold">
                        🎯 Exploring
                      </div>
                    )}
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
              <div className="space-y-2">
                {user?.id?.startsWith('guest-') && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => { router.push('/signup'); handleLinkClick(); }}
                    className="w-full justify-start bg-primary hover:bg-primary/90"
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Create Full Account
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full justify-start"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {user?.id?.startsWith('guest-') ? 'Exit Guest Mode' : 'Sign Out'}
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Button size="sm" className="w-full" onClick={() => { router.push('/create/startup'); handleLinkClick(); }}>
                  Connect Wallet
                </Button>
                <Button variant="outline" size="sm" className="w-full" onClick={() => { router.push('/login'); handleLinkClick(); }}>
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