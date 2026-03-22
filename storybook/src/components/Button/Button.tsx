import React from 'react';
import styles from './Button.module.css';

export type ButtonState = 'idle' | 'hover' | 'pressed' | 'focus' | 'disabled';

export interface ButtonProps {
  label?: string;
  state?: ButtonState;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  /** Full width */
  fullWidth?: boolean;
}

export function Button({
  label = 'Button',
  state = 'idle',
  leftIcon,
  rightIcon,
  onClick,
  type = 'button',
  fullWidth = false,
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${styles.btn} ${styles[state]} ${fullWidth ? styles.fullWidth : ''}`}
      disabled={state === 'disabled'}
      onClick={onClick}
      data-focus={state === 'focus' ? 'true' : undefined}
    >
      {leftIcon && <span className={styles.icon}>{leftIcon}</span>}
      <span className={styles.label}>{label}</span>
      {rightIcon && <span className={styles.icon}>{rightIcon}</span>}
    </button>
  );
}
