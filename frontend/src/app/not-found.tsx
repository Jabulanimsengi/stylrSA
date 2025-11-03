import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  const containerStyle: React.CSSProperties = {
    display: 'grid',
    placeItems: 'center',
    minHeight: '70vh',
    padding: 24,
    background: 'var(--color-surface)',
    color: 'var(--color-text-strong)',
  };

  const panelStyle: React.CSSProperties = {
    maxWidth: 540,
    width: '100%',
    textAlign: 'center',
    background: 'var(--color-surface-elevated)',
    border: '1px solid var(--color-border)',
    borderRadius: 16,
    padding: 32,
    boxShadow: 'var(--shadow-sm)',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '10px 16px',
    borderRadius: 12,
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    textDecoration: 'none',
    transition: 'background-color 150ms ease',
  };

  return (
    <div style={containerStyle}>
      <div style={panelStyle}>
        <h1 style={{ fontSize: 28, marginBottom: 12 }}>We can’t find that page</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 16 }}>
          The link may be broken or the page may have been removed.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link
            href="/"
            style={{
              ...buttonStyle,
              background: 'var(--color-primary)',
              color: 'var(--color-text-inverse)',
            }}
          >
            Go home
          </Link>
          <Link
            href="/salons"
            style={{
              ...buttonStyle,
              background: 'var(--color-secondary)',
              color: 'var(--color-text-inverse)',
            }}
          >
            Browse salons
          </Link>
        </div>
      </div>
    </div>
  );
}

