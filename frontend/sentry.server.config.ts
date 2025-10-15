import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENVIRONMENT = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    
    // Environment
    environment: SENTRY_ENVIRONMENT,
    
    // Performance Monitoring
    tracesSampleRate: 1.0,
    
    // Release tracking
    release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
    
    // Error filtering
    beforeSend(event) {
      // Don't send errors in development
      if (SENTRY_ENVIRONMENT === 'development') {
        console.error('Sentry Error (not sent in dev):', event);
        return null;
      }
      
      return event;
    },
    
    // Debug mode
    debug: false,
  });
}

export {};
