import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    
    // Environment
    environment: SENTRY_ENVIRONMENT,
    
    // Performance Monitoring
    tracesSampleRate: 1.0, // Capture 100% of transactions in production
    
    // Session Replay
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
    
    // Release tracking
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
    
    // Integrations
    integrations: [
      new Sentry.BrowserTracing({
        // Custom routing instrumentation
        tracePropagationTargets: [
          'localhost',
          /^\//,
          process.env.NEXT_PUBLIC_API_ORIGIN || '',
        ],
      }),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    
    // Filtering
    beforeSend(event, hint) {
      // Filter out known errors that aren't critical
      const error = hint.originalException;
      
      // Don't send cancelled requests
      if (error && typeof error === 'object' && 'name' in error) {
        if (error.name === 'AbortError' || error.name === 'CancelledError') {
          return null;
        }
      }
      
      // Don't send network errors in development
      if (SENTRY_ENVIRONMENT === 'development') {
        if (event.exception?.values?.[0]?.type === 'NetworkError') {
          return null;
        }
      }
      
      return event;
    },
    
    // Error filtering
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'chrome-extension://',
      'moz-extension://',
      
      // Random network errors
      'NetworkError',
      'Network request failed',
      'Failed to fetch',
      'Load failed',
      
      // Known third-party issues
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      
      // Ad blockers
      'adsbygoogle',
      '__gCrWeb',
      '__firefox__',
    ],
    
    // Breadcrumbs
    maxBreadcrumbs: 50,
    
    // Debug mode (only in development)
    debug: SENTRY_ENVIRONMENT === 'development',
  });
}

export {};
