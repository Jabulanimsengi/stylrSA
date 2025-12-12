'use client';

import * as React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';
import styles from './Switch.module.css';

interface SwitchProps
    extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
    label?: string;
    description?: string;
}

const Switch = React.forwardRef<
    React.ElementRef<typeof SwitchPrimitive.Root>,
    SwitchProps
>(({ className, label, description, id, ...props }, ref) => {
    const generatedId = React.useId();
    const switchId = id || generatedId;

    if (label || description) {
        return (
            <div className={styles.wrapper}>
                <div className={styles.labelWrapper}>
                    <label htmlFor={switchId} className={styles.label}>
                        {label}
                    </label>
                    {description && (
                        <p className={styles.description}>{description}</p>
                    )}
                </div>
                <SwitchPrimitive.Root
                    ref={ref}
                    id={switchId}
                    className={`${styles.root} ${className || ''}`}
                    {...props}
                >
                    <SwitchPrimitive.Thumb className={styles.thumb} />
                </SwitchPrimitive.Root>
            </div>
        );
    }

    return (
        <SwitchPrimitive.Root
            ref={ref}
            id={switchId}
            className={`${styles.root} ${className || ''}`}
            {...props}
        >
            <SwitchPrimitive.Thumb className={styles.thumb} />
        </SwitchPrimitive.Root>
    );
});

Switch.displayName = 'Switch';

export { Switch };
