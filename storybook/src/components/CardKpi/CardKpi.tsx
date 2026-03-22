import React from 'react';
import styles from './CardKpi.module.css';
import { TextButton } from '../TextButton/TextButton.tsx';
import { TrendBadge } from '../TrendBadge/TrendBadge.tsx';
import { CategoryIcon } from '../CategoryIcon/CategoryIcon.tsx';
import type { CategoryIconType } from '../CategoryIcon/CategoryIcon.tsx';

export interface CardKpiProps {
  title?: string;
  icon?: CategoryIconType;
  kpiValue?: string;
  kpiLabel?: string;
  trend?: string;
  trendDirection?: 'positive' | 'negative';
  ctaLabel?: string;
  onCtaClick?: () => void;
  /** Slot for chart or additional content */
  children?: React.ReactNode;
}

export function CardKpi({
  title = 'Pension Portfolio',
  icon = 'wallet',
  kpiValue = '$847,320',
  kpiLabel = 'Total Balance',
  trend = '12.4%',
  trendDirection = 'positive',
  ctaLabel = 'View Full Portfolio',
  onCtaClick,
  children,
}: CardKpiProps) {
  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleRow}>
          <CategoryIcon icon={icon} />
          <span className={styles.title}>{title}</span>
        </div>
        <TextButton label={ctaLabel} onClick={onCtaClick} />
      </div>

      {/* KPI content */}
      <div className={styles.contentWrapper}>
        <div className={styles.kpiBlock}>
          <span className={styles.kpiLabel}>{kpiLabel}</span>
          <div className={styles.kpiRow}>
            <span className={styles.kpiValue}>{kpiValue}</span>
            {trend && (
              <TrendBadge
                value={`${trendDirection === 'positive' ? '+' : '−'}${trend.replace(/^[+\-−]/, '')}`}
                direction={trendDirection}
              />
            )}
          </div>
        </div>

        {/* Chart slot */}
        {children ? (
          <div className={styles.chartSlot}>{children}</div>
        ) : (
          <div className={styles.chartPlaceholder} aria-hidden="true" />
        )}
      </div>
    </div>
  );
}
