import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ImpactChain - AI × Blockchain Charity Platform",
  description: "Transparent, AI-powered charity platform built on blockchain technology for maximum impact and accountability.",
  keywords: ["charity", "blockchain", "AI", "transparency", "donations", "impact"],
  authors: [{ name: "ImpactChain Team" }],
  openGraph: {
    title: "ImpactChain - AI × Blockchain Charity Platform",
    description: "Transparent, AI-powered charity platform built on blockchain technology for maximum impact and accountability.",
    type: "website",
    url: "https://impactchain.org",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <div className="relative min-h-screen bg-background text-foreground">
            <div className="gradient-mesh dark:gradient-mesh-dark fixed inset-0 -z-10" />
            {children}
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "hsl(var(--background))",
                color: "hsl(var(--foreground))",
                border: "1px solid hsl(var(--border))",
              },
              success: {
                iconTheme: {
                  primary: "hsl(var(--primary))",
                  secondary: "hsl(var(--primary-foreground))",
                },
              },
              error: {
                iconTheme: {
                  primary: "hsl(var(--destructive))",
                  secondary: "hsl(var(--destructive-foreground))",
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
