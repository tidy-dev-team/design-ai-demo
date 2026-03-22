import React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { BadgeNum } from "./components/BadgeNum/BadgeNum.tsx";
import { TrendBadge } from "./components/TrendBadge/TrendBadge.tsx";
import { BadgeAvatar } from "./components/BadgeAvatar/BadgeAvatar.tsx";
import { Tag } from "./components/Tag/Tag.tsx";
import { Button } from "./components/Button/Button.tsx";
import { TextButton } from "./components/TextButton/TextButton.tsx";
import { SearchBar } from "./components/SearchBar/SearchBar.tsx";
import { InsightBanner } from "./components/InsightBanner/InsightBanner.tsx";
import { CardKpi } from "./components/CardKpi/CardKpi.tsx";
import { InsuranceCard } from "./components/InsuranceCard/InsuranceCard.tsx";
import { CardInsuranceCoverage } from "./components/CardInsuranceCoverage/CardInsuranceCoverage.tsx";
import { SideBanner } from "./components/SideBanner/SideBanner.tsx";
import { NavigationPanel } from "./components/NavigationPanel/NavigationPanel.tsx";
import {
  WalletIcon,
  ShieldIcon,
  SavingsIcon,
  HomeIcon,
  MailIcon,
  HeadsetIcon,
} from "./components/icons/index.tsx";

