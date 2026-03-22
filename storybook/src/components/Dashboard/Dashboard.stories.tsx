import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Dashboard } from './Dashboard.tsx';

const meta = {
  title: 'UI Screens/Dashboard',
  component: Dashboard,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
} satisfies Meta<typeof Dashboard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    userName:     'David',
    userFullName: 'David Levi',
    userPlan:     'Portfolio ID: 20144874',
    activeNavId:  'dashboard',
  },
};

export const PensionView: Story = {
  args: {
    userName:     'David',
    userFullName: 'David Levi',
    userPlan:     'Portfolio ID: 20144874',
    activeNavId:  'pension',
  },
};

export const InsuranceView: Story = {
  args: {
    userName:     'Anna',
    userFullName: 'Anna Cohen',
    userPlan:     'Portfolio ID: 30291847',
    activeNavId:  'insurance',
  },
};
