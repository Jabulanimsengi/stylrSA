import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Use this for any user-generated content that needs to be rendered as HTML
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'title', 'target'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Sanitize plain text - removes all HTML tags
 * Use this for user inputs that should be plain text only
 */
export function sanitizeText(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitize and truncate text for display
 */
export function sanitizeAndTruncate(dirty: string, maxLength: number = 200): string {
  const clean = sanitizeText(dirty);
  if (clean.length <= maxLength) return clean;
  return clean.substring(0, maxLength) + '...';
}

/**
 * Sanitize URL to prevent javascript: and data: URIs
 */
export function sanitizeUrl(url: string): string {
  const clean = url.trim().toLowerCase();
  
  // Block dangerous protocols
  if (
    clean.startsWith('javascript:') ||
    clean.startsWith('data:') ||
    clean.startsWith('vbscript:') ||
    clean.startsWith('file:')
  ) {
    return '';
  }
  
  // Only allow http, https, and relative URLs
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('/')) {
    return url;
  }
  
  return '';
}

/**
 * Escape HTML special characters
 * Use this when you need to display user input as plain text
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return text.replace(/[&<>"'/]/g, (char) => map[char]);
}
