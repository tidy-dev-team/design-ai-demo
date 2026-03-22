import React from 'react';
import styles from './InsuranceCard.module.css';
import { CategoryIcon } from '../CategoryIcon/CategoryIcon.tsx';
import type { CategoryIconType } from '../CategoryIcon/CategoryIcon.tsx';

export interface InsuranceCardProps {
  title?: string;
  icon?: CategoryIconType;
  provider?: string;
  coverage?: string;
  monthlyPremium?: string;
}

function CardTag({ label }: { label: string }) {
  return <span className={styles.tag}>{label}</span>;
}

function CardKpiMini({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.kpiMini}>
      <span className={styles.kpiLabel}>{label}</span>
      <span className={styles.kpiValue}>{value}</span>
    </div>
  );
}

export function InsuranceCard({
  title = 'Life',
  icon = 'shield',
  provider = 'Harel',
  coverage = '$1,200,000',
  monthlyPremium = '$450',
}: InsuranceCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <CategoryIcon icon={icon} size={20} />
          <span className={styles.title}>{title}</span>
        </div>
        <CardTag label={provider} />
      </div>
      <div className={styles.metrics}>
        <CardKpiMini label="Coverage" value={coverage} />
        <CardKpiMini label="Monthly Premium" value={monthlyPremium} />
      </div>
    </div>
  );
}
