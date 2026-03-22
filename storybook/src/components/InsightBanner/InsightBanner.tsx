import React from 'react';
import styles from './InsightBanner.module.css';
import { Button } from '../Button/Button.tsx';

export interface InsightBannerProps {
  text?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function InsightBanner({
  text = 'Your management fees are 0.8% above market average. You could save up to $4,200 per year',
  actionLabel = 'Review',
  onAction,
}: InsightBannerProps) {
  return (
    <div className={styles.banner} role="status" aria-live="polite">
      <p className={styles.text}>{text}</p>
      <div className={styles.action}>
        <Button label={actionLabel} onClick={onAction} />
      </div>
    </div>
  );
}
