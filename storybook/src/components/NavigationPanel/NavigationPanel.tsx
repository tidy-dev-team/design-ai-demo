import React, { useState } from 'react';
import styles from './NavigationPanel.module.css';
import { ListItem } from '../ListItem/ListItem.tsx';
import { AvatarUser } from '../AvatarUser/AvatarUser.tsx';
import { Divider } from '../Divider/Divider.tsx';
import type { BadgeAvatarIcon } from '../BadgeAvatar/BadgeAvatar.tsx';

export interface NavItem {
  id: string;
  label: string;
  icon: BadgeAvatarIcon;
  showChevron?: boolean;
  badgeCount?: number;
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',  label: 'Dashboard',  icon: 'home' },
  { id: 'pension',    label: 'Pension',     icon: 'wallet',      showChevron: true },
  { id: 'insurance',  label: 'Insurance',   icon: 'shield',      showChevron: true },
  { id: 'savings',    label: 'Savings',     icon: 'savings',     showChevron: true },
  { id: 'documents',  label: 'Documents',   icon: 'file-text' },
  { id: 'inbox',      label: 'Inbox',       icon: 'mail',        badgeCount: 3 },
  { id: 'contact',    label: 'Contact',     icon: 'headset' },
];

export interface NavigationPanelProps {
  items?: NavItem[];
  activeId?: string;
  defaultActiveId?: string;
  onNavigate?: (id: string) => void;
  userName?: string;
  userPlan?: string;
}

export function NavigationPanel({
  items = DEFAULT_NAV_ITEMS,
  activeId,
  defaultActiveId = 'dashboard',
  onNavigate,
  userName = 'David',
  userPlan = 'Premium Plan',
}: NavigationPanelProps) {
  const [internalActive, setInternalActive] = useState(defaultActiveId);
  const controlled = activeId !== undefined;
  const currentActive = controlled ? activeId : internalActive;

  function handleClick(id: string) {
    if (!controlled) setInternalActive(id);
    onNavigate?.(id);
  }

  return (
    <nav className={styles.panel} aria-label="Main navigation">
      {/* Account section */}
      <div className={styles.account}>
        <div className={styles.accountWrapper}>
          <AvatarUser name={userName} active member="1" />
          <span className={styles.plan}>{userPlan}</span>
        </div>
      </div>

      <Divider />

      {/* Nav list */}
      <ul className={styles.list} role="list">
        {items.map((item) => (
          <li key={item.id} role="listitem">
            <ListItem
              text={item.label}
              icon={item.icon}
              state={currentActive === item.id ? 'selected' : 'idle'}
              showChevron={item.showChevron}
              chevronDirection="down"
              badgeCount={item.badgeCount}
              onClick={() => handleClick(item.id)}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}
