import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ButtonIcon } from './ButtonIcon.tsx';
import { WalletIcon } from '../icons/index.tsx';

const meta = {
  title: 'Components/ButtonIcon',
  component: ButtonIcon,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    state: {
      control: 'select',
      options: ['idle', 'hover', 'pressed', 'focus', 'disabled'],
    },
  },
} satisfies Meta<typeof ButtonIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

const icon = <WalletIcon size={14} color="#171717" />;

export const Idle:     Story = { args: { icon, state: 'idle',     'aria-label': 'Wallet' } };
export const Hover:    Story = { args: { icon, state: 'hover',    'aria-label': 'Wallet' } };
export const Pressed:  Story = { args: { icon, state: 'pressed',  'aria-label': 'Wallet' } };
export const Focus:    Story = { args: { icon, state: 'focus',    'aria-label': 'Wallet' } };
export const Disabled: Story = { args: { icon, state: 'disabled', 'aria-label': 'Wallet' } };
