'use client';

import { useState, useEffect } from 'react';
import { FaTimes, FaCheck, FaArrowRight, FaStore, FaCamera, FaCut, FaClock, FaChartLine } from 'react-icons/fa';
import styles from './OnboardingGuide.module.css';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action?: string;
  actionHref?: string;
  isComplete?: boolean;
}

interface OnboardingGuideProps {
  salonId?: string;
  hasServices?: boolean;
  hasGallery?: boolean;
  hasOperatingHours?: boolean;
  onDismiss?: () => void;
}

const DISMISSED_KEY = 'onboarding-guide-dismissed';

export default function OnboardingGuide({
  salonId,
  hasServices = false,
  hasGallery = false,
  hasOperatingHours = false,
  onDismiss,
}: OnboardingGuideProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if user has dismissed the guide
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const steps: OnboardingStep[] = [
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Add your salon name, description, location, and contact details to help customers find you.',
      icon: <FaStore />,
      action: 'Edit Profile',
      actionHref: '/dashboard?tab=settings',
      isComplete: !!salonId,
    },
    {
      id: 'services',
      title: 'Add Your Services',
      description: 'List the services you offer with prices and duration. This helps customers know what to expect.',
      icon: <FaCut />,
      action: 'Add Services',
      actionHref: '/dashboard?tab=services',
      isComplete: hasServices,
    },
    {
      id: 'gallery',
      title: 'Upload Gallery Photos',
      description: 'Showcase your best work! Photos help customers see your skills and style.',
      icon: <FaCamera />,
      action: 'Upload Photos',
      actionHref: '/dashboard?tab=gallery',
      isComplete: hasGallery,
    },
    {
      id: 'hours',
      title: 'Set Operating Hours',
      description: 'Let customers know when you\'re available for appointments.',
      icon: <FaClock />,
      action: 'Set Hours',
      actionHref: '/dashboard?tab=availability',
      isComplete: hasOperatingHours,
    },
    {
      id: 'promote',
      title: 'Promote Your Salon',
      description: 'Create promotions and share your profile to attract more customers.',
      icon: <FaChartLine />,
      action: 'Create Promotion',
      actionHref: '/dashboard?tab=promotions',
      isComplete: false,
    },
  ];

  const completedSteps = steps.filter(s => s.isComplete).length;
  const progress = Math.round((completedSteps / steps.length) * 100);

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, 'true');
    setIsVisible(false);
    onDismiss?.();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isVisible) return null;

  const step = steps[currentStep];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h3 className={styles.title}>Getting Started</h3>
          <span className={styles.progress}>{completedSteps}/{steps.length} complete</span>
        </div>
        <button onClick={handleDismiss} className={styles.closeButton} aria-label="Dismiss guide">
          <FaTimes />
        </button>
      </div>

      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>

      <div className={styles.stepIndicators}>
        {steps.map((s, index) => (
          <button
            key={s.id}
            onClick={() => setCurrentStep(index)}
            className={`${styles.stepDot} ${index === currentStep ? styles.active : ''} ${s.isComplete ? styles.complete : ''}`}
            aria-label={`Step ${index + 1}: ${s.title}`}
          >
            {s.isComplete ? <FaCheck /> : index + 1}
          </button>
        ))}
      </div>


      <div className={styles.stepContent}>
        <div className={`${styles.stepIcon} ${step.isComplete ? styles.complete : ''}`}>
          {step.icon}
        </div>
        <h4 className={styles.stepTitle}>{step.title}</h4>
        <p className={styles.stepDescription}>{step.description}</p>
        
        {step.isComplete ? (
          <div className={styles.completeBadge}>
            <FaCheck /> Completed
          </div>
        ) : step.actionHref ? (
          <a href={step.actionHref} className={styles.actionButton}>
            {step.action} <FaArrowRight />
          </a>
        ) : null}
      </div>

      <div className={styles.navigation}>
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className={styles.navButton}
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={currentStep === steps.length - 1}
          className={`${styles.navButton} ${styles.primary}`}
        >
          Next
        </button>
      </div>
    </div>
  );
}
