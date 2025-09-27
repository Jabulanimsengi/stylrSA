// frontend/src/components/Accordion.tsx
import React, { useState } from 'react';
import styles from './Accordion.module.css'; // We'll create this CSS next

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  initialOpen?: boolean;
}

const Accordion: React.FC<AccordionProps> = ({ title, children, initialOpen = false }) => {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={styles.accordionItem}>
      <button className={styles.accordionHeader} onClick={toggleAccordion}>
        <span>{title}</span>
        <span className={`${styles.icon} ${isOpen ? styles.open : ''}`}>+</span>
      </button>
      {isOpen && (
        <div className={styles.accordionContent}>
          {children}
        </div>
      )}
    </div>
  );
};

export default Accordion;