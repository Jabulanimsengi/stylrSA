import { Metadata } from 'next';
import NearMeClient from './NearMeClient';

export const metadata: Metadata = {
    title: 'Hair Salons Near Me | Find Best Salons & Spas Nearby | Stylr SA',
    description: 'Find the best hair salons, nail salons, spas, and beauty professionals near you. Use our location-based search to discover top-rated beauty services in your area.',
    keywords: 'hair salon near me, nail salon near me, spa near me, beauty salon near me, barbershop near me',
    alternates: {
        canonical: 'https://www.stylrsa.co.za/salons/near-me',
    },
    openGraph: {
        title: 'Hair Salons Near Me | Find Best Salons & Spas Nearby | Stylr SA',
        description: 'Find the best hair salons, nail salons, spas, and beauty professionals near you.',
        url: 'https://www.stylrsa.co.za/salons/near-me',
        siteName: 'Stylr SA',
        locale: 'en_ZA',
        type: 'website',
    },
};

export default function NearMePage() {
    return <NearMeClient />;
}
