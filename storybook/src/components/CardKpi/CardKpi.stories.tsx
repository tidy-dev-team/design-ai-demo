import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CardKpi } from './CardKpi.tsx';

const meta = {
  title: 'Components/CardKpi',
  component: CardKpi,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof CardKpi>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Pension: Story = {
  args: {
    title: 'Pension Portfolio',
    icon: 'wallet',
    kpiValue: '$847,320',
    kpiLabel: 'Total Balance',
    trend: '12.4%',
    trendDirection: 'positive',
    ctaLabel: 'View Full Portfolio',
  },
};

export const Insurance: Story = {
  args: {
    title: 'Insurance Coverage',
    icon: 'shield',
    kpiValue: '$1,200,000',
    kpiLabel: 'Total coverage',
    trend: '5.2%',
    trendDirection: 'positive',
    ctaLabel: 'View Details',
  },
};

export const Savings: Story = {
  args: {
    title: 'Savings',
    icon: 'savings',
    kpiValue: '$32,500',
    kpiLabel: 'Total savings',
    trend: '1.8%',
    trendDirection: 'negative',
    ctaLabel: 'View Account',
  },
};

// ── Area chart ─────────────────────────────────────────────────────────────

const AreaChart = () => {
  const points = [
    { x: 0,   y: 220 },
    { x: 37,  y: 190 },
    { x: 74,  y: 210 },
    { x: 111, y: 160 },
    { x: 148, y: 175 },
    { x: 185, y: 120 },
    { x: 222, y: 90  },
    { x: 259, y: 100 },
    { x: 296, y: 55  },
    { x: 333, y: 30  },
  ];

  const lineD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`)
    .join(' ');

  const areaD = `${lineD} L333,290 L0,290 Z`;

  return (
    <svg
      viewBox="0 0 333 290"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: '100%', height: '100%', display: 'block' }}
    >
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#007a55" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#007a55" stopOpacity="0" />
        </linearGradient>
      </defs>

      {[60, 110, 160, 210, 260].map((y) => (
        <line key={y} x1="0" y1={y} x2="333" y2={y} stroke="#F0F0EC" strokeWidth="1" />
      ))}

      <path d={areaD} fill="url(#areaGrad)" />
      <path d={lineD} stroke="#007a55" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

      <circle cx="333" cy="30" r="4" fill="#007a55" />
      <circle cx="333" cy="30" r="7" fill="#007a55" fillOpacity="0.15" />
    </svg>
  );
};

export const WithChart: Story = {
  args: {
    title: 'Pension Portfolio',
    icon: 'wallet',
    kpiValue: '$847,320',
    kpiLabel: 'Total Balance',
    trend: '12.4%',
    trendDirection: 'positive',
    ctaLabel: 'View Full Portfolio',
  },
  render: (args) => (
    <CardKpi {...args}>
      <AreaChart />
    </CardKpi>
  ),
};

// ── Fund allocation bar chart ──────────────────────────────────────────────

const FUNDS = [
  { label: 'Training Fund',   amount: '$124,850', pct: '49.4%', color: '#B4B0E8', barHeight: 200 },
  { label: 'Investment Fund', amount: '$82,547',  pct: '32.7%', color: '#B5C4AA', barHeight: 165 },
  { label: 'Money Market',    amount: '$45,230',  pct: '17.9%', color: '#F0C842', barHeight: 125 },
];

const FundBarChart = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>

    {/* Bars — fixed 210px container so bar % heights resolve reliably */}
    <div style={{ height: 210, display: 'flex', alignItems: 'flex-end', gap: 12 }}>
      {FUNDS.map((f) => (
        <div
          key={f.label}
          style={{
            flex: 1,
            height: f.barHeight,
            backgroundColor: f.color,
            borderRadius: 16,
          }}
        />
      ))}
    </div>

    {/* 3-column legend */}
    <div style={{ display: 'flex', gap: 12 }}>
      {FUNDS.map((f) => (
        <div key={f.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Dot + fund name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              backgroundColor: f.color, flexShrink: 0,
            }} />
            <span style={{
              fontFamily: 'Inter, sans-serif', fontSize: 13,
              color: '#636363', lineHeight: 1.2,
            }}>
              {f.label}
            </span>
          </div>
          {/* Amount + percentage */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
            <span style={{
              fontFamily: 'Inter, sans-serif', fontSize: 20,
              fontWeight: 500, color: '#171717', letterSpacing: '-0.03em',
            }}>
              {f.amount}
            </span>
            <span style={{
              fontFamily: 'Inter, sans-serif', fontSize: 13, color: '#636363',
            }}>
              {f.pct}
            </span>
          </div>
        </div>
      ))}
    </div>

  </div>
);

export const WithBarChart: Story = {
  args: {
    title: 'Card Title',
    icon: 'wallet',
    kpiValue: '$123,456',
    kpiLabel: 'KPI Title',
    trend: '12.4%',
    trendDirection: 'positive',
    ctaLabel: 'View Full Portfolio',
  },
  render: (args) => (
    <CardKpi {...args}>
      <FundBarChart />
    </CardKpi>
  ),
};
