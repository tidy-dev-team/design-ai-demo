import React from 'react';
import styles from './ButtonIcon.module.css';

export type ButtonIconState = 'idle' | 'hover' | 'pressed' | 'focus' | 'disabled';

export interface ButtonIconProps {
  icon?: React.ReactNode;
  state?: ButtonIconState;
  onClick?: () => void;
  'aria-label'?: string;
}

export function ButtonIcon({
  icon,
  state = 'idle',
  onClick,
  'aria-label': ariaLabel = 'icon button',
}: ButtonIconProps) {
  return (
    <button
      type="button"
      className={`${styles.btn} ${styles[state]}`}
      disabled={state === 'disabled'}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {icon}
    </button>
  );
}
