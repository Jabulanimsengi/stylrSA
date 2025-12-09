'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logger } from '@/lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  attemptedRecovery: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  private recoveryTimeout: NodeJS.Timeout | null = null;

  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    attemptedRecovery: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Attempt automatic recovery for non-critical errors
    if (!this.state.attemptedRecovery && this.shouldAttemptRecovery(error)) {
      this.attemptAutoRecovery();
    }
  }

  componentWillUnmount() {
    if (this.recoveryTimeout) {
      clearTimeout(this.recoveryTimeout);
    }
  }

  private shouldAttemptRecovery(error: Error): boolean {
    // Don't auto-recover from critical errors
    const errorMessage = error.message?.toLowerCase() || '';
    const criticalPatterns = [
      'invariant',
      'hydration',
      'element type is invalid',
      'maximum update depth exceeded',
    ];
    
    return !criticalPatterns.some(pattern => errorMessage.includes(pattern));
  }

  private attemptAutoRecovery = () => {
    logger.info('Attempting automatic error recovery...');
    
    this.setState({ attemptedRecovery: true });
    
    // Wait briefly then try to recover
    this.recoveryTimeout = setTimeout(() => {
      this.handleReset();
    }, 1500);
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      attemptedRecovery: false,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Show recovery message if attempting auto-recovery
      if (this.state.attemptedRecovery && !this.recoveryTimeout) {
        return (
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              padding: '1.5rem 2rem',
              backgroundColor: 'white',
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              textAlign: 'center',
              zIndex: 9999,
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #3498db',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem',
              }}
            />
            <p style={{ margin: 0, color: '#666', fontSize: '0.95rem' }}>
              Recovering from error...
            </p>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        );
      }

      // Default fallback UI (only shown if auto-recovery failed or wasn't attempted)
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: '#f9f9f9',
          }}
        >
          <div
            style={{
              maxWidth: '600px',
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            }}
          >
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#e74c3c' }}>
              Oops! Something went wrong
            </h1>
            <p style={{ marginBottom: '1.5rem', color: '#666' }}>
              {this.state.attemptedRecovery 
                ? "We tried to recover automatically, but the error persists."
                : "We're sorry for the inconvenience. An unexpected error has occurred."}
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details
                style={{
                  marginBottom: '1.5rem',
                  padding: '1rem',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  maxHeight: '200px',
                  overflow: 'auto',
                }}
              >
                <summary style={{ cursor: 'pointer', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  Error Details (Development Only)
                </summary>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo && (
                    <>
                      {'\n\n'}
                      {this.state.errorInfo.componentStack}
                    </>
                  )}
                </pre>
              </details>
            )}

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#2980b9')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#3498db')}
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#95a5a6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#7f8c8d')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#95a5a6')}
              >
                Reload Page
              </button>
            </div>

            <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: '#999' }}>
              If the problem persists, please contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
