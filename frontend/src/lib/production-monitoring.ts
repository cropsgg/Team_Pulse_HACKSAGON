// Production Monitoring and Analytics Configuration
// Simplified version without external dependencies

// Global gtag declaration for Google Analytics
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

// Custom Error Logging
export const logError = (error: Error, context?: Record<string, any>) => {
  console.error('Application Error:', error);
  
  // Send to external error tracking service in production
  if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'production') {
    // Could be sent to Sentry, LogRocket, etc.
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        context,
      }),
    }).catch(() => {
      // Fail silently if error reporting is down
    });
  }
};

// Performance Monitoring
export const trackPerformance = (name: string, duration: number, metadata?: Record<string, any>) => {
  // Send to analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'timing_complete', {
      name,
      value: duration,
      ...metadata,
    });
  }
  
  // Log performance metrics
  console.log(`Performance: ${name} - ${duration}ms`, metadata);
};

// User Action Tracking
export const trackUserAction = (action: string, category: string, metadata?: Record<string, any>) => {
  // Google Analytics
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      ...metadata,
    });
  }
  
  // Log user actions for debugging
  console.log(`User Action: ${action} (${category})`, metadata);
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
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'web3_transaction', event);
  }
  
  console.log('Web3 Transaction:', event);
  
  // Send to backend for tracking
  if (process.env.NEXT_PUBLIC_ENVIRONMENT === 'production') {
    fetch('/api/transactions/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    }).catch(() => {
      // Fail silently
    });
  }
};

// Page View Tracking
export const trackPageView = (path: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag && process.env.NEXT_PUBLIC_ANALYTICS_ID) {
    window.gtag('config', process.env.NEXT_PUBLIC_ANALYTICS_ID, {
      page_path: path,
      page_title: title,
    });
  }
};

// Custom Event Tracking
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
  
  console.log(`Event: ${eventName}`, parameters);
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
  console.log('Initializing production monitoring...');
  
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
      logError(new Error(String(event.reason)), {
        type: 'unhandledrejection',
      });
    });
  }
};

// Web Vitals Tracking
export const trackWebVitals = (name: string, value: number, id: string, delta: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', name, {
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      event_category: 'Web Vitals',
      event_label: id,
      non_interaction: true,
    });
  }
};

// Export singleton instance
export const metrics = ProductionMetrics.getInstance();

// Health Check Function
export const healthCheck = async (): Promise<{ status: 'ok' | 'error'; timestamp: number; checks: Record<string, boolean> }> => {
  const checks: Record<string, boolean> = {};
  
  try {
    // Check if analytics is loaded
    checks.analytics = typeof window !== 'undefined' && !!window.gtag;
    
    // Check if API is reachable
    try {
      const response = await fetch('/api/health', { method: 'HEAD' });
      checks.api = response.ok;
    } catch {
      checks.api = false;
    }
    
    // Check localStorage availability
    try {
      localStorage.setItem('health-check', 'test');
      localStorage.removeItem('health-check');
      checks.localStorage = true;
    } catch {
      checks.localStorage = false;
    }
    
    const allChecksPass = Object.values(checks).every(Boolean);
    
    return {
      status: allChecksPass ? 'ok' : 'error',
      timestamp: Date.now(),
      checks,
    };
  } catch (error) {
    return {
      status: 'error',
      timestamp: Date.now(),
      checks,
    };
  }
}; 