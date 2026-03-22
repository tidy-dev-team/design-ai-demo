import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SummaryItem } from './SummaryItem.tsx';

const meta = {
  title: 'Components/SummaryItem',
  component: SummaryItem,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: 349 }}><Story /></div>],
} satisfies Meta<typeof SummaryItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LastDeposit:    Story = { args: { title: 'Last Deposit',  kpi: '$4,200',  description: 'November 2024' } };
export const MonthlyReturn:  Story = { args: { title: 'Monthly Return', kpi: '+$340',   description: 'October 2024' } };
export const NoDescription:  Story = { args: { title: 'Total Balance', kpi: '$84,200', showDescription: false } };
