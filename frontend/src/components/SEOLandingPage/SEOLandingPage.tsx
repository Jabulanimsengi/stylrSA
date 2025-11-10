import React from 'react';
import Link from 'next/link';
import styles from './SEOLandingPage.module.css';

interface Breadcrumb {
  label: string;
  url: string;
}

interface RelatedLink {
  label: string;
  url: string;
  type: 'service' | 'location';
}

interface SEOLandingPageProps {
  // Core SEO data
  h1: string;
  h2Headings: string[];
  h3Headings?: string[];
  introText: string;
  metaTitle: string;
  metaDescription: string;

  // Breadcrumbs
  breadcrumbs: Breadcrumb[];

  // Schema markup
  schemaMarkup?: any;

  // Stats
  serviceCount: number;
  salonCount: number;
  avgPrice?: number;

  // Internal linking
  relatedServices?: RelatedLink[];
  nearbyLocations?: RelatedLink[];

  // Content sections
  children?: React.ReactNode;

  // CTA
  ctaTitle?: string;
  ctaDescription?: string;
  ctaButtonText?: string;
  ctaButtonLink?: string;

  // Keyword and location for dynamic content
  keyword: string;
  locationName: string;
}

export default function SEOLandingPage({
  h1,
  h2Headings,
  h3Headings,
  introText,
  breadcrumbs,
  schemaMarkup,
  serviceCount,
  salonCount,
  avgPrice,
  relatedServices,
  nearbyLocations,
  children,
  ctaTitle,
  ctaDescription,
  ctaButtonText = 'Browse All Services',
  ctaButtonLink = '/services',
  keyword,
  locationName,
}: SEOLandingPageProps) {
  return (
    <div className={styles.container}>
      {/* Schema.org JSON-LD */}
      {schemaMarkup && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
        />
      )}

      {/* Breadcrumbs */}
      <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        <ol className={styles.breadcrumbList}>
          {breadcrumbs.map((crumb, index) => (
            <li key={index} className={styles.breadcrumbItem}>
              {index < breadcrumbs.length - 1 ? (
                <>
                  <Link href={crumb.url} className={styles.breadcrumbLink}>
                    {crumb.label}
                  </Link>
                  <span className={styles.breadcrumbSeparator}>/</span>
                </>
              ) : (
                <span className={styles.breadcrumbCurrent}>{crumb.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* H1 Heading */}
      <header className={styles.header}>
        <h1 className={styles.h1}>{h1}</h1>
      </header>

      {/* Stats Bar */}
      {(serviceCount > 0 || salonCount > 0) && (
        <div className={styles.statsBar}>
          {serviceCount > 0 && (
            <div className={styles.statItem}>
              <span className={styles.statValue}>{serviceCount}</span>
              <span className={styles.statLabel}>
                Service{serviceCount !== 1 ? 's' : ''} Available
              </span>
            </div>
          )}
          {salonCount > 0 && (
            <div className={styles.statItem}>
              <span className={styles.statValue}>{salonCount}</span>
              <span className={styles.statLabel}>
                Verified Salon{salonCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}
          {avgPrice && (
            <div className={styles.statItem}>
              <span className={styles.statValue}>R{avgPrice.toFixed(0)}</span>
              <span className={styles.statLabel}>Average Price</span>
            </div>
          )}
        </div>
      )}

      {/* Intro Text */}
      <section className={styles.introSection}>
        <div className={styles.introText}>
          {introText.split('\n\n').map((paragraph, index) => (
            <p key={index} className={styles.paragraph}>
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      {/* Main Content Sections */}
      {children && <div className={styles.mainContent}>{children}</div>}

      {/* H2 Sections (if no children provided) */}
      {!children &&
        h2Headings.map((heading, index) => (
          <section key={index} className={styles.contentSection}>
            <h2 className={styles.h2}>{heading}</h2>
            <div className={styles.sectionContent}>
              {/* Placeholder content - will be replaced by actual service/salon listings */}
              <p className={styles.paragraph}>
                Discover the best {keyword.toLowerCase()} services in{' '}
                {locationName}. Our verified professionals are ready to serve
                you.
              </p>
            </div>
          </section>
        ))}

      {/* Related Services Section (CRITICAL for internal linking) */}
      {relatedServices && relatedServices.length > 0 && (
        <section className={styles.linksSection}>
          <h2 className={styles.h2}>Related Services in {locationName}</h2>
          <div className={styles.linksGrid}>
            {relatedServices.map((service, index) => (
              <Link
                key={index}
                href={service.url}
                className={styles.linkCard}
                prefetch={false}
              >
                <span className={styles.linkLabel}>{service.label}</span>
                <span className={styles.linkArrow}>→</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Nearby Locations Section (CRITICAL for internal linking) */}
      {nearbyLocations && nearbyLocations.length > 0 && (
        <section className={styles.linksSection}>
          <h2 className={styles.h2}>{keyword} in Nearby Areas</h2>
          <div className={styles.linksGrid}>
            {nearbyLocations.map((location, index) => (
              <Link
                key={index}
                href={location.url}
                className={styles.linkCard}
                prefetch={false}
              >
                <span className={styles.linkLabel}>{location.label}</span>
                <span className={styles.linkArrow}>→</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>
            {ctaTitle || `Ready to Book ${keyword} in ${locationName}?`}
          </h2>
          <p className={styles.ctaDescription}>
            {ctaDescription ||
              `Browse ${serviceCount > 0 ? `${serviceCount} verified services` : 'our verified professionals'} and book your appointment online today.`}
          </p>
          <Link href={ctaButtonLink} className={styles.ctaButton}>
            {ctaButtonText}
          </Link>
        </div>
      </section>
    </div>
  );
}
