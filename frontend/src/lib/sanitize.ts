import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param dirty - The potentially unsafe HTML string
 * @param options - DOMPurify configuration options
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHtml(
  dirty: string,
  options?: DOMPurify.Config
): string {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  const defaultOptions: DOMPurify.Config = {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'code', 'pre',
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    ...options,
  };

  return DOMPurify.sanitize(dirty, defaultOptions);
}

/**
 * Sanitize plain text input (removes all HTML)
 * @param input - The potentially unsafe text string
 * @returns Plain text with HTML stripped
 */
export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitize user input for search queries
 * @param query - The search query string
 * @returns Sanitized search query
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') {
    return '';
  }

  // Remove HTML tags and dangerous characters
  return query
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>'"]/g, '') // Remove dangerous characters
    .trim();
}

/**
 * Sanitize URL to prevent javascript: and data: protocols
 * @param url - The potentially unsafe URL
 * @returns Sanitized URL or empty string if invalid
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  const trimmed = url.trim().toLowerCase();

  // Block dangerous protocols
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('vbscript:') ||
    trimmed.startsWith('file:')
  ) {
    return '';
  }

  // Only allow http, https, and relative URLs
  if (
    !trimmed.startsWith('http://') &&
    !trimmed.startsWith('https://') &&
    !trimmed.startsWith('/') &&
    !trimmed.startsWith('#')
  ) {
    return `https://${trimmed}`;
  }

  return url.trim();
}

/**
 * Sanitize file name to prevent directory traversal
 * @param filename - The potentially unsafe filename
 * @returns Sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    return '';
  }

  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace unsafe characters
    .replace(/^\.+/, '') // Remove leading dots
    .replace(/\.+$/, '') // Remove trailing dots
    .slice(0, 255); // Limit length
}

/**
 * Escape HTML entities in a string
 * @param text - The text to escape
 * @returns Text with HTML entities escaped
 */
export function escapeHtml(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'/]/g, (char) => htmlEntities[char] || char);
}

/**
 * Sanitize rich text content (for descriptions, reviews, etc.)
 * Allows more HTML tags but still protects against XSS
 * @param content - The rich text content
 * @returns Sanitized rich text
 */
export function sanitizeRichText(content: string): string {
  if (!content || typeof content !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'code', 'pre', 'span', 'div',
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'class'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Validate and sanitize phone number
 * @param phone - The phone number string
 * @returns Sanitized phone number or empty string
 */
export function sanitizePhone(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    return '';
  }

  // Remove all non-digit characters except + at the start
  return phone.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '');
}

/**
 * Sanitize email address
 * @param email - The email string
 * @returns Sanitized email or empty string
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }

  // Basic sanitization - remove dangerous characters
  return email
    .toLowerCase()
    .trim()
    .replace(/[<>'"]/g, '');
}
