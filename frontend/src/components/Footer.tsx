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
              src="/logo-transparent.png" 
              alt="Maxisalonhub Logo"
              width={185}
              height={45}
              className={styles.logo}
            />
          </Link>
          <p className={styles.description}>
            Your one-stop destination for finding and booking the best salon experiences near you.
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
            <li><Link href="/blog">Blog</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/careers">Careers</Link></li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h3 className={styles.sectionTitle}>Resources</h3>
          <ul className={styles.links}>
            <li><Link href="/how-it-works">How It Works</Link></li>
            <li><Link href="/advice">Advice</Link></li>
            <li><Link href="/prices">Prices</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
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
      <div className={styles.footerBottom}>
        <p>© {new Date().getFullYear()} Maxisalonhub. All rights reserved.</p>
        <div className={styles.legalLinks}>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/privacy">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}

