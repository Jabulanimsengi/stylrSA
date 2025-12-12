'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { FaCheck, FaMinus } from 'react-icons/fa';
import styles from './Checkbox.module.css';

interface CheckboxProps
    extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
    label?: string;
    description?: string;
}

const Checkbox = React.forwardRef<
    React.ElementRef<typeof CheckboxPrimitive.Root>,
    CheckboxProps
>(({ className, label, description, id, ...props }, ref) => {
    const generatedId = React.useId();
    const checkboxId = id || generatedId;

    if (label || description) {
        return (
            <div className={styles.wrapper}>
                <CheckboxPrimitive.Root
                    ref={ref}
                    id={checkboxId}
                    className={`${styles.root} ${className || ''}`}
                    {...props}
                >
                    <CheckboxPrimitive.Indicator className={styles.indicator}>
                        {props.checked === 'indeterminate' ? (
                            <FaMinus className={styles.icon} />
                        ) : (
                            <FaCheck className={styles.icon} />
                        )}
                    </CheckboxPrimitive.Indicator>
                </CheckboxPrimitive.Root>
                <div className={styles.labelWrapper}>
                    <label htmlFor={checkboxId} className={styles.label}>
                        {label}
                    </label>
                    {description && (
                        <p className={styles.description}>{description}</p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <CheckboxPrimitive.Root
            ref={ref}
            id={checkboxId}
            className={`${styles.root} ${className || ''}`}
            {...props}
        >
            <CheckboxPrimitive.Indicator className={styles.indicator}>
                {props.checked === 'indeterminate' ? (
                    <FaMinus className={styles.icon} />
                ) : (
                    <FaCheck className={styles.icon} />
                )}
            </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
    );
});

Checkbox.displayName = 'Checkbox';

export { Checkbox };
