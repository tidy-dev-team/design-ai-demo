import React from 'react';
import styles from './Divider.module.css';

export interface DividerProps {
  className?: string;
}

export function Divider({ className }: DividerProps) {
  return (
    <div className={`${styles.wrapper} ${className ?? ''}`} role="separator" aria-orientation="horizontal">
      <hr className={styles.line} />
    </div>
  );
}
