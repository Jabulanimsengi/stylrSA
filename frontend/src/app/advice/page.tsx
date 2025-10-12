import styles from '../info-page.module.css';

export default function AdvicePage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>Advice</h1>
      <p className={styles.paragraph}>
        Get more from your Salon Hub experience with expert advice tailored for you.
      </p>

      <div className={styles.infoBlock}>
        <h3 className={styles.blockTitle}>Client Guides</h3>
        <p className={styles.blockContent}>
          Learn how to prepare for your first-ever spa day, what questions to ask your stylist for a new
          haircut, and how to maintain your look between appointments.
        </p>
      </div>

      <div className={styles.infoBlock}>
        <h3 className={styles.blockTitle}>Business Pro-Tips</h3>
        <p className={styles.blockContent}>
          Access exclusive content for our partners, including tips on taking professional-quality
          photos for your gallery, writing compelling service descriptions, and leveraging client reviews to attract more bookings.
        </p>
      </div>
    </div>
  );
}
