"use client";
import React from 'react';
import Link from 'next/link';

export default function GlobalError({ error: _error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const containerStyle: React.CSSProperties = {
    display: 'grid',
    placeItems: 'center',
    minHeight: '100vh',
    padding: 24,
    background: 'var(--color-surface)',
    color: 'var(--color-text-strong)',
  };

  const panelStyle: React.CSSProperties = {
    maxWidth: 520,
    width: '100%',
    textAlign: 'center',
    background: 'var(--color-surface-elevated)',
    border: '1px solid var(--color-border)',
    borderRadius: 16,
    padding: 32,
    boxShadow: 'var(--shadow-sm)',
  };

  const subtitleStyle: React.CSSProperties = {
    color: 'var(--color-text-muted)',
    marginBottom: 16,
  };

  const buttonStyle: React.CSSProperties = {
    padding: '10px 16px',
    borderRadius: 12,
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'background-color 150ms ease',
  };

  return (
    <div style={containerStyle}>
      <div style={panelStyle}>
        <h1 style={{ fontSize: 28, marginBottom: 12 }}>Something went wrong</h1>
        <p style={subtitleStyle}>
          An unexpected error occurred. Please try again. If the problem persists, contact support.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={() => reset()}
            style={{
              ...buttonStyle,
              background: 'var(--color-primary)',
              color: 'var(--color-text-inverse)',
            }}
          >
            Try again
          </button>
          <Link
            href="/"
            style={{
              ...buttonStyle,
              background: 'var(--color-secondary)',
              color: 'var(--color-text-inverse)',
            }}
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
