import React from 'react';
import styles from './SideBanner.module.css';
import { ArrowUpRightIcon } from '../icons/index.tsx';

export interface SideBannerProps {
  /** Hide the background photo and show the warm gradient fallback instead */
  hideImage?: boolean;
  /** Frosted glass pill shown top-left (e.g. "2025 Wrapped") */
  tag?: string;
  /** Called when the top-right arrow button is clicked */
  onLinkClick?: () => void;
  /** Small label above the KPI value (e.g. "Total Contributions") */
  label?: string;
  /** Large KPI value (e.g. "$56,200") */
  kpi?: string;
  /** Cream pill badge shown below the KPI (e.g. "🏆 Top Achievement") */
  badge?: string;
  /** Description line below the badge */
  description?: string;
}

export function SideBanner({
  hideImage = false,
  tag,
  onLinkClick,
  label = 'Total Contributions',
  kpi = '$56,200',
  badge,
  description = 'Maximum pension contributions reached',
}: SideBannerProps) {
  return (
    <div className={`${styles.card} ${hideImage ? styles.noImage : ''}`}>
      <div className={styles.inner}>
        {/* Content area — SPACE_BETWEEN: tag row at top, KPI block at bottom */}
        <div className={styles.content}>
          <div className={styles.topRow}>
            {tag && <span className={styles.tag}>{tag}</span>}
            <button
              type="button"
              className={styles.arrowBtn}
              onClick={onLinkClick}
              aria-label="Open link"
            >
              <ArrowUpRightIcon size={14} color="#ffffff" />
            </button>
          </div>

          <div className={styles.kpiBlock}>
            <p className={styles.kpiLabel}>{label}</p>
            <p className={styles.kpiValue}>{kpi}</p>
          </div>
        </div>

        {/* Text box — badge pill + description */}
        <div className={styles.textBox}>
          {badge && <span className={styles.badge}>{badge}</span>}
          {description && <p className={styles.description}>{description}</p>}
        </div>
      </div>
    </div>
  );
}
