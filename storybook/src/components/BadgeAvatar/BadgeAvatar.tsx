import React from 'react';
import styles from './BadgeAvatar.module.css';
import { HomeIcon, WalletIcon, ShieldIcon, SavingsIcon, FileTextIcon, MailIcon, HeadsetIcon } from '../icons/index.tsx';

export type BadgeAvatarIcon = 'home' | 'wallet' | 'shield' | 'savings' | 'file-text' | 'mail' | 'headset';

export interface BadgeAvatarProps {
  /** Which icon to display inside the badge */
  icon?: BadgeAvatarIcon;
  /** Show a red notification dot */
  dot?: boolean;
  /** Whether the badge has a white filled background */
  fill?: 'yes' | 'no';
}

const ICON_MAP: Record<BadgeAvatarIcon, React.ComponentType<{ size?: number; color?: string }>> = {
  home:        HomeIcon,
  wallet:      WalletIcon,
  shield:      ShieldIcon,
  savings:     SavingsIcon,
  'file-text': FileTextIcon,
  mail:        MailIcon,
  headset:     HeadsetIcon,
};

export function BadgeAvatar({ icon = 'home', dot = false, fill = 'yes' }: BadgeAvatarProps) {
  const Icon = ICON_MAP[icon];
  return (
    <div className={`${styles.container} ${fill === 'yes' ? styles.filled : styles.empty}`}>
      <Icon size={18} color="#171717" />
      {dot && <span className={styles.dot} aria-hidden="true" />}
    </div>
  );
}
