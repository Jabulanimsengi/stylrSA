import styles from '../info-page.module.css';
import PageNav from '@/components/PageNav';

export default function HowItWorksPage() {
  return (
    <div className={styles.container}>
      <PageNav />
      <h1 className={styles.pageTitle}>How It Works</h1>
      <p className={styles.paragraph}>
        Your next favorite salon is just a few clicks away. We&apos;ve made our platform simple and intuitive for everyone.
      </p>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>For Clients</h2>
        <p className={styles.paragraph}>
          <strong>Discover:</strong> Use our powerful search and filter tools to find top-rated salons, specific services, or must-have
          beauty products in your area.
        </p>
        <p className={styles.paragraph}>
          <strong>Book &amp; Buy:</strong> Select a service, choose a time slot that works for you, and confirm your booking instantly.
          Purchase products from your favorite local sellers with secure checkout.
        </p>
        <p className={styles.paragraph}>
          <strong>Enjoy:</strong> Attend your appointment and leave a review to help the community. Track your product orders right to
          your door.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>For Salon &amp; Business Owners</h2>
        <p className={styles.paragraph}>
          <strong>Create Your Profile:</strong> Sign up in minutes and build a beautiful profile showcasing your salon, your unique
          services, and your team&apos;s talent.
        </p>
        <p className={styles.paragraph}>
          <strong>Manage Your Business:</strong> Use our intuitive dashboard to manage your schedule, accept new bookings, communicate
          with clients via our built-in chat, and track your performance.
        </p>
        <p className={styles.paragraph}>
          <strong>Sell &amp; Grow:</strong> List your beauty products on our marketplace, manage orders, and reach a wider audience than
          ever before.
        </p>
      </section>
    </div>
  );
}
