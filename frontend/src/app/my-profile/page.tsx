'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import styles from './MyProfilePage.module.css';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { FaHome, FaArrowLeft } from 'react-icons/fa';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
}

export default function MyProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { authStatus } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      router.push('/login');
    }

    if (authStatus === 'authenticated') {
      const fetchProfile = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('access_token');
        try {
          const res = await fetch('http://localhost:3000/api/users/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) {
            throw new Error('Failed to fetch profile');
          }
          const data = await res.json();
          setProfile(data);
          setFirstName(data.firstName);
          setLastName(data.lastName);
        } catch (error) {
          toast.error('Could not load your profile.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchProfile();
    }
  }, [authStatus, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const token = localStorage.getItem('access_token');
    try {
      const res = await fetch('http://localhost:3000/api/users/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ firstName, lastName }),
      });

      if (!res.ok) {
        throw new Error('Failed to update profile');
      }

      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.stickyHeader}>
        <div className={styles.navButtonsContainer}>
          <button onClick={() => router.back()} className={styles.navButton}>
            <FaArrowLeft /> Back
          </button>
          <Link href="/" className={styles.navButton}>
            <FaHome /> Home
          </Link>
        </div>
        <h1 className={styles.title}>My Profile</h1>
        <div className={styles.headerSpacer}></div>
      </div>

      <div className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={profile?.email || ''} disabled className={styles.input} />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.buttonContainer}>
            <button type="submit" disabled={isSaving} className="btn btn-primary">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}