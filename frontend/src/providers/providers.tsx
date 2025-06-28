'use client';

import React from 'react';
import { ThemeProvider } from './theme-provider';
import { Web3Provider } from './web3-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import { NextIntlClientProvider } from 'next-intl';
import { useLocale } from 'next-intl';

interface ProvidersProps {
  children: React.ReactNode;
  messages?: any;
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Don't retry on 404s
        if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
          return false;
        }
        // Don't retry more than 3 times
        return failureCount < 3;
      },
    },
    mutations: {
      retry: 1,
    },
  },
});

export function Providers({ children, messages }: ProvidersProps) {
  const locale = useLocale();

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
              position="bottom-right"
            />
          </Web3Provider>
        </ThemeProvider>
      </QueryClientProvider>
    </NextIntlClientProvider>
  );
}

export { queryClient }; 