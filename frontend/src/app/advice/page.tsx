import { Metadata } from 'next';
import styles from '../info-page.module.css';
import PageNav from '@/components/PageNav';

export const metadata: Metadata = {
  title: 'Comprehensive FAQ - Stylr SA Help Center',
  description: 'Complete FAQ guide for customers, salon partners, and product sellers. Get answers about bookings, payments, reviews, media uploads, and more.',
  keywords: 'comprehensive FAQ, help guide, customer support, salon help, product seller help, Stylr SA',
  openGraph: {
    title: 'Comprehensive FAQ - Stylr SA Help Center',
    description: 'Complete guide for customers, salon partners, and product sellers using Stylr SA platform.',
    type: 'website',
    url: 'https://stylrsa.co.za/advice',
  },
};

export default function AdvicePage() {
  return (
    <div className={styles.container}>
      <PageNav />
      
      <section className={styles.section}>
        <h1 className={styles.pageTitle}>Advice (Comprehensive FAQ)</h1>
        <p className={styles.paragraph}>
          This page is your frontline of customer support. Based on your platform&apos;s features (verified reviews, product sales, salon bookings, and media uploads), a strong FAQ should be broken into three sections to serve your different user types.
        </p>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>For Customers (Finding Services)</h2>
          
          <div className={styles.faqItem}>
            <p className={styles.faqQuestion}>How do I make a booking?</p>
            <p className={styles.faqAnswer}>It&apos;s easy! Find the salon and service you want, click &quot;Book Now,&quot; select an available date and time from the salon&apos;s calendar, and confirm your details. You&apos;ll receive a confirmation in your &quot;My Bookings&quot; section.</p>
          </div>

          <div className={styles.faqItem}>
            <p className={styles.faqQuestion}>How do I pay for my service?</p>
            <p className={styles.faqAnswer}>All payments are handled directly between you and the salon at the time of your appointment. Stylr SA is a free discovery and booking platform; we do not process payments for services.</p>
          </div>

          <div className={styles.faqItem}>
            <p className={styles.faqQuestion}>How can I cancel or reschedule a booking?</p>
            <p className={styles.faqAnswer}>Go to your &quot;My Bookings&quot; page. You&apos;ll see an option to cancel or modify your booking, typically up to 24 hours before your appointment (this policy is set by the salon). If it&apos;s an emergency within 24 hours, please use the chat feature or call the salon directly.</p>
          </div>

          <div className={styles.faqItem}>
            <p className={styles.faqQuestion}>How do I leave a review?</p>
            <p className={styles.faqAnswer}>After your booking is marked as &quot;Completed&quot; by the salon, you will receive a notification and an option to leave a review will appear on that booking in your &quot;My Bookings&quot; dashboard.</p>
          </div>

          <div className={styles.faqItem}>
            <p className={styles.faqQuestion}>Why should I trust the reviews?</p>
            <p className={styles.faqAnswer}>Our &quot;Verified Review&quot; system is the core of our platform&apos;s trust. Only users who have booked and completed an appointment through Stylr SA can leave a review for that service. This system prevents fake reviews from friends, family, or competitors.</p>
          </div>

          <div className={styles.faqItem}>
            <p className={styles.faqQuestion}>How does the Chat feature work?</p>
            <p className={styles.faqAnswer}>You can use the built-in chat to communicate directly with a salon after you have an active or upcoming booking with them. This is perfect for confirming details, asking about preparation, or clarifying your needs.</p>
          </div>

          <div className={styles.faqItem}>
            <p className={styles.faqQuestion}>How do I buy a product?</p>
            <p className={styles.faqAnswer}>Just visit our &quot;Products&quot; page, add items to your cart, and check out. Products are sold and shipped directly by our registered &quot;Sellers.&quot; Your orders will appear in your &quot;My Orders&quot; dashboard.</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>For Salon Partners (Providing Services)</h2>
          
          <div className={styles.faqItem}>
            <p className={styles.faqQuestion}>How do I get my salon listed on Stylr SA?</p>
            <p className={styles.faqAnswer}>Simply click &quot;Register&quot; and choose the &quot;Salon Owner&quot; role. You&apos;ll be guided through setting up your profile, including your salon name, address, contact details, and your weekly operating hours.</p>
          </div>

          <div className={styles.faqItem}>
            <p className={styles.faqQuestion}>Why are my gallery photos/videos &quot;Pending&quot;?</p>
            <p className={styles.faqAnswer}>To maintain a high-quality, professional, and safe platform, all media (Gallery photos, &quot;Before & After&quot; images, and Videos) is reviewed by our admin team before it goes live. This approval process is usually completed within one business day and protects all users.</p>
          </div>

          <div className={styles.faqItem}>
            <p className={styles.faqQuestion}>How do I manage my bookings?</p>
            <p className={styles.faqAnswer}>All your appointments appear in your &quot;Dashboard.&quot; You will receive a notification for new booking requests, which you can then &quot;Confirm&quot; or &quot;Reschedule.&quot; You can also manage your full calendar and mark bookings as &quot;Completed&quot; to request a review from the client.</p>
          </div>

          <div className={styles.faqItem}>
            <p className={styles.faqQuestion}>How do I respond to a customer review?</p>
            <p className={styles.faqAnswer}>From your &quot;Reviews&quot; tab in your dashboard, you can see all your reviews. You&apos;ll have an option to write a public &quot;Salon Response&quot; to any approved review. We highly recommend responding to both positive and negative feedback—it shows you are an engaged owner!</p>
          </div>

          <div className={styles.faqItem}>
            <p className={styles.faqQuestion}>How do I create a Promotion?</p>
            <p className={styles.faqAnswer}>From your dashboard, you can create special promotions for your services. You can set a percentage discount or a fixed amount off, choose which services it applies to, and set a start and end date.</p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>For Product Sellers (Selling Goods)</h2>
          
          <div className={styles.faqItem}>
            <p className={styles.faqQuestion}>How is this different from being a Salon Partner?</p>
            <p className={styles.faqAnswer}>A &quot;Salon Partner&quot; lists services and takes appointments. A &quot;Product Seller&quot; lists physical products (like hair care, skin care, or tools) for sale and shipping. You can be both, but they are managed separately.</p>
          </div>

          <div className={styles.faqItem}>
            <p className={styles.faqQuestion}>How do I list my products?</p>
            <p className={styles.faqAnswer}>If you registered as a &quot;Seller,&quot; you will have a &quot;Product Dashboard&quot;. From there, you can add new products, upload images, write descriptions, set prices, and manage your inventory.</p>
          </div>

          <div className={styles.faqItem}>
            <p className={styles.faqQuestion}>How do I manage my orders?</p>
            <p className={styles.faqAnswer}>When a customer buys your product, you&apos;ll receive a notification and the order will appear in your &quot;Product Dashboard.&quot; You are responsible for shipping the item to the customer and marking the order as &quot;Shipped&quot; or &quot;Completed&quot; in the system.</p>
          </div>

          <div className={styles.faqItem}>
            <p className={styles.faqQuestion}>How do I get paid for product sales?</p>
            <p className={styles.faqAnswer}>Stylr SA processes customer payments for products via our secure payment gateway. Payouts to sellers are made on a regular schedule (e.g., weekly or bi-weekly) for all completed orders, minus a small platform commission. You will manage your payout details in your seller settings.</p>
          </div>
        </section>
      </section>
    </div>
  );
}
