import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CategoryIcon } from './CategoryIcon.tsx';

const meta = {
  title: 'Components/CategoryIcon',
  component: CategoryIcon,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ display: 'flex', gap: 12 }}><Story /></div>],
} satisfies Meta<typeof CategoryIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Wallet:   Story = { args: { icon: 'wallet' } };
export const Home:     Story = { args: { icon: 'home' } };
export const Shield:   Story = { args: { icon: 'shield' } };
export const Savings:  Story = { args: { icon: 'savings' } };
export const FileText: Story = { args: { icon: 'file-text' } };
export const Mail:     Story = { args: { icon: 'mail' } };
export const Headset:  Story = { args: { icon: 'headset' } };
