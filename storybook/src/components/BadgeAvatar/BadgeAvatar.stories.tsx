import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { BadgeAvatar } from './BadgeAvatar.tsx';

const meta = {
  title: 'Components/BadgeAvatar',
  component: BadgeAvatar,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ display: 'flex', gap: 12 }}><Story /></div>],
} satisfies Meta<typeof BadgeAvatar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const HomeIcon:     Story = { args: { icon: 'home',      fill: 'yes' } };
export const WalletIcon:   Story = { args: { icon: 'wallet',    fill: 'yes' } };
export const ShieldIcon:   Story = { args: { icon: 'shield',    fill: 'yes' } };
export const MailWithDot:  Story = { args: { icon: 'mail',      fill: 'yes', dot: true } };
export const EmptyFill:    Story = { args: { icon: 'home',      fill: 'no'  } };
