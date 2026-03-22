import React from 'react';
import styles from './ListItem.module.css';
import { BadgeAvatar } from '../BadgeAvatar/BadgeAvatar.tsx';
import { BadgeNum } from '../BadgeNum/BadgeNum.tsx';
import { ChevronIcon } from '../icons/index.tsx';
import type { BadgeAvatarIcon } from '../BadgeAvatar/BadgeAvatar.tsx';
import type { ChevronDirection } from '../icons/index.tsx';

export type ListItemState = 'idle' | 'hover' | 'selected';

export interface ListItemProps {
  text?: string;
  icon?: BadgeAvatarIcon;
  state?: ListItemState;
  showChevron?: boolean;
  chevronDirection?: ChevronDirection;
  badgeCount?: number;
  onClick?: () => void;
}

export function ListItem({
  text = 'List item',
  icon = 'home',
  state = 'idle',
  showChevron = false,
  chevronDirection = 'right',
  badgeCount,
  onClick,
}: ListItemProps) {
  return (
    <button
      type="button"
      className={`${styles.item} ${styles[state]}`}
      onClick={onClick}
      aria-current={state === 'selected' ? 'page' : undefined}
    >
      <BadgeAvatar icon={icon} fill={state === 'selected' ? 'yes' : 'no'} />
      <span className={styles.labelGroup}>
        <span className={styles.label}>{text}</span>
        {badgeCount != null && badgeCount > 0 && <BadgeNum count={badgeCount} />}
      </span>
      {showChevron && <ChevronIcon size={16} color="#636363" direction={chevronDirection} />}
    </button>
  );
}
