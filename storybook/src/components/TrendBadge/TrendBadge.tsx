import React from 'react';
import styles from './TrendBadge.module.css';

export interface TrendBadgeProps {
  value: string;
  /** Trend direction: positive shows green, negative shows red */
  direction?: 'positive' | 'negative';
}

export function TrendBadge({ value, direction = 'positive' }: TrendBadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[direction]}`}>
      {value}
    </span>
  );
}
