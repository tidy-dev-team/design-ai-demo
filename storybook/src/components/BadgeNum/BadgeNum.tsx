import React from 'react';
import styles from './BadgeNum.module.css';

export interface BadgeNumProps {
  count: number | string;
}

export function BadgeNum({ count }: BadgeNumProps) {
  return (
    <span className={styles.badge} aria-label={`${count} notifications`}>
      {count}
    </span>
  );
}
