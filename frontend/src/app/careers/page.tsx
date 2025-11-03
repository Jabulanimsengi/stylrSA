import { Metadata } from 'next';
import styles from '../info-page.module.css';
import PageNav from '@/components/PageNav';

export const metadata: Metadata = {
  title: 'Careers at Stylr SA - Join Our Mission',
  description: 'Join the team revolutionizing South Africa\'s beauty and wellness industry. We\'re always looking for talented, passionate people who believe in our mission.',
  keywords: 'careers, jobs, Stylr SA team, work at Stylr SA, beauty industry careers, tech jobs South Africa',
  openGraph: {
    title: 'Careers at Stylr SA - Join Our Mission',
    description: 'Build the future of beauty and wellness with us. Join our passionate team and make an impact across South Africa.',
    type: 'website',
    url: 'https://stylrsa.co.za/careers',
  },
};

export default function CareersPage() {
  return (
    <div className={styles.container}>
      <PageNav />
      
      <section className={styles.section}>
        <h1 className={styles.pageTitle}>Join the Mission</h1>
        <p className={styles.paragraph}>
          We are building the future of the beauty and wellness industry in South Africa.
        </p>
        <p className={styles.paragraph}>
          Our mission is simple: to digitally empower thousands of local entrepreneurs and make beauty and wellness accessible, searchable, and bookable for all. We&apos;re a passionate, tech-driven team obsessed with building a platform that our customers and partners can&apos;t live without.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Why Work With Us?</h2>
        <p className={styles.paragraph}>
          We&apos;re a small, agile team in a high-growth phase. We value innovation, collaboration, and a customer-first mindset. When you work at Stylr SA, you&apos;re not just a number—you&apos;re a core part of the team, and your work will directly impact thousands of small businesses and users across the country.
        </p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Our Talent Pool (We&apos;re Not Hiring Today, But...)</h2>
        <p className={styles.paragraph}>
          We don&apos;t have any open roles right now, but our plans are big, and we&apos;re always looking to connect with talented, passionate people who believe in our mission.
        </p>
        <p className={styles.paragraph}>
          We are building a talent pool for future roles. If you are a high-performer in any of the following areas, we&apos;d love to hear from you:
        </p>

        <div className={styles.infoBlock}>
          <h3 className={styles.blockTitle}>Engineering</h3>
          <p className={styles.blockContent}>
            You are a full-stack developer who loves our tech stack (TypeScript, NestJS, Next.js, Prisma, PostgreSQL).
          </p>
        </div>

        <div className={styles.infoBlock}>
          <h3 className={styles.blockTitle}>Partner Success</h3>
          <p className={styles.blockContent}>
            You are a born relationship-builder who finds joy in helping small businesses learn, grow, and succeed.
          </p>
        </div>

        <div className={styles.infoBlock}>
          <h3 className={styles.blockTitle}>Community Management</h3>
          <p className={styles.blockContent}>
            You are a social media and content-savvy storyteller who can build a vibrant, engaged community online.
          </p>
        </div>

        <div className={styles.infoBlock}>
          <h3 className={styles.blockTitle}>Customer Support</h3>
          <p className={styles.blockContent}>
            You are a patient, empathetic problem-solver who loves turning a customer&apos;s bad day into a great one.
          </p>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>How to Get in Touch</h2>
        <p className={styles.paragraph}>
          Think you&apos;d be a perfect fit for our future?
        </p>
        <p className={styles.paragraph}>
          Send your CV and a short email to <a href="mailto:info@stylrsa.co.za" className={styles.link}>info@stylrsa.co.za</a>. Please don&apos;t just send a CV—tell us why you are specifically excited about Stylr SA&apos;s mission.
        </p>
        <p className={styles.paragraph}>
          We keep all promising applications on file and will reach out to you first when a role opens up.
        </p>
      </section>
    </div>
  );
}

