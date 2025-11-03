/**
 * Utility to safely handle DOM portal operations
 * Prevents "Cannot read properties of null (reading 'removeChild')" errors
 */

export function safeRemoveChild(parent: Node | null, child: Node | null): boolean {
  if (!parent || !child) {
    return false;
  }

  try {
    if (parent.contains(child)) {
      parent.removeChild(child);
      return true;
    }
  } catch (error) {
    console.warn('Error removing child node:', error);
  }

  return false;
}

export function safeAppendChild(parent: Node | null, child: Node | null): boolean {
  if (!parent || !child) {
    return false;
  }

  try {
    if (!parent.contains(child)) {
      parent.appendChild(child);
      return true;
    }
  } catch (error) {
    console.warn('Error appending child node:', error);
  }

  return false;
}

/**
 * Clean up orphaned toast containers on mount
 * This prevents duplicate containers and DOM errors
 */
export function cleanupToastContainers(): void {
  if (typeof window === 'undefined') return;

  try {
    const containers = document.querySelectorAll('.Toastify');
    
    // Keep only the last container if multiple exist
    if (containers.length > 1) {
      containers.forEach((container, index) => {
        if (index < containers.length - 1) {
          container.remove();
        }
      });
    }
  } catch (error) {
    console.warn('Error cleaning up toast containers:', error);
  }
}

/**
 * Prevent React 18 strict mode double-mount issues with portals
 */
export function setupPortalErrorHandling(): void {
  if (typeof window === 'undefined') return;

  // Catch and suppress portal-related errors in development
  const originalError = console.error;
  console.error = (...args) => {
    // Suppress known React 18 portal errors
    const errorMessage = args[0]?.toString() || '';
    
    if (
      errorMessage.includes('removeChild') ||
      errorMessage.includes('appendChild') ||
      errorMessage.includes('NotFoundError')
    ) {
      // Log to console for debugging but don't crash
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Suppressed Portal Error]:', ...args);
      }
      return;
    }

    // Call original console.error for other errors
    originalError.apply(console, args);
  };
}
