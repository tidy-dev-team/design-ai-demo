import React from 'react';
import styles from './SummaryItem.module.css';

export interface SummaryItemProps {
  title?: string;
  kpi?: string;
  description?: string;
  showDescription?: boolean;
}

export function SummaryItem({
  title = 'Last Deposit',
  kpi = '$4,200',
  description = 'November 2024',
  showDescription = true,
}: SummaryItemProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.titleArea}>
        <span className={styles.title}>{title}</span>
      </div>
      <div className={styles.kpiArea}>
        <span className={styles.kpiValue}>{kpi}</span>
        {showDescription && <span className={styles.kpiSub}>{description}</span>}
      </div>
    </div>
  );
}
