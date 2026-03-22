import React from 'react';
import styles from './CategoryIcon.module.css';
import { WalletIcon, HomeIcon, ShieldIcon, SavingsIcon, FileTextIcon, MailIcon, HeadsetIcon } from '../icons/index.tsx';

export type CategoryIconType = 'wallet' | 'home' | 'shield' | 'savings' | 'file-text' | 'mail' | 'headset';

export interface CategoryIconProps {
  icon?: CategoryIconType;
  size?: number;
  /** Custom icon element override */
  children?: React.ReactNode;
}

const ICON_MAP: Record<CategoryIconType, React.ComponentType<{ size?: number; color?: string }>> = {
  wallet:    WalletIcon,
  home:      HomeIcon,
  shield:    ShieldIcon,
  savings:   SavingsIcon,
  'file-text': FileTextIcon,
  mail:      MailIcon,
  headset:   HeadsetIcon,
};

export function CategoryIcon({ icon = 'wallet', size = 32, children }: CategoryIconProps) {
  const Icon = ICON_MAP[icon];
  return (
    <div className={styles.container} style={{ width: size, height: size }}>
      {children ?? <Icon size={Math.round(size * 0.5625)} color="#38946a" />}
    </div>
  );
}
