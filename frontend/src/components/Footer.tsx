import Link from 'next/link';
import Image from 'next/image';
import styles from './Footer.module.css';

export default function Footer() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Stylr SA",
    "description": "Your go-to platform for verified salons, barbers, and beauty experts across South Africa",
    "url": "https://www.stylrsa.co.za",
    "logo": "https://www.stylrsa.co.za/logo-white.png",
    "image": "https://www.stylrsa.co.za/logo-white.png",
    "telephone": "+27-11-123-4567",
    "email": "info@stylrsa.co.za",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "111 Commissioner Street",
      "addressLocality": "Johannesburg",
      "addressRegion": "Gauteng",
      "postalCode": "2001",
      "addressCountry": "ZA"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": -26.2041,
      "longitude": 28.0473
    },
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": "08:00",
        "closes": "17:00"
      }
    ],
    "priceRange": "R",
    "areaServed": {
      "@type": "Country",
      "name": "South Africa"
    },
    "sameAs": []
  };

  return (
    <footer className={styles.footer}>
      {/* Schema.org Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      <div className={styles.seoFooterContent}>
        {/* Column 1: Brand & Trust */}
        <div className={styles.footerSection}>
          <Link href="/" className={styles.logoLink}>
            <Image
              src="/logo-white.png"
              alt="Stylr SA Logo"
              width={185}
              height={45}
              className={styles.logo}
            />
          </Link>
          <p className={styles.description}>
            At Stylr SA, we believe beauty begins with trust. Your go-to platform for verified salons, barbers, and beauty experts across South Africa.
          </p>
          <div className={styles.trustBadges}>
            <span className={styles.trustBadge}>✓ Verified Reviews Only</span>
            <span className={styles.trustBadge}>✓ Local SA Businesses</span>
            <span className={styles.trustBadge}>✓ Secure Booking</span>
            <span className={styles.trustBadge}>✓ Free to Use</span>
          </div>
          
          {/* Business Address */}
          <div className={styles.contactInfo}>
            <p className={styles.contactDetail}>
              <strong>📍 Address:</strong><br />
              111 Commissioner Street<br />
              Johannesburg, 2001<br />
              South Africa
            </p>
            <p className={styles.contactDetail}>
              <strong>🕒 Business Hours:</strong><br />
              Monday - Sunday<br />
              08:00 - 17:00
            </p>
            <p className={styles.contactDetail}>
              <strong>📧 Email:</strong> 
              <a href="mailto:info@stylrsa.co.za" className={styles.contactLink}>info@stylrsa.co.za</a>
            </p>
          </div>
        </div>

        {/* Column 2: Beauty Services */}
        <div className={styles.footerSection}>
          <h3 className={styles.sectionTitle}>Beauty Services</h3>
          <ul className={styles.links}>
            <li><Link href="/services/braiding-weaving" title="Braids, knotless braids, weaves in South Africa">Hair Braiding & Extensions</Link></li>
            <li><Link href="/services/haircuts-styling" title="Professional haircuts and styling services">Haircuts & Styling</Link></li>
            <li><Link href="/services/nail-care" title="Gel nails, acrylic nails, nail art">Nail Services</Link></li>
            <li><Link href="/services/makeup-beauty" title="Bridal makeup, event makeup, special occasions">Makeup Artist</Link></li>
            <li><Link href="/services/massage-body-treatments" title="Swedish massage, deep tissue massage">Massage & Wellness</Link></li>
            <li><Link href="/services/skin-care-facials" title="Facials, skincare treatments, beauty products">Skincare & Facials</Link></li>
            <li><Link href="/services/mens-grooming" title="Barber services, fades, beard grooming">Men's Grooming</Link></li>
            <li><Link href="/services/waxing-hair-removal" title="Waxing services and hair removal">Waxing & Hair Removal</Link></li>
            <li><Link href="/services/bridal-services" title="Wedding preparation, bridal packages">Bridal & Events</Link></li>
          </ul>
        </div>

        {/* Column 3: Popular Locations (South Africa) */}
        <div className={styles.footerSection}>
          <h3 className={styles.sectionTitle}>South Africa Locations</h3>
          <ul className={styles.links}>
            <li><Link href="/salons/location/gauteng" title="Braids, nails, makeup in Johannesburg and Pretoria">Gauteng</Link></li>
            <li><Link href="/salons/location/western-cape" title="Cape Town beauty salons and services">Western Cape</Link></li>
            <li><Link href="/salons/location/kwazulu-natal" title="Durban beauty experts and salons">KwaZulu-Natal</Link></li>
            <li><Link href="/salons/location/eastern-cape" title="Port Elizabeth and Eastern Cape salons">Eastern Cape</Link></li>
            <li><Link href="/salons/location/free-state" title="Bloemfontein beauty services">Free State</Link></li>
            <li><Link href="/salons/location/mpumalanga" title="Nelspruit and Mpumalanga beauty professionals">Mpumalanga</Link></li>
            <li><Link href="/salons/location/limpopo" title="Polokwane salons and beauty services">Limpopo</Link></li>
            <li><Link href="/salons/location/northern-cape" title="Kimberley and Northern Cape salons">Northern Cape</Link></li>
          </ul>
        </div>

        {/* Column 4: Top Searches & Keywords */}
        <div className={styles.footerSection}>
          <h3 className={styles.sectionTitle}>Top Searches</h3>
          <ul className={styles.links}>
            <li><Link href="/services/braiding-weaving?location=western-cape" title="Best braiding services in Cape Town">Braids Cape Town</Link></li>
            <li><Link href="/services/nail-care?location=gauteng" title="Professional nail artists in Johannesburg">Nail Artist Johannesburg</Link></li>
            <li><Link href="/services/mens-grooming?location=kwazulu-natal" title="Best barber shops in Durban">Barber Durban</Link></li>
            <li><Link href="/services/makeup-beauty" title="Wedding and special event makeup artists">Wedding Makeup</Link></li>
            <li><Link href="/services/massage-body-treatments" title="Relaxing and therapeutic massage services">Massage Therapy</Link></li>
            <li><Link href="/services/braiding-weaving" title="Hair extension specialists and services">Hair Extensions</Link></li>
            <li><Link href="/services/nail-care" title="Gel nails and acrylic nail services near me">Gel Nails Near Me</Link></li>
            <li><Link href="/salons" title="Professional and verified salons in SA">Professional Salon</Link></li>
            <li><Link href="/products" title="South African beauty products and supplies">Beauty Products SA</Link></li>
          </ul>
        </div>

        {/* Column 5: Helpful Resources */}
        <div className={styles.footerSection}>
          <h3 className={styles.sectionTitle}>Resources</h3>
          <ul className={styles.links}>
            <li><Link href="/blog" title="Beauty tips, trends, and guides">Beauty Blog</Link></li>
            <li><Link href="/blog/how-to-find-best-braider" title="Guide to finding professional braiding stylists">How to Find Best Braider</Link></li>
            <li><Link href="/blog/wedding-makeup-checklist" title="Complete wedding makeup preparation guide">Wedding Makeup Checklist</Link></li>
            <li><Link href="/blog/2024-hair-trends" title="Latest hair trends and styles">2024 Hair Trends</Link></li>
            <li><Link href="/blog/matric-dance-prep" title="Matric dance beauty preparation">Matric Dance Prep</Link></li>
            <li><Link href="/blog/seasonal-beauty-tips" title="Seasonal beauty and wellness tips">Seasonal Beauty</Link></li>
            <li><Link href="/advice" title="Comprehensive FAQ for customers and salons">FAQ & Support</Link></li>
            <li><Link href="/contact" title="Get in touch with Stylr SA team">Contact Us</Link></li>
            <li><Link href="/careers" title="Join the Stylr SA team">Careers</Link></li>
            <li><a href="https://www.allure.com" target="_blank" rel="noopener noreferrer" title="Beauty trends and tips">Allure Magazine</a></li>
            <li><a href="https://www.vogue.co.uk/beauty" target="_blank" rel="noopener noreferrer" title="Beauty trends and inspiration">Vogue Beauty</a></li>
          </ul>
        </div>

        {/* Column 6: Quick Links */}
        <div className={styles.footerSection}>
          <h3 className={styles.sectionTitle}>Quick Actions</h3>
          <ul className={styles.links}>
            <li><Link href="/salons" title="Find salons near you">Find a Salon</Link></li>
            <li><Link href="/services" title="Browse all beauty services">Browse Services</Link></li>
            <li><Link href="/promotions" title="Current deals and special offers">View Promotions</Link></li>
            <li><Link href="/products" title="Shop beauty products">Shop Products</Link></li>
            <li><Link href="/how-it-works" title="Learn how Stylr SA works">How It Works</Link></li>
            <li><Link href="/register" title="Register your salon or join as customer">Join Stylr SA</Link></li>
            <li><Link href="/prices" title="Pricing plans for salon owners">Salon Pricing</Link></li>
            <li><Link href="/faq" title="Frequently asked questions">Help Center</Link></li>
          </ul>
        </div>

        {/* Column 7: Resources */}
        <div className={styles.footerSection}>
          <h3 className={styles.sectionTitle}>More Resources</h3>
          <ul className={styles.links}>
            <li><Link href="/sitemap.xml" title="Full site structure and pages">XML Sitemap</Link></li>
            <li><Link href="/press" title="Press releases and media">Press & Media</Link></li>
            <li><Link href="/testimonials" title="Customer success stories">Testimonials</Link></li>
            <li><Link href="/community" title="Join our community">Community</Link></li>
            <li><Link href="/support" title="24/7 customer support">Customer Support</Link></li>
          </ul>
        </div>

        {/* Column 8: Legal & Important */}
        <div className={styles.footerSection}>
          <h3 className={styles.sectionTitle}>Company Info</h3>
          <ul className={styles.links}>
            <li><Link href="/about" title="About Stylr SA mission and story">About Stylr SA</Link></li>
            <li><Link href="/terms" title="Terms of service and usage">Terms of Service</Link></li>
            <li><Link href="/privacy" title="Privacy policy and data protection">Privacy Policy</Link></li>
            <li><Link href="/cookie-policy" title="Cookie usage and settings">Cookie Policy</Link></li>
            <li><Link href="/partner-guidelines" title="Guidelines for salon partners">Partner Guidelines</Link></li>
            <li><Link href="/safety-security" title="Safety and security information">Safety & Security</Link></li>
            <li><Link href="/accessibility" title="Accessibility information">Accessibility</Link></li>
            <li><Link href="/blog" title="Stylr SA blog with beauty tips and trends">Blog</Link></li>
          </ul>
        </div>
      </div>

      {/* Featured Articles Bar */}
      <div className={styles.featuredArticlesBar}>
        <h4 className={styles.featuredTitle}>📰 Popular Articles</h4>
        <div className={styles.featuredLinks}>
          <Link href="/blog/protective-hairstyles-guide" className={styles.featuredLink} title="Complete protective hairstyles guide">Knotless Braids Guide</Link>
          <Link href="/blog/cape-town-nail-trends" className={styles.featuredLink} title="Cape Town nail trends">Cape Town Nail Trends</Link>
          <Link href="/blog/mens-grooming-durban" className={styles.featuredLink} title="Durban men's grooming">Durban Barber Guide</Link>
          <Link href="/blog/wedding-makeup-artist" className={styles.featuredLink} title="Wedding makeup tips">Wedding Makeup Tips</Link>
          <Link href="/blog/highveld-skincare-guide" className={styles.featuredLink} title="Highveld skincare guide">Highveld Skincare</Link>
          <Link href="/blog/monthly-massage-benefits" className={styles.featuredLink} title="Massage benefits">Monthly Massage Benefits</Link>
          <Link href="/blog/verified-reviews-importance" className={styles.featuredLink} title="Importance of verified reviews">Verified Reviews</Link>
          <Link href="/blog/local-beauty-products" className={styles.featuredLink} title="Local SA beauty products">Local Beauty Products</Link>
        </div>
      </div>
      
      <div className={styles.mobileAppAnnouncement}>
        <div className={styles.announcementContent}>
          <div className={styles.announcementIcon}>📱</div>
          <div className={styles.announcementText}>
            <h4 className={styles.announcementTitle}>Mobile Apps Coming Soon!</h4>
            <p className={styles.announcementDescription}>
              Android and iOS apps are coming in our next massive update. Stay tuned for an even better experience!
            </p>
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p>© {new Date().getFullYear()} Stylr SA. All rights reserved.</p>
        <div className={styles.legalLinks}>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/privacy">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}

