/**
 * Get the URL path for a salon
 * Uses slug if available for SEO-friendly URLs, falls back to ID
 */
export function getSalonUrl(salon: { id: string; slug?: string | null }): string {
  const identifier = salon.slug || salon.id;
  return `/salons/${identifier}`;
}

/**
 * Get the full URL for a salon (including domain)
 */
export function getSalonFullUrl(salon: { id: string; slug?: string | null }, siteUrl?: string): string {
  const baseUrl = siteUrl || process.env.NEXT_PUBLIC_SITE_URL || 'https://www.stylrsa.co.za';
  return `${baseUrl}${getSalonUrl(salon)}`;
}
