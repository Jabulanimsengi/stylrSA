import styles from '../info-page.module.css';
import PageNav from '@/components/PageNav';

export default function ContactPage() {
  return (
    <div className={styles.container}>
      <PageNav />
      <h1 className={styles.pageTitle}>Contact Us</h1>
      <p className={styles.paragraph}>
        We&apos;re here to help! Whether you&apos;re a client with a question or a salon owner needing support, we want to hear from you.
      </p>

      <div className={styles.infoBlock}>
        <h3 className={styles.blockTitle}>Customer &amp; Booking Support</h3>
        <p className={styles.blockContent}>
          For any questions about your bookings, payments, or using the app, please email
          us at <a href="mailto:support@thesalonhub.com" className={styles.link}>support@thesalonhub.com</a> or fill out the contact form below.
        </p>
      </div>

      <div className={styles.infoBlock}>
        <h3 className={styles.blockTitle}>Salon &amp; Seller Partnerships</h3>
        <p className={styles.blockContent}>
          Interested in listing your salon or selling your products on our platform? Reach
          out to our partnership team at <a href="mailto:partners@thesalonhub.com" className={styles.link}>partners@thesalonhub.com</a>.
        </p>
      </div>

      <div className={styles.infoBlock}>
        <h3 className={styles.blockTitle}>Press &amp; Media Inquiries</h3>
        <p className={styles.blockContent}>
          For all media-related questions, please contact <a href="mailto:press@thesalonhub.com" className={styles.link}>press@thesalonhub.com</a>.
        </p>
      </div>

      <p className={styles.paragraph}>Our team is available from 9 AM to 5 PM, Monday to Friday.</p>
    </div>
  );
}