const meta = {
  title: "Showcase",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const COVERAGE_ITEMS = [
  {
    id: "1",
    title: "Life",
    icon: "shield" as const,
    provider: "AXA Group",
    coverage: "$500,000",
    monthlyPremium: "$120",
  },
  {
    id: "2",
    title: "Home",
    icon: "home" as const,
    provider: "Zurich",
    coverage: "$250,000",
    monthlyPremium: "$85",
  },
  {
    id: "3",
    title: "Health",
    icon: "headset" as const,
    provider: "Allianz",
    coverage: "$100,000",
    monthlyPremium: "$135",
  },
];

/* ── inline chart svg ─────────────────────────────────────────────────────── */

const BarChart = () => {
  const bars = [
    { month: "Feb", value: 83 },
    { month: "Mar", value: 110 },
    { month: "Apr", value: 98 },
    { month: "May", value: 130 },
    { month: "Jun", value: 118 },
    { month: "Jul", value: 150 },
  ];
  const maxVal = 160;
  const chartH = 200;
  const barW = 22;
  const gap = 16;
  const totalW = bars.length * (barW + gap) - gap;
  return (
    <svg
      viewBox={`0 0 ${totalW} ${chartH + 24}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      {bars.map((b, i) => {
        const barH = (b.value / maxVal) * chartH;
        const x = i * (barW + gap);
        const y = chartH - barH;
        const isLast = i === bars.length - 1;
        return (
          <g key={b.month}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx={5}
              fill={isLast ? "#007a55" : "#e8e8e8"}
            />
            <text
              x={x + barW / 2}
              y={chartH + 16}
              textAnchor="middle"
              fontSize="7"
              fill="#636363"
              fontFamily="Inter, system-ui, sans-serif"
            >
              {b.month}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const AreaChart = () => {
  const points = [
    { x: 0, y: 220 },
    { x: 37, y: 190 },
    { x: 74, y: 210 },
    { x: 111, y: 160 },
    { x: 148, y: 175 },
    { x: 185, y: 120 },
    { x: 222, y: 90 },
    { x: 259, y: 100 },
    { x: 296, y: 55 },
    { x: 333, y: 30 },
  ];
  const lineD = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
    .join(" ");
  const areaD = `${lineD} L333,290 L0,290 Z`;
  return (
    <svg
      viewBox="0 0 333 290"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#007a55" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#007a55" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[60, 110, 160, 210, 260].map((y) => (
        <line
          key={y}
          x1="0"
          y1={y}
          x2="333"
          y2={y}
          stroke="#F0F0EC"
          strokeWidth="1"
        />
      ))}
      <path d={areaD} fill="url(#areaGrad)" />
      <path
        d={lineD}
        stroke="#007a55"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx="333" cy="30" r="4" fill="#007a55" />
      <circle cx="333" cy="30" r="7" fill="#007a55" fillOpacity="0.15" />
    </svg>
  );
};

/* ── story ───────────────────────────────────────────────────────────────── */

export const Dashboard: Story = {
  name: "All Components",
  render: () => (
    <div
      style={{
        background: "#ffffff",
        minHeight: "100vh",
        padding: 40,
        boxSizing: "border-box",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      {/* ── Two-column main grid ──────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "438px 1fr",
          gap: 40,
          alignItems: "flex-start",
        }}
      >
        {/* ════════════════════════════════════════════════════════════ */}
        {/* LEFT COLUMN                                                 */}
        {/* ════════════════════════════════════════════════════════════ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>

          {/* 1. KPI Card — Pension Portfolio */}
          <CardKpi
            title="Pension Portfolio"
            icon="savings"
            kpiValue="$847,320"
            kpiLabel="Total Balance"
            trend="12.4%"
            trendDirection="positive"
            ctaLabel="View Full Portfolio"
          >
            <AreaChart />
          </CardKpi>

          {/* 2. Insight Banner + badge-avatar column */}
          <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <InsightBanner
              text="Your management fees are 0.8% above market average. You could save up to $4,200 per year"
              actionLabel="Learn more"
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                flexShrink: 0,
              }}
            >
              <BadgeAvatar icon="wallet" fill="yes" />
              <BadgeAvatar icon="shield" fill="yes" />
              <BadgeAvatar icon="mail" fill="no" dot />
              <BadgeAvatar icon="headset" fill="no" />
            </div>
          </div>

          {/* 3. Side Banner + mini-component panel */}
          <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
            <SideBanner
              imageUrl="/side-banner-bg.png"
              tag="2025 Wrapped"
              label="Total Contributions"
              kpi="$56,200"
              badge="🏆 Top Achiever"
              description="Maximum pension contributions reached"
            />
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                flexShrink: 0,
              }}
            >
              {/* badges row */}
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <BadgeNum count={3} />
                <BadgeNum count={12} />
                <TrendBadge value="+5.2%" direction="positive" />
              </div>
              <Tag label="Tag" showChevron />
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <BadgeAvatar icon="savings" fill="yes" dot />
              </div>
              <Tag label="Very Important" />
              <Button label="Button" state="idle" />
              <Button label="With icon" state="idle" />
            </div>
          </div>

          {/* 4. Bottom search bar */}
          <SearchBar placeholder="Ask me anything..." />

        </div>

        {/* ════════════════════════════════════════════════════════════ */}
        {/* RIGHT COLUMN                                                */}
        {/* ════════════════════════════════════════════════════════════ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>

          {/* 1. Insurance Coverage card — full width of right col */}
          <CardInsuranceCoverage items={COVERAGE_ITEMS} />

          {/* 2. Category filter tags row (Frame 2018782647) */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Tag label="All categories" showChevron />
            <Tag
              label="Pension"
              icon={<WalletIcon size={16} color="#171717" />}
              showChevron
            />
            <Tag
              label="Insurance"
              icon={<ShieldIcon size={16} color="#171717" />}
              showChevron
            />
            <Tag
              label="Savings"
              icon={<SavingsIcon size={16} color="#171717" />}
            />
          </div>

          {/* 3. Navigation Panel + right sub-column */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "311px 1fr",
              gap: 40,
              alignItems: "flex-start",
            }}
          >
            {/* Navigation Panel + buttons below */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  borderRadius: 16,
                  overflow: "hidden",
                  border: "1px solid #f0f0ec",
                }}
              >
                <NavigationPanel
                  defaultActiveId="pension"
                  userName="David"
                  userPlan="Premium Plan"
                />
              </div>
              <Button label="Get started" state="idle" />
              <Button label="Hover" state="hover" />
              <Button label="Pressed" state="pressed" />
              <Button label="Disabled" state="disabled" />
            </div>

            {/* Right sub-column */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: 24 }}
            >
              {/* Search bar */}
              <SearchBar placeholder="Ask me anything..." />

              {/* Filter tags (Frame 2018782648) */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Tag label="All" showChevron />
                <Tag
                  label="Life"
                  icon={<ShieldIcon size={16} color="#171717" />}
                />
                <Tag
                  label="Home"
                  icon={<HomeIcon size={16} color="#171717" />}
                />
                <Tag
                  label="Health"
                  icon={<HeadsetIcon size={16} color="#171717" />}
                />
              </div>

              {/* Two standalone Insurance Plan cards */}
              <div style={{ display: "flex", gap: 8 }}>
                <InsuranceCard
                  title="Life Insurance"
                  icon="shield"
                  provider="AXA Group"
                  coverage="$500,000"
                  monthlyPremium="$120"
                />
                <InsuranceCard
                  title="Home Insurance"
                  icon="home"
                  provider="Zurich"
                  coverage="$250,000"
                  monthlyPremium="$85"
                />
              </div>

              {/* Second KPI Card + bottom row side by side */}
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                <div style={{ flexShrink: 0 }}>
                  <CardKpi
                    title="Example Card"
                    icon="savings"
                    kpiValue="$920,567"
                    kpiLabel="Total Balance"
                    trend="8.2%"
                    trendDirection="positive"
                    ctaLabel="View Account"
                  >
                    <BarChart />
                  </CardKpi>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
                  <Button label="Button" state="idle" />
                  <Button label="With icon" state="idle" />
                  <TextButton label="View details" showChevron />
                  <TextButton label="See all" />
                  <BadgeNum count={3} />
                  <TrendBadge value="+12.4%" direction="positive" />
                  <BadgeAvatar icon="mail" fill="no" dot />
                  <Tag label="Tag" showChevron />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  ),
};
