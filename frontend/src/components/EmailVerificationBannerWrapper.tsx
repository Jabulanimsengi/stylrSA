'use client';

import { useAuth } from '@/hooks/useAuth';
import EmailVerificationBanner from '@/components/EmailVerificationBanner';

/**
 * Client-side wrapper that renders the email verification banner
 * for authenticated users who haven't verified their email.
 */
export default function EmailVerificationBannerWrapper() {
    const { user, authStatus } = useAuth();

    // Only show banner for authenticated users who haven't verified their email
    if (authStatus !== 'authenticated' || !user) {
        return null;
    }

    // User already verified
    if (user.emailVerified === true) {
        return null;
    }

    // If emailVerified is undefined (old user data), show banner
    // If emailVerified is false, show banner
    return <EmailVerificationBanner email={user.email} />;
}
