import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Dashboard2 } from './Dashboard2.tsx';

const meta = {
  title: 'UI Screens/Dashboard-2',
  component: Dashboard2,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof Dashboard2>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    userName: 'David',
    userPlan: 'Premium Plan',
    activeNavId: 'dashboard',
  },
};
