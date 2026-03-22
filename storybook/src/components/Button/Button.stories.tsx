import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button.tsx';
import { WalletIcon } from '../icons/index.tsx';

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    state: {
      control: 'select',
      options: ['idle', 'hover', 'pressed', 'focus', 'disabled'],
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle:     Story = { args: { label: 'Get Started', state: 'idle' } };
export const Hover:    Story = { args: { label: 'Get Started', state: 'hover' } };
export const Pressed:  Story = { args: { label: 'Get Started', state: 'pressed' } };
export const Focus:    Story = { args: { label: 'Get Started', state: 'focus' } };
export const Disabled: Story = { args: { label: 'Get Started', state: 'disabled' } };
export const WithLeftIcon: Story = {
  args: {
    label: 'Wallet',
    state: 'idle',
    leftIcon: <WalletIcon size={18} color="#ffffff" />,
  },
};
export const WithBothIcons: Story = {
  args: {
    label: 'Review',
    state: 'idle',
    leftIcon: <WalletIcon size={18} color="#ffffff" />,
    rightIcon: <WalletIcon size={18} color="#ffffff" />,
  },
};
