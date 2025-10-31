import Link from 'next/link';
import Image from 'next/image';
import styles from './Footer.module.css';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
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
            At Stylr SA, we believe beauty begins with trust. Our platform helps you find verified salons, barbers, and beauty experts near you — so you can book with confidence, connect with professionals, and experience quality service every time.
          </p>
          <div className={styles.socials}>
            <a href="#" aria-label="Facebook" className={styles.socialLink}><FaFacebook /></a>
            <a href="#" aria-label="Twitter" className={styles.socialLink}><FaTwitter /></a>
            <a href="#" aria-label="Instagram" className={styles.socialLink}><FaInstagram /></a>
          </div>
        </div>

        <div className={styles.footerSection}>
          <h3 className={styles.sectionTitle}>Company</h3>
          <ul className={styles.links}>
            <li><Link href="/about">About Us</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
            <li><Link href="/careers">Careers</Link></li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h3 className={styles.sectionTitle}>Resources</h3>
          <ul className={styles.links}>
            <li><Link href="/how-it-works">How It Works</Link></li>
            <li><Link href="/advice">Advice</Link></li>
            <li><Link href="/prices">Prices</Link> <span style={{marginLeft:8, padding:'2px 6px', border:'1px solid #fff3', borderRadius:6, fontSize:12, opacity:0.9}}>Free plan • Video uploads on Growth+</span></li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h3 className={styles.sectionTitle}>Featured Articles</h3>
          <ul className={styles.links}>
            <li><Link href="/blog/protective-hairstyles-guide" title="Complete guide to knotless braids, box braids, and protective styles in South Africa">Protective Hairstyles Guide</Link></li>
            <li><Link href="/blog/cape-town-nail-trends" title="10 hottest nail trends in Cape Town from glazed donut to aura nails">Cape Town Nail Trends</Link></li>
            <li><Link href="/blog/mens-grooming-durban" title="Modern barbering guide: fades, beard sculpting, and hot towel shaves in Durban">Men's Grooming Guide</Link></li>
            <li><Link href="/blog/wedding-makeup-artist" title="How to find the perfect makeup artist for weddings and matric dances in Gauteng">Wedding Makeup Tips</Link></li>
            <li><Link href="/blog/highveld-skincare-guide" title="Beat dry Highveld air with hydration tips and treatments for glowing skin">Highveld Skincare</Link></li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h3 className={styles.sectionTitle}>Beauty & Wellness</h3>
          <ul className={styles.links}>
            <li><Link href="/blog/monthly-massage-benefits" title="Physical and mental health benefits of regular massage therapy">Monthly Massage Benefits</Link></li>
            <li><Link href="/blog/stylr-promotions-guide" title="How to find and use special deals and promotions on Stylr SA">Using Promotions</Link></li>
            <li><Link href="/blog/verified-reviews-importance" title="Why verified reviews matter and how to book with confidence">Verified Reviews</Link></li>
            <li><Link href="/blog/local-beauty-products" title="5 must-have South African beauty products to support local businesses">Local Beauty Products</Link></li>
            <li><Link href="/blog/matric-dance-prep" title="Ultimate Matric dance preparation checklist for hair, nails, and makeup">Matric Dance Prep</Link></li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h3 className={styles.sectionTitle}>Contact</h3>
          <ul className={styles.links}>
            <li>
              <a href="mailto:info@stylrsa.co.za">info@stylrsa.co.za</a>
            </li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h3 className={styles.sectionTitle}>Stay Updated</h3>
          <p>Subscribe to our newsletter for the latest deals and updates.</p>
          <form className={styles.newsletterForm}>
            <input type="email" placeholder="Your email address" className={styles.newsletterInput} />
            <button type="submit" className={styles.newsletterButton}>Subscribe</button>
          </form>
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

