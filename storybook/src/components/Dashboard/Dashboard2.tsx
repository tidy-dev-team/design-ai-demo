import React from 'react';
import styles from './Dashboard2.module.css';
import { NavigationPanel } from '../NavigationPanel/NavigationPanel.tsx';
import { SearchBar } from '../SearchBar/SearchBar.tsx';
import { Tag } from '../Tag/Tag.tsx';
import { CardKpi } from '../CardKpi/CardKpi.tsx';
import { SummaryItem } from '../SummaryItem/SummaryItem.tsx';
import { InsightBanner } from '../InsightBanner/InsightBanner.tsx';
import { CardInsuranceCoverage } from '../CardInsuranceCoverage/CardInsuranceCoverage.tsx';
import { SideBanner } from '../SideBanner/SideBanner.tsx';

const SUGGESTION_TAGS = [
  'Change pension plans',
  'Savings calculator',
  'Quick actions',
  'Common questions',
] as const;

/* Figma 350-1155: soft lavender, muted sage, pale gold */
const FUND_ITEMS = [
  { label: 'Training Fund', value: '$124,850', pct: 49.4, color: '#C5B8D4' },
  { label: 'Investment Fund', value: '$82,547', pct: 32.7, color: '#A8B5A0' },
  { label: 'Money Market', value: '$45,230', pct: 17.9, color: '#E5D9B8' },
] as const;

/** Vertical bar chart + legend per Figma node 350-1155 */
function AllocationBarChart() {
  const maxPct = Math.max(...FUND_ITEMS.map((f) => f.pct));
  return (
    <div className={styles.barChart}>
      <div className={styles.barChartBars}>
        {FUND_ITEMS.map(({ label, value, pct, color }) => (
          <div key={label} className={styles.barChartBar}>
            <div className={styles.barChartBarTrack}>
              <div
                className={styles.barChartBarFill}
                style={{
                  height: `${(pct / maxPct) * 100}%`,
                  backgroundColor: color,
                }}
              />
            </div>
            <div className={styles.barChartBarLegend}>
              <div className={styles.barChartBarLegendRow}>
                <span className={styles.barChartBarDot} style={{ backgroundColor: color }} />
                <span className={styles.barChartBarLabel}>{label}</span>
              </div>
              <div className={styles.barChartBarLegendValues}>
                <span className={styles.barChartBarValue}>{value}</span>
                <span className={styles.barChartBarPct}>{pct}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export interface Dashboard2Props {
  userName?: string;
  userPlan?: string;
  activeNavId?: string;
}

export function Dashboard2({
  userName = 'David',
  userPlan = 'Premium Plan',
  activeNavId = 'dashboard',
}: Dashboard2Props) {
  return (
    <div className={styles.layout}>
      <NavigationPanel
        userName={userName}
        userPlan={userPlan}
        activeId={activeNavId}
      />

      <main className={styles.main}>
        <div className={styles.mainCard}>
          <div className={styles.container}>
            <h1 className={styles.heading}>Welcome back, {userName}</h1>

            <div className={styles.searchRow}>
              <SearchBar placeholder="Ask me anything..." />
            </div>

            <div className={styles.tags}>
              {SUGGESTION_TAGS.map((label) => (
                <Tag key={label} label={label} />
              ))}
            </div>

            <div className={styles.kpiRow}>
              <div className={styles.kpiCard}>
                <CardKpi
                title="Pension Portfolio"
                icon="wallet"
                kpiLabel="Total Balance"
                kpiValue="$922,500"
                trend="12.4%"
                trendDirection="positive"
                ctaLabel="View Full Portfolio"
                >
                  <div className={styles.pensionContent}>
                    <div className={styles.summaryList}>
                      <SummaryItem
                        title="Last Deposit"
                        kpi="$4,200"
                        description="November 2024"
                        showDescription
                      />
                      <SummaryItem
                        title="Est. Monthly"
                        kpi="$8,450"
                        showDescription={false}
                      />
                      <SummaryItem
                        title="Est. Lump Sum"
                        kpi="$523,000"
                        showDescription={false}
                      />
                    </div>
                  <InsightBanner
                    text="Your management fees are 0.8% above market average. You could save up to $4,200 per year"
                    actionLabel="Review"
                  />
                  </div>
                </CardKpi>
              </div>

              <div className={styles.kpiCard}>
                <CardKpi
                  title="Card Title"
                  icon="savings"
                  kpiLabel="KPI Title"
                  kpiValue="$123,456"
                  trend="12.4%"
                  trendDirection="positive"
                  ctaLabel="View Full Portfolio"
                >
                  <AllocationBarChart />
                </CardKpi>
              </div>
            </div>

            <div className={styles.bottomRow}>
              <div className={styles.coverageCard}>
                <CardInsuranceCoverage />
              </div>
              <div className={styles.sideBannerWrapper}>
                <SideBanner
                  imageUrl="/side-banner-bg.png"
                  tag="2025 Wrapped"
                  label="Total Contributions"
                  kpi="$56,200"
                  badge="🏆 Top Achievement"
                  description="Maximum pension contributions reached"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
