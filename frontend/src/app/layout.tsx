'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/providers/providers';
import { Toaster } from '@/components/ui/toaster';
import { MobileNav } from '@/components/mobile-nav';
import { SupportBot } from '@/components/support-bot';
import { HelmetProvider, Helmet } from 'react-helmet-async';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#ef4444" />
        <meta name="color-scheme" content="light dark" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <HelmetProvider>
          <Helmet>
            <title>ImpactChain & CharityChain - AI-Powered Decentralized Blockchain DAO</title>
            <meta name="description" content="Revolutionary AI-powered blockchain platform for transparent charitable giving, startup funding, and impact investing. Join the decentralized future of social impact." />
            <meta name="keywords" content="blockchain charity, impact investing, DAO governance, startup funding, transparent donations, social impact, Web3 philanthropy, cryptocurrency donations, milestone verification, Base blockchain" />
            <meta name="author" content="ImpactChain Team" />
            <meta name="robots" content="index, follow" />
            
            {/* Open Graph */}
            <meta property="og:type" content="website" />
            <meta property="og:locale" content="en_US" />
            <meta property="og:url" content="https://impactchain.org" />
            <meta property="og:title" content="ImpactChain & CharityChain - AI-Powered Blockchain DAO" />
            <meta property="og:description" content="Revolutionary AI-powered blockchain platform for transparent charitable giving and impact investing." />
            <meta property="og:site_name" content="ImpactChain & CharityChain" />
            
            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content="ImpactChain & CharityChain - AI-Powered Blockchain DAO" />
            <meta name="twitter:description" content="Revolutionary AI-powered blockchain platform for transparent charitable giving and impact investing." />
            <meta name="twitter:creator" content="@impactchain" />
            
            <link rel="canonical" href="https://impactchain.org" />
          </Helmet>
          
          <Providers>
            <div className="min-h-screen bg-background">
              {/* Skip to main content for accessibility */}
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50"
              >
                Skip to main content
              </a>
              
              {/* Mobile Navigation */}
              <div className="md:hidden fixed top-4 left-4 z-50">
                <MobileNav />
              </div>

              {/* Main Content */}
              <main id="main-content" className="relative">
                {children}
              </main>

              {/* Support Bot */}
              <SupportBot />

              {/* Toast Notifications */}
              <Toaster />
            </div>
          </Providers>
        </HelmetProvider>
      </body>
    </html>
  );
} 