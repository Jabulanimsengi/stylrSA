import { Metadata } from 'next';
import styles from '../info-page.module.css';
import PageNav from '@/components/PageNav';

export const metadata: Metadata = {
  title: 'About Stylr SA - Our Mission, Story, and Vision',
  description: 'Learn about Stylr SA\'s mission to revolutionize South Africa\'s beauty industry. Discover our story, vision, and how we connect beauty professionals with clients.',
  keywords: 'about Stylr SA, beauty platform South Africa, salon booking, wellness marketplace, professional stylists',
  openGraph: {
    title: 'About Stylr SA - Our Mission and Vision',
    description: 'Discover how Stylr SA is revolutionizing the beauty and wellness industry in South Africa by connecting talented professionals with clients.',
    type: 'website',
    url: 'https://stylrsa.co.za/about',
  },
};

export default function AboutPage() {
  return (
    <div className={styles.container}>
      <PageNav />
      
      <section className={styles.section}>
        <h1 className={styles.pageTitle}>About Us</h1>
        
        <h2 className={styles.sectionTitle}>Our Mission</h2>
        <p className={styles.paragraph}>
          At Stylr SA, our mission is to digitally revolutionize the beauty and wellness industry in South Africa. We connect talented professionals and business owners with new clients, and help South Africans discover and book services with confidence, ease, and complete peace of mind.
        </p>

        <h2 className={styles.sectionTitle}>Our Story</h2>
        <p className={styles.paragraph}>
          Stylr SA was born from a simple, shared frustration: finding a trusted, local beauty professional was fragmented and difficult. We wanted to find the best braider in our neighborhood, a last-minute nail technician for an event, or a massage therapist with verified reviews, all in one place.
        </p>
        <p className={styles.paragraph}>
          We envisioned a single platform that not only makes discovery and booking seamless for customers but also provides a powerful, all-in-one management tool for salon owners and independent entrepreneurs. We built Stylr SA to be that solution—an ecosystem that empowers local businesses to grow and helps clients to look and feel their best.
        </p>

        <h2 className={styles.sectionTitle}>What We Do</h2>
        <div className={styles.infoBlock}>
          <h3 className={styles.blockTitle}>For Customers</h3>
          <p className={styles.blockContent}>
            We are your trusted partner for beauty and wellness. Discover top-rated salons, spas, barbers, and independent artists. Browse real-work galleries, "Before & After" portfolios, and verified video content. Read reviews from real customers and book your next appointment in just a few clicks.
          </p>
        </div>

        <div className={styles.infoBlock}>
          <h3 className={styles.blockTitle}>For Salon & Service Partners</h3>
          <p className={styles.blockContent}>
            We are your new "business-in-a-box." We provide you with a beautiful, professional profile, a complete booking and calendar management system, and tools to market your work through promotions, galleries, and videos. We handle the discovery so you can focus on what you do best: providing exceptional service.
          </p>
        </div>

        <div className={styles.infoBlock}>
          <h3 className={styles.blockTitle}>For Product Sellers</h3>
          <p className={styles.blockContent}>
            We offer a dedicated e-commerce marketplace for beauty and wellness products. If you sell hair care, skin care, or other beauty supplies, you can register as a seller, list your products, and manage your orders, reaching a highly-targeted audience of beauty-focused customers.
          </p>
        </div>

        <h2 className={styles.sectionTitle}>Our Vision</h2>
        <p className={styles.paragraph}>
          We are building the definitive digital destination for beauty and wellness in South Africa. We believe in empowering entrepreneurs, supporting local businesses, and setting a new standard for quality and trust in the industry.
        </p>
      </section>
    </div>
  );
}
