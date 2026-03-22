import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { InsightBanner } from './InsightBanner.tsx';

const meta = {
  title: 'Components/InsightBanner',
  component: InsightBanner,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: 500 }}><Story /></div>],
} satisfies Meta<typeof InsightBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: 'Your management fees are 0.8% above market average. You could save up to $4,200 per year',
    actionLabel: 'Review',
  },
};

export const ShortText: Story = {
  args: {
    text: 'Your portfolio is well diversified across 5 asset classes.',
    actionLabel: 'View',
  },
};
