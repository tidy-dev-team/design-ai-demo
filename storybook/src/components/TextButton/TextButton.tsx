import React from 'react';
import styles from './TextButton.module.css';
import { ChevronIcon } from '../icons/index.tsx';

export type TextButtonState = 'idle' | 'hover' | 'pressed' | 'focus' | 'disabled';

export interface TextButtonProps {
  label?: string;
  state?: TextButtonState;
  showChevron?: boolean;
  onClick?: () => void;
}

export function TextButton({ label = 'Button', state = 'idle', showChevron = true, onClick }: TextButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.btn} ${styles[state]}`}
      disabled={state === 'disabled'}
      onClick={onClick}
    >
      <span className={styles.label}>{label}</span>
      {showChevron && <ChevronIcon size={14} color={state === 'pressed' ? '#171717' : '#636363'} direction="right" />}
    </button>
  );
}
