import React from 'react';
import styles from './CardInsuranceCoverage.module.css';
import { InsuranceCard } from '../InsuranceCard/InsuranceCard.tsx';
import { TextButton } from '../TextButton/TextButton.tsx';
import { CategoryIcon } from '../CategoryIcon/CategoryIcon.tsx';
import { AvatarUser } from '../AvatarUser/AvatarUser.tsx';
import { AvatarMember } from '../AvatarMember/AvatarMember.tsx';
import type { CategoryIconType } from '../CategoryIcon/CategoryIcon.tsx';

export interface InsuranceCoverageItem {
  id: string;
  title: string;
  icon: CategoryIconType;
  provider: string;
  coverage: string;
  monthlyPremium: string;
}

const DEFAULT_ITEMS: InsuranceCoverageItem[] = [
  { id: '1', title: 'Life',       icon: 'shield',  provider: 'Harel',  coverage: '$1,200,000', monthlyPremium: '$450' },
  { id: '2', title: 'Disability', icon: 'headset', provider: 'Migdal', coverage: '$8,500/mo',  monthlyPremium: '$280' },
  { id: '3', title: 'Health',     icon: 'savings', provider: 'Clal',   coverage: '$1,500,000', monthlyPremium: '$320' },
];

export interface CardInsuranceCoverageProps {
  title?: string;
  items?: InsuranceCoverageItem[];
  onViewAll?: () => void;
}

export function CardInsuranceCoverage({
  title = 'Insurance Coverage',
  items = DEFAULT_ITEMS,
  onViewAll,
}: CardInsuranceCoverageProps) {
  return (
    <div className={styles.card}>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <CategoryIcon icon="shield" />
          <span className={styles.title}>{title}</span>
        </div>
        <div className={styles.members}>
          <AvatarUser name="David" member="1" active />
          <AvatarMember member="2" />
          <AvatarMember member="3" />
          <AvatarMember member="4" />
          <button className={styles.addBtn} type="button" aria-label="Add member">+</button>
        </div>
      </div>

      {/* Cards + CTA */}
      <div className={styles.content}>
        <div className={styles.cards}>
          {items.map((item) => (
            <InsuranceCard
              key={item.id}
              title={item.title}
              icon={item.icon}
              provider={item.provider}
              coverage={item.coverage}
              monthlyPremium={item.monthlyPremium}
            />
          ))}
        </div>
        <TextButton label="View Full Portfolio" showChevron onClick={onViewAll} />
      </div>

    </div>
  );
}
