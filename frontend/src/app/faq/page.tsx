import { Metadata } from 'next';
import styles from '../info-page.module.css';
import PageNav from '@/components/PageNav';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions - Stylr SA Help Center',
  description: 'Find answers to common questions about booking, payments, salon management, and using the Stylr SA platform. Get help for customers and salon partners.',
  keywords: 'FAQ, help center, frequently asked questions, Stylr SA support, booking help, salon management',
  openGraph: {
    title: 'FAQ - Stylr SA Help Center',
    description: 'Get answers to frequently asked questions about using Stylr SA for booking beauty services or managing your salon.',
    type: 'website',
    url: 'https://stylrsa.co.za/faq',
  },
};

export default function FaqPage() {
  return (
    <div className={styles.container}>
      <PageNav />
      
      <section className={styles.section}>
        <h1 className={styles.pageTitle}>Frequently Asked Questions</h1>
        <p className={styles.paragraph}>Here are answers to our most common questions.</p>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>For Customers</h2>
          
          <div className={styles.faqItem}>
            <p className={styles.faqQuestion}>How do I make a booking?</p>
            <p className={styles.faqAnswer}>It&apos;s easy! Find the salon and service you want, click &quot;Book Now,&quot; select an available date and time from the calendar, and confirm your details. You&apos;ll receive a confirmation in your &quot;My Bookings&quot; section.</p>
          </div>

          <div className={styles.faqItem}>
            <p className={styles.faqQuestion}>How do I pay for my service?</p>
            <p className={styles.faqAnswer}>Payment is handled directly with the salon at the time of your appointment. Your booking on Stylr SA reserves your time slot.</p>
          </div>

          <div className={styles.faqItem}>
            <p className={styles.faqQuestion}>How can I cancel or reschedule a booking?</p>
            <p className={styles.faqAnswer}>Go to your &quot;My Bookings&quot; page. You&apos;ll see an option to cancel or modify your booking up to 24 hours before your appointment. If it&apos;s an emergency within 24 hours, please contact the salon directly using the details on their profile.</p>
          </div>

          <div className={styles.faqItem}>
            <p className={styles.faqQuestion}>How do I leave a review?</p>
            <p className={styles.faqAnswer}>After your booking is marked as &quot;Completed&quot; by the salon, you will be prompted to leave a review. You can find this in your &quot;My Bookings&quot; dashboard.</p>
          </div>

          <div className={styles.faqItem}>
            <p className={styles.faqQuestion}>Why isn&apos;t my review showing up immediately?</p>
            <p className={styles.faqAnswer}>To maintain trust and authenticity, all reviews are verified by our admin team before they are published. This ensures all reviews are from real customers and are constructive.</p>
          </div>

          <div className={styles.faqItem}>
            <p className={styles.faqQuestion}>How does the Chat feature work?</p>
            <p className={styles.faqAnswer}>You can use the chat feature to communicate directly with a salon after you have an active or upcoming booking with them. This is perfect for confirming details or asking specific questions about your service.</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>For Salon Owners & Sellers</h2>
          
          <div className={styles.faqItem}>
            <p className={styles.faqQuestion}>How do I get my salon listed on Stylr SA?</p>
            <p className={styles.faqAnswer}>Simply click &quot;Register&quot; and choose the &quot;Salon Owner&quot; or &quot;Seller&quot; role. Follow the steps to build your profile, and our team will review and approve your listing.</p>
          </div>

          <div className={styles.faqItem}>
            <p className={styles.faqQuestion}>Why are my gallery photos &quot;Pending&quot;?</p>
            <p className={styles.faqAnswer}>To protect our customers and ensure a high-quality experience, our admin team quickly reviews all media uploads (Gallery, Videos, Before & After). Your media will go live as soon as it&apos;s approved, usually within a few business hours.</p>
          </div>

          <div className={styles.faqItem}>
            <p className={styles.faqQuestion}>How do I manage my bookings?</p>
            <p className={styles.faqAnswer}>All your appointments are in your &quot;Dashboard.&quot; You will receive a notification for new booking requests, which you can then &quot;Confirm&quot; or &quot;Reschedule.&quot; You can also view your full calendar here.</p>
          </div>

          <div className={styles.faqItem}>
            <p className={styles.faqQuestion}>How do I respond to a customer review?</p>
            <p className={styles.faqAnswer}>From your &quot;Reviews&quot; tab in your dashboard, you can see all your reviews. You&apos;ll have an option to write a public &quot;Salon Response&quot; to any approved review. We highly recommend responding to both positive and negative feedback!</p>
          </div>

          <div className={styles.faqItem}>
            <p className={styles.faqQuestion}>How do I list products for sale?</p>
            <p className={styles.faqAnswer}>If you registered as a &quot;Seller,&quot; you will have a &quot;Product Dashboard.&quot; From there, you can add new products, upload images, set prices, and manage your inventory.</p>
          </div>
        </section>
      </section>
    </div>
  );
}
