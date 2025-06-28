'use client';

import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './theme-provider';
import { Web3Provider } from './web3-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { NextIntlClientProvider } from 'next-intl';
import { usePathname } from 'next/navigation';
import { loadMessages, getLocaleFromPath, defaultLocale } from '@/lib/i18n-client';
import type { Locale } from '@/lib/i18n-client';

interface ProvidersProps {
  children: React.ReactNode;
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry on 404s
        if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
          return false;
        }
        // Don't retry on network errors (backend unavailable)
        if (error && typeof error === 'object' && 'message' in error) {
          const message = (error as any).message;
          if (message?.includes('Network Error') || 
              message?.includes('ECONNREFUSED') ||
              message?.includes('fetch failed')) {
            return false; // Don't retry network errors
          }
        }
        // Don't retry more than 3 times
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry network errors for mutations
        if (error && typeof error === 'object' && 'message' in error) {
          const message = (error as any).message;
          if (message?.includes('Network Error') || 
              message?.includes('ECONNREFUSED') ||
              message?.includes('fetch failed')) {
            return false;
          }
        }
        return failureCount < 1;
      },
    },
  },
});

// Fallback messages to prevent infinite loading
const fallbackMessages = {
  common: {
    loading: "Loading...",
    error: "Error",
    success: "Success"
  }
};

export function Providers({ children }: ProvidersProps) {
  const pathname = usePathname();
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const [messages, setMessages] = useState<any>(fallbackMessages);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentLocale = getLocaleFromPath(pathname);
    setLocale(currentLocale);
    
    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.warn('i18n loading timeout, using fallback messages');
      setMessages(fallbackMessages);
      setIsLoading(false);
    }, 3000); // 3 second timeout

    loadMessages(currentLocale)
      .then((loadedMessages) => {
        clearTimeout(timeoutId);
      setMessages(loadedMessages);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load i18n messages:', error);
        clearTimeout(timeoutId);
        setMessages(fallbackMessages);
      setIsLoading(false);
    });

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  // Simplified loading state with fallback
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Web3Provider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'hsl(var(--background))',
                  color: 'hsl(var(--foreground))',
                  border: '1px solid hsl(var(--border))',
                },
              }}
            />
            <ReactQueryDevtools 
              initialIsOpen={false} 
            />
          </Web3Provider>
        </ThemeProvider>
      </QueryClientProvider>
    </NextIntlClientProvider>
  );
}

export { queryClient }; 