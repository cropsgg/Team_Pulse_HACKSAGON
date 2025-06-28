// Type declaration for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

// Helper function to safely call gtag
const safeGtag = (...args: any[]) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args);
  }
};

// Optional Sentry integration (only if package is installed)
let sentryInit: any, captureException: any, addBreadcrumb: any;
try {
  const sentry = require('@sentry/nextjs');
  sentryInit = sentry.init;
  captureException = sentry.captureException;
  addBreadcrumb = sentry.addBreadcrumb;
} catch (e) {
  // Sentry not installed, use fallback functions
  sentryInit = () => {};
  captureException = (error: Error) => console.error('Error:', error);
  addBreadcrumb = () => {};
}

// Sentry Error Tracking Configuration
export const initSentry = () => {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN && process.env.NEXT_PUBLIC_ENVIRONMENT === 'production') {
    sentryInit({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NEXT_PUBLIC_ENVIRONMENT,
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      integrations: [
        // Performance monitoring
        // Web vitals tracking
      ],
      beforeSend(event: any) {
        // Filter out non-essential errors in production
        if (event.exception) {
          const error = event.exception.values?.[0];
          if (error?.value?.includes('Script error') || 
              error?.value?.includes('Network Error') ||
              error?.value?.includes('ChunkLoadError')) {
            return null;
          }
        }
        return event;
      },
    });
  }
};

// Custom Error Logging
export const logError = (error: Error, context?: Record<string, any>) => {
  console.error('Application Error:', error);
  
  if (context) {
    addBreadcrumb({
      message: 'Error Context',
      level: 'error',
      data: context,
    });
  }
  
  captureException(error);
};

// Performance Monitoring
export const trackPerformance = (name: string, duration: number, metadata?: Record<string, any>) => {
  // Send to analytics
  safeGtag('event', 'timing_complete', {
    name,
    value: duration,
    ...metadata,
  });
  
  // Send to performance monitoring
  addBreadcrumb({
    message: `Performance: ${name}`,
    level: 'info',
    data: { duration, ...metadata },
  });
};

// User Action Tracking
export const trackUserAction = (action: string, category: string, metadata?: Record<string, any>) => {
  // Google Analytics
  safeGtag('event', action, {
    event_category: category,
    ...metadata,
  });
  
  // Custom analytics
  addBreadcrumb({
    message: `User Action: ${action}`,
    category: 'user',
    data: { category, ...metadata },
  });
};

// Web3 Transaction Tracking
export const trackWeb3Transaction = (
  type: 'donation' | 'vote' | 'proposal' | 'registration',
  txHash: string,
  status: 'pending' | 'success' | 'failed',
  metadata?: Record<string, any>
) => {
  const event = {
    transaction_type: type,
    transaction_hash: txHash,
    status,
    timestamp: Date.now(),
    ...metadata,
  };
  
  // Analytics tracking
  safeGtag('event', 'web3_transaction', event);
  
  // Error tracking context
  addBreadcrumb({
    message: `Web3 Transaction: ${type}`,
    category: 'transaction',
    data: event,
  });
  
  console.log('Web3 Transaction:', event);
};

// Page View Tracking
export const trackPageView = (path: string, title?: string) => {
  safeGtag('config', process.env.NEXT_PUBLIC_ANALYTICS_ID!, {
    page_path: path,
    page_title: title,
  });
};

// Custom Event Tracking
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  safeGtag('event', eventName, parameters);
  
  addBreadcrumb({
    message: `Event: ${eventName}`,
    data: parameters,
  });
};

// Real-time Metrics for Production Monitoring
export class ProductionMetrics {
  private static instance: ProductionMetrics;
  private metrics: Map<string, { count: number; lastUpdated: number }> = new Map();
  
  static getInstance(): ProductionMetrics {
    if (!ProductionMetrics.instance) {
      ProductionMetrics.instance = new ProductionMetrics();
    }
    return ProductionMetrics.instance;
  }
  
  increment(metric: string, value: number = 1) {
    const current = this.metrics.get(metric) || { count: 0, lastUpdated: 0 };
    this.metrics.set(metric, {
      count: current.count + value,
      lastUpdated: Date.now(),
    });
  }
  
  gauge(metric: string, value: number) {
    this.metrics.set(metric, {
      count: value,
      lastUpdated: Date.now(),
    });
  }
  
  getMetrics() {
    return Object.fromEntries(this.metrics);
  }
  
  // Send metrics to monitoring service
  async flush() {
    if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'production') {
      try {
        const metrics = this.getMetrics();
        // Send to monitoring endpoint
        await fetch('/api/metrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(metrics),
        });
        
        // Clear metrics after sending
        this.metrics.clear();
      } catch (error) {
        console.error('Failed to send metrics:', error);
      }
    }
  }
}

// Initialize monitoring on app start
export const initMonitoring = () => {
  initSentry();
  
  // Set up periodic metrics flushing
  if (typeof window !== 'undefined') {
    setInterval(() => {
      ProductionMetrics.getInstance().flush();
    }, 60000); // Every minute
    
    // Track unhandled errors
    window.addEventListener('error', (event) => {
      logError(new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });
    
    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      logError(new Error(event.reason), {
        type: 'unhandledrejection',
      });
    });
  }
};

// Export singleton instance
export const metrics = ProductionMetrics.getInstance(); 