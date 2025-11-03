"use client";
import React from 'react';

export default function SalonsError({ error: _error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const containerStyle: React.CSSProperties = {
    display: 'grid',
    placeItems: 'center',
    minHeight: '60vh',
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
    padding: 28,
    boxShadow: 'var(--shadow-sm)',
  };

  return (
    <div style={containerStyle}>
      <div style={panelStyle}>
        <h1 style={{ fontSize: 24, marginBottom: 12 }}>We couldn’t load salons</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 16 }}>
          Please try again. If this keeps happening, check your connection or try later.
        </p>
        <button
          onClick={() => reset()}
          style={{
            padding: '10px 16px',
            borderRadius: 12,
            background: 'var(--color-primary)',
            color: 'var(--color-text-inverse)',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}

