'use client';

import { useState, useEffect, useMemo } from 'react';
import styles from './TypingAnimation.module.css';

interface TypingAnimationProps {
    words: string[];
    typingSpeed?: number;
    deletingSpeed?: number;
    delayBetweenWords?: number;
}

export default function TypingAnimation({
    words,
    typingSpeed = 100,
    deletingSpeed = 50,
    delayBetweenWords = 2000,
}: TypingAnimationProps) {
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [currentText, setCurrentText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    // Find the longest word to reserve space and prevent layout shift
    const longestWord = useMemo(() => {
        return words.reduce((longest, word) => 
            word.length > longest.length ? word : longest, ''
        );
    }, [words]);

    useEffect(() => {
        if (words.length === 0) return;

        const currentWord = words[currentWordIndex];

        const handleTyping = () => {
            if (isPaused) {
                return;
            }

            if (!isDeleting) {
                // Typing forward
                if (currentText.length < currentWord.length) {
                    setCurrentText(currentWord.substring(0, currentText.length + 1));
                } else {
                    // Finished typing current word, pause then start deleting
                    setIsPaused(true);
                    setTimeout(() => {
                        setIsPaused(false);
                        setIsDeleting(true);
                    }, delayBetweenWords);
                }
            } else {
                // Deleting backward
                if (currentText.length > 0) {
                    setCurrentText(currentText.substring(0, currentText.length - 1));
                } else {
                    // Finished deleting, move to next word
                    setIsDeleting(false);
                    setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
                }
            }
        };

        const speed = isDeleting ? deletingSpeed : typingSpeed;
        const timer = setTimeout(handleTyping, speed);

        return () => clearTimeout(timer);
    }, [
        currentText,
        currentWordIndex,
        isDeleting,
        isPaused,
        words,
        typingSpeed,
        deletingSpeed,
        delayBetweenWords,
    ]);

    return (
        <span className={styles.typingContainer}>
            {/* Invisible placeholder to reserve space for longest word */}
            <span className={styles.placeholder} aria-hidden="true">
                {longestWord}
            </span>
            {/* Visible typing text positioned on top */}
            <span className={styles.typingText}>
                {currentText}
                <span className={styles.cursor}>|</span>
            </span>
        </span>
    );
}
