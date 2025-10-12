import styles from '../info-page.module.css';

export default function FaqPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>FAQ</h1>
      <p className={styles.paragraph}>Have questions? We have answers.</p>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>For Clients</h2>
        
        <div className={styles.faqItem}>
          <p className={styles.faqQuestion}>How do I cancel or reschedule my booking?</p>
          <p className={styles.faqAnswer}>You can manage your appointments directly from your &quot;My Bookings&quot; page. Please be aware of the salon&apos;s cancellation policy.</p>
        </div>

        <div className={styles.faqItem}>
          <p className={styles.faqQuestion}>Is my payment information secure?</p>
          <p className={styles.faqAnswer}>Yes, we use industry-leading payment processing to ensure all your data is encrypted and secure.</p>
        </div>

        <div className={styles.faqItem}>
          <p className={styles.faqQuestion}>How do I contact a salon before booking?</p>
          <p className={styles.faqAnswer}>You can use our integrated chat feature on the salon&apos;s profile page to ask any questions.</p>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>For Salon Owners</h2>
        
        <div className={styles.faqItem}>
          <p className={styles.faqQuestion}>How and when do I get paid?</p>
          <p className={styles.faqAnswer}>Payouts are processed automatically to your connected bank account 48 hours after a completed appointment or product delivery.</p>
        </div>

        <div className={styles.faqItem}>
          <p className={styles.faqQuestion}>Can I set my own hours and block off time?</p>
          <p className={styles.faqAnswer}>Yes, your dashboard gives you full control over your calendar, opening hours, and personal availability.</p>
        </div>

        <div className={styles.faqItem}>
          <p className={styles.faqQuestion}>What kind of support do you offer?</p>
          <p className={styles.faqAnswer}>We offer email support for all our partners, with priority phone support available for our Elite plan members.</p>
        </div>
      </section>
    </div>
  );
}
