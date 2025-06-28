import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Providers } from '@/providers/providers';
import { getMessages } from 'next-intl/server';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: {
    default: 'ImpactChain & CharityChain',
    template: '%s | ImpactChain & CharityChain',
  },
  description: 'AI-Powered Decentralized Blockchain DAO platform revolutionizing funding for startups, charitable causes, and individuals in need through transparent, accountable, and efficient funding mechanisms.',
  keywords: [
    'blockchain',
    'charity',
    'fundraising',
    'DAO',
    'Web3',
    'DeFi',
    'social impact',
    'crowdfunding',
    'transparency',
    'accountability',
    'startup funding',
    'VC',
    'venture capital',
    'AI-powered',
    'Base blockchain',
    'smart contracts',
  ],
  authors: [
    {
      name: 'ImpactChain Team',
      url: 'https://impactchain.org',
    },
  ],
  creator: 'ImpactChain',
  publisher: 'ImpactChain',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://impactchain.org'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'ImpactChain & CharityChain - Revolutionizing Funding Through Blockchain',
    description: 'AI-Powered Decentralized Blockchain DAO for transparent and accountable funding of startups and charitable causes.',
    siteName: 'ImpactChain',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ImpactChain & CharityChain',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ImpactChain & CharityChain',
    description: 'AI-Powered Decentralized Blockchain DAO for transparent funding',
    images: ['/og-image.png'],
    creator: '@impactchain',
    site: '@impactchain',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#5667ff',
      },
    ],
  },
  manifest: '/site.webmanifest',
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  other: {
    'msapplication-TileColor': '#5667ff',
    'theme-color': '#ffffff',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#1B1D36' },
  ],
  colorScheme: 'light dark',
};

interface RootLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export default async function RootLayout({
  children,
  params: { locale },
}: RootLayoutProps) {
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html 
      lang={locale} 
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Prefetch DNS for external resources */}
        <link rel="dns-prefetch" href="//images.unsplash.com" />
        <link rel="dns-prefetch" href="//api.impactchain.org" />
        
        {/* Web App Manifest */}
        <link rel="manifest" href="/site.webmanifest" />
        
        {/* Safari specific meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ImpactChain" />
        
        {/* Microsoft specific meta tags */}
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Security headers via meta tags */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        
        {/* Performance hints */}
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body 
        className={`
          min-h-screen bg-background font-sans antialiased
          selection:bg-primary/20 selection:text-primary-foreground
        `}
        suppressHydrationWarning
      >
        <Providers messages={messages}>
          {/* Skip to main content link for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-3 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            Skip to main content
          </a>
          
          {children}
          
          {/* Service Worker registration script */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js');
                  });
                }
              `,
            }}
          />
        </Providers>
      </body>
    </html>
  );
} 