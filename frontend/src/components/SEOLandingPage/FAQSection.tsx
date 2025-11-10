import React from 'react';
import styles from './SEOLandingPage.module.css';

interface FAQ {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  keyword: string;
  locationName: string;
  avgPrice?: number;
  serviceCount: number;
}

/**
 * Generate FAQs based on keyword and location
 */
function generateFAQs(
  keyword: string,
  locationName: string,
  avgPrice?: number,
  serviceCount?: number,
): FAQ[] {
  const faqs: FAQ[] = [
    {
      question: `How much does ${keyword.toLowerCase()} cost in ${locationName}?`,
      answer: avgPrice
        ? `The average price for ${keyword.toLowerCase()} in ${locationName} is around R${avgPrice.toFixed(0)}. Prices may vary depending on the salon, service complexity, and additional treatments. We recommend browsing our listings to compare prices and find the best option for your budget.`
        : `Prices for ${keyword.toLowerCase()} in ${locationName} vary depending on the salon and service complexity. Browse our listings to compare prices and find the best option for your budget.`,
    },
    {
      question: `How do I book ${keyword.toLowerCase()} in ${locationName}?`,
      answer: `Booking ${keyword.toLowerCase()} in ${locationName} is easy with Stylr SA. Simply browse our verified salons, select your preferred service, choose an available time slot, and confirm your booking online. You'll receive instant confirmation and can manage your appointment through your account.`,
    },
    {
      question: `Are the salons offering ${keyword.toLowerCase()} in ${locationName} verified?`,
      answer: `Yes! All salons and beauty professionals on Stylr SA are verified. We check their credentials, hygiene standards, and customer reviews to ensure you receive quality service. You can read authentic reviews from real customers before making your booking.`,
    },
    {
      question: `Can I cancel or reschedule my ${keyword.toLowerCase()} appointment?`,
      answer: `Yes, you can manage your appointments through your Stylr SA account. Cancellation and rescheduling policies vary by salon, so please check the specific salon's policy when booking. We recommend contacting the salon directly if you need to make changes close to your appointment time.`,
    },
    {
      question: `What should I expect during my ${keyword.toLowerCase()} appointment?`,
      answer: `Your ${keyword.toLowerCase()} experience will vary depending on the specific service and salon. Generally, you can expect a consultation to discuss your preferences, the main service, and aftercare advice. Professional salons in ${locationName} maintain high hygiene standards and use quality products.`,
    },
  ];

  // Add service count specific FAQ if available
  if (serviceCount && serviceCount > 0) {
    faqs.push({
      question: `How many ${keyword.toLowerCase()} options are available in ${locationName}?`,
      answer: `There are currently ${serviceCount}+ ${keyword.toLowerCase()} services available in ${locationName} on Stylr SA. Our platform features a diverse range of salons and beauty professionals, giving you plenty of options to find the perfect match for your needs and preferences.`,
    });
  }

  return faqs.slice(0, 8); // Return max 8 FAQs
}

export default function FAQSection({
  keyword,
  locationName,
  avgPrice,
  serviceCount,
}: FAQSectionProps) {
  const faqs = generateFAQs(keyword, locationName, avgPrice, serviceCount);

  // Generate FAQ schema markup
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <section className={styles.faqSection}>
      {/* FAQ Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <h2 className={styles.h2}>Frequently Asked Questions</h2>

      <div className={styles.faqList}>
        {faqs.map((faq, index) => (
          <div key={index} className={styles.faqItem}>
            <h3 className={styles.faqQuestion}>{faq.question}</h3>
            <p className={styles.faqAnswer}>{faq.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
