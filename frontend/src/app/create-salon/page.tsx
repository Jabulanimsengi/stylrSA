'use client';

import { useState } from 'react';
import styles from './CreateSalon.module.css';
import { useRouter } from 'next/navigation';

export default function CreateSalonPage() {
    const router = useRouter();
    const [salonName, setSalonName] = useState('');
    const [address, setAddress] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Here you would typically make an API call to your backend
        // to create the salon. For now, we'll simulate it.
        try {
            console.log('Creating salon:', { salonName, address });
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            // On success, redirect to the dashboard
            router.push('/dashboard');

        } catch (err) {
            setError('Failed to create salon. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.formWrapper}>
                <h1 className={styles.title}>Create Your Salon</h1>
                <p className={styles.subtitle}>
                    Welcome! Let's get your salon set up on The Salon Hub.
                </p>
                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && <p className={styles.error}>{error}</p>}
                    <div className={styles.inputGroup}>
                        <label htmlFor="salonName" className={styles.label}>Salon Name</label>
                        <input
                            type="text"
                            id="salonName"
                            value={salonName}
                            onChange={(e) => setSalonName(e.target.value)}
                            className={styles.input}
                            placeholder="e.g., Glamour & Grace"
                            required
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label htmlFor="address" className={styles.label}>Address</label>
                        <input
                            type="text"
                            id="address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className={styles.input}
                            placeholder="123 Main Street, Anytown"
                            required
                        />
                    </div>
                    <button type="submit" className={styles.submitButton} disabled={isLoading}>
                        {isLoading ? 'Creating...' : 'Create Salon'}
                    </button>
                </form>
            </div>
        </div>
    );
}