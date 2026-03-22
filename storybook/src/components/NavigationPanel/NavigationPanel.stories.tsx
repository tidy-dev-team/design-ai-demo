import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { NavigationPanel } from './NavigationPanel.tsx';

const meta = {
  title: 'Components/NavigationPanel',
  component: NavigationPanel,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ height: 700, backgroundColor: '#f8f8f6', borderRadius: 16, overflow: 'hidden' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NavigationPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    userName: 'David',
    userPlan: 'Premium Plan',
    defaultActiveId: 'dashboard',
  },
};

export const PensionActive: Story = {
  args: {
    userName: 'David',
    userPlan: 'Premium Plan',
    defaultActiveId: 'pension',
  },
};

export const InsuranceActive: Story = {
  args: {
    userName: 'Anna',
    userPlan: 'Standard Plan',
    defaultActiveId: 'insurance',
  },
};
