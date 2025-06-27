'use client';

import React, { useState } from 'react';
import Link from 'next/link';

import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ClientConnectButton } from '@/components/ui/connect-button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
  Sun,
  Moon,
  Menu,
  X,
  Heart,
  Users,
  Vote,
  Settings,
  User,
  TrendingUp,
  Shield,
  LogOut,
  LogIn,
  UserPlus
} from 'lucide-react';

interface NavigationItem {
  name: string;
  href: string;
  icon?: React.ElementType;
  description?: string;
}

const navigation: NavigationItem[] = [
  { name: 'Campaigns', href: '/campaigns', icon: Heart, description: 'Browse active campaigns' },
  { name: 'Dashboard', href: '/dashboard', icon: TrendingUp, description: 'Your donor dashboard' },
  { name: 'Volunteer', href: '/volunteer', icon: Users, description: 'Join volunteer tasks' },
  { name: 'Governance', href: '/governance', icon: Vote, description: 'DAO proposals & voting' },
  { name: 'Admin', href: '/admin', icon: Shield, description: 'Platform administration' }
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, signOut } = useAuth();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-charity-500 to-impact-500"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Heart className="h-5 w-5 text-white" />
            </motion.div>
            <span className="hidden font-bold text-xl sm:inline-block">
              Impact<span className="text-charity-500">Chain</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-1 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  "focus:bg-accent focus:text-accent-foreground focus:outline-none"
                )}
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Authentication Actions */}
            {isAuthenticated ? (
              <>
                {/* Wallet Connection */}
                <ClientConnectButton />
                
                {/* User Menu */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2"
                  >
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-charity-500 to-impact-500 flex items-center justify-center">
                      <User className="h-3 w-3 text-white" />
                    </div>
                    <span className="hidden sm:inline-block text-sm font-medium">
                      {user?.profile?.displayName || user?.username}
                    </span>
                  </Button>

                  {/* User Dropdown */}
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.1 }}
                        className="absolute right-0 mt-2 w-48 rounded-md border bg-popover p-1 shadow-md"
                        onBlur={() => setUserMenuOpen(false)}
                      >
                        <Link
                          href="/dashboard"
                          className="flex items-center space-x-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <TrendingUp className="h-4 w-4" />
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          href="/profile"
                          className="flex items-center space-x-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <User className="h-4 w-4" />
                          <span>Profile</span>
                        </Link>
                        <Link
                          href="/settings"
                          className="flex items-center space-x-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Settings className="h-4 w-4" />
                          <span>Settings</span>
                        </Link>
                        <div className="my-1 h-px bg-border" />
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            signOut();
                          }}
                          className="flex w-full items-center space-x-2 rounded-sm px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign out</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                {/* Sign In/Up buttons for unauthenticated users */}
                <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
                  <Link href="/login">
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign in
                  </Link>
                </Button>
                <Button variant="charity" size="sm" asChild>
                  <Link href="/signup">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Sign up
                  </Link>
                </Button>
              </>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t md:hidden"
            >
              <div className="space-y-1 pb-3 pt-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-3 rounded-md px-3 py-2 text-base font-medium hover:bg-accent hover:text-accent-foreground"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon && <item.icon className="h-5 w-5" />}
                    <div>
                      <div>{item.name}</div>
                      {item.description && (
                        <div className="text-xs text-muted-foreground">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
                
                {/* Mobile Auth Actions */}
                <div className="border-t pt-3 mt-3">
                  {isAuthenticated ? (
                    <>
                      <div className="flex items-center space-x-3 px-3 py-2 text-sm">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-charity-500 to-impact-500 flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="font-medium">{user?.profile?.displayName || user?.username}</div>
                          <div className="text-xs text-muted-foreground">{user?.email}</div>
                        </div>
                      </div>
                      <Link
                        href="/profile"
                        className="flex items-center space-x-3 rounded-md px-3 py-2 text-base font-medium hover:bg-accent hover:text-accent-foreground"
                        onClick={() => setIsOpen(false)}
                      >
                        <User className="h-5 w-5" />
                        <span>Profile</span>
                      </Link>
                      <Link
                        href="/settings"
                        className="flex items-center space-x-3 rounded-md px-3 py-2 text-base font-medium hover:bg-accent hover:text-accent-foreground"
                        onClick={() => setIsOpen(false)}
                      >
                        <Settings className="h-5 w-5" />
                        <span>Settings</span>
                      </Link>
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          signOut();
                        }}
                        className="flex w-full items-center space-x-3 rounded-md px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                      >
                        <LogOut className="h-5 w-5" />
                        <span>Sign out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className="flex items-center space-x-3 rounded-md px-3 py-2 text-base font-medium hover:bg-accent hover:text-accent-foreground"
                        onClick={() => setIsOpen(false)}
                      >
                        <LogIn className="h-5 w-5" />
                        <span>Sign in</span>
                      </Link>
                      <Link
                        href="/signup"
                        className="flex items-center space-x-3 rounded-md px-3 py-2 text-base font-medium text-charity-600 hover:bg-charity-50 dark:text-charity-400 dark:hover:bg-charity-950"
                        onClick={() => setIsOpen(false)}
                      >
                        <UserPlus className="h-5 w-5" />
                        <span>Sign up</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
} 