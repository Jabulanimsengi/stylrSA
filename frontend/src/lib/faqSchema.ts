// Helper functions for generating FAQ schema for location pages

import { CATEGORY_INFO } from './nearYouContent';
import { getCityInfo, getProvinceInfo } from './locationData';

interface FAQ {
  question: string;
  answer: string;
}

/**
 * Generate location-specific FAQs for a "near you" page
 */
export function generateLocationFAQs(
  categorySlug: string | null,
  provinceSlug: string | null,
  citySlug: string | null
): FAQ[] {
  const category = categorySlug ? CATEGORY_INFO[categorySlug] : null;
  const province = provinceSlug ? getProvinceInfo(provinceSlug) : null;
  const city = provinceSlug && citySlug ? getCityInfo(provinceSlug, citySlug) : null;

  const faqs: FAQ[] = [];

  if (category && city) {
    const serviceName = category.serviceName;
    faqs.push({
      question: `Where can I find ${serviceName} services near me in ${city.name}?`,
      answer: `You can find the best ${serviceName} services near you in ${city.name} right here on Stylr SA. Browse our network of top-rated professionals, read verified reviews, and book appointments directly online. All salons and service providers are verified and offer quality ${serviceName} services.`,
    });
    faqs.push({
      question: `How do I book ${serviceName} services in ${city.name}?`,
      answer: `Booking is easy! Simply browse the available ${serviceName} services in ${city.name}, select a salon or professional that matches your needs, and click "Book Now" to choose your preferred date and time. You'll receive instant confirmation and can manage your booking from your account.`,
    });
    faqs.push({
      question: `What are the best ${serviceName} salons in ${city.name}?`,
      answer: `The best ${serviceName} salons in ${city.name} are featured on our platform with verified reviews, ratings, and detailed profiles. You can filter by ratings, read customer reviews, view portfolios, and compare prices to find the perfect match for your needs.`,
    });
  } else if (category && province) {
    const serviceName = category.serviceName;
    faqs.push({
      question: `Where can I find ${serviceName} services in ${province.name}?`,
      answer: `Find top-rated ${serviceName} services across ${province.name} on Stylr SA. We have verified professionals in major cities including ${province.cities.slice(0, 3).map(c => c.name).join(', ')} and surrounding areas. Browse, compare, and book with confidence.`,
    });
  } else if (city) {
    faqs.push({
      question: `How do I find salons near me in ${city.name}?`,
      answer: `Use our location-based search to find salons near you in ${city.name}. You can filter by service type, read verified reviews, view portfolios, and book appointments directly. All salons are verified and offer quality beauty and wellness services.`,
    });
    faqs.push({
      question: `What services are available in ${city.name}?`,
      answer: `In ${city.name}, you can find a wide range of beauty and wellness services including hair styling, nail care, massages, facials, makeup, braiding, and more. Browse by category to find exactly what you're looking for.`,
    });
  }

  // Add general booking FAQ
  faqs.push({
    question: 'How do I pay for services booked through Stylr SA?',
    answer: 'Payment is handled directly with the salon at the time of your appointment. Stylr SA is a free discovery and booking platform - we help you find and book services, but payment is made directly to the service provider.',
  });

  return faqs;
}

/**
 * Generate FAQPage structured data schema
 */
export function generateFAQSchema(faqs: FAQ[]): object | null {
  if (!faqs || faqs.length === 0) {
    return null;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

