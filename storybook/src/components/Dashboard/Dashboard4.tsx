import React from 'react';
import styles from './Dashboard4.module.css';
import { NavigationPanel } from '../NavigationPanel/NavigationPanel.tsx';
import { SearchBar } from '../SearchBar/SearchBar.tsx';
import { Tag } from '../Tag/Tag.tsx';
import { CardKpi } from '../CardKpi/CardKpi.tsx';
import { SummaryItem } from '../SummaryItem/SummaryItem.tsx';
import { InsightBanner } from '../InsightBanner/InsightBanner.tsx';
import { CardInsuranceCoverage } from '../CardInsuranceCoverage/CardInsuranceCoverage.tsx';
import { SideBanner } from '../SideBanner/SideBanner.tsx';

// ── Left card: pension summary items + insight banner ──────────────────────

function PensionCardContent() {
  return (
    <div className={styles.pensionContent}>
      <div className={styles.summaryList}>
        <SummaryItem title="Last Deposit"  kpi="$4,200"   description="November 2024" />
        <SummaryItem title="Est. Monthly"  kpi="$8,450"   showDescription={false} />
        <SummaryItem title="Est. Lump Sum" kpi="$523,000" showDescription={false} />
      </div>
      <InsightBanner
        text="Your management fees are 0.8% above market average. You could save up to $4,200 per year"
        actionLabel="Review"
      />
    </div>
  );
}

// ── Right card: allocation bar chart + 3-column legend ─────────────────────

const FUNDS = [
  { label: 'Training Fund',   amount: '$124,850', pct: '49.4%', color: '#B4B0E8', barHeight: 200 },
  { label: 'Investment Fund', amount: '$82,547',  pct: '32.7%', color: '#B5C4AA', barHeight: 165 },
  { label: 'Money Market',    amount: '$45,230',  pct: '17.9%', color: '#F0C842', barHeight: 125 },
];

function PortfolioCardContent() {
  return (
    <div className={styles.portfolioContent}>
      <div className={styles.barChart}>
        {FUNDS.map((f) => (
          <div
            key={f.label}
            className={styles.bar}
            style={{ height: f.barHeight, backgroundColor: f.color }}
          />
        ))}
      </div>
      <div className={styles.fundList}>
        {FUNDS.map((f) => (
          <div key={f.label} className={styles.fundItem}>
            <div className={styles.fundName}>
              <span className={styles.fundDot} style={{ backgroundColor: f.color }} />
              <span className={styles.fundLabel}>{f.label}</span>
            </div>
            <div className={styles.fundValues}>
              <span className={styles.fundAmount}>{f.amount}</span>
              <span className={styles.fundPct}>{f.pct}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Suggestion tags ────────────────────────────────────────────────────────

const SUGGESTION_TAGS = [
  'Change pension plans',
  'Savings calculator',
  'Quick actions',
  'Common questions',
] as const;

// ── Component ──────────────────────────────────────────────────────────────

export interface Dashboard4Props {
  userName?:     string;
  userFullName?: string;
  userPlan?:     string;
  activeNavId?:  string;
}

export function Dashboard4({
  userName     = 'David',
  userFullName = 'David Levi',
  userPlan     = 'Portfolio ID: 20144874',
  activeNavId  = 'dashboard',
}: Dashboard4Props) {
  return (
    <div className={styles.layout}>
      {/* Left navigation — sits on cream background */}
      <NavigationPanel
        userName={userFullName}
        userPlan={userPlan}
        activeId={activeNavId}
      />

      {/* Right: 24px cream gutter around the content card */}
      <main className={styles.main}>
        {/*
          Figma node 350:1142 — semi-transparent white card
          fill: rgba(255,255,255,0.5)  radius: 24px  stroke: 1.5px solid white
          Inner node 350:1144 — padding: 24px  gap: 24px
        */}
        <div className={styles.contentCard}>

          {/* Heading */}
          <h1 className={styles.heading}>Welcome back, {userName}</h1>

          {/* AI search bar — Figma: 740px wide */}
          <div className={styles.searchRow}>
            <SearchBar placeholder="Ask me anything..." />
          </div>

          {/* Suggestion tags — 8px gap */}
          <div className={styles.tags}>
            {SUGGESTION_TAGS.map((label) => (
              <Tag key={label} label={label} />
            ))}
          </div>

          {/* KPI row — 16px gap, equal-width cards */}
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
                <PensionCardContent />
              </CardKpi>
            </div>
            <div className={styles.kpiCard}>
              <CardKpi
                title="Card Title"
                icon="wallet"
                kpiLabel="KPI Title"
                kpiValue="$123,456"
                trend="12.4%"
                trendDirection="positive"
                ctaLabel="View Full Portfolio"
              >
                <PortfolioCardContent />
              </CardKpi>
            </div>
          </div>

          {/* Bottom row — 16px gap */}
          <div className={styles.bottomRow}>
            <div className={styles.coverageCard}>
              <CardInsuranceCoverage />
            </div>
            <SideBanner
              tag="2025 Wrapped"
              label="Total Contributions"
              kpi="$56,200"
              badge="🏆 Top Achievement"
              description="Maximum pension contributions reached"
            />
          </div>

        </div>
      </main>
    </div>
  );
}
