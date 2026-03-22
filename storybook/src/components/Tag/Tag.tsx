import React from 'react';
import styles from './Tag.module.css';
import { SwitchIcon, ChevronIcon } from '../icons/index.tsx';

export interface TagProps {
  label: string;
  /** Show trailing chevron arrow */
  showChevron?: boolean;
  /** Custom icon element */
  icon?: React.ReactNode;
  onClick?: () => void;
}

export function Tag({ label, showChevron = false, icon, onClick }: TagProps) {
  return (
    <button className={styles.tag} onClick={onClick} type="button">
      <span className={styles.icon}>
        {icon ?? <SwitchIcon size={16} color="#171717" />}
      </span>
      <span className={styles.label}>{label}</span>
      {showChevron && <ChevronIcon size={16} color="#636363" direction="down" />}
    </button>
  );
}
