import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvatarMember } from './AvatarMember.tsx';

const meta = {
  title: 'Components/AvatarMember',
  component: AvatarMember,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ display: 'flex', gap: 8 }}><Story /></div>],
} satisfies Meta<typeof AvatarMember>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Member1: Story = { args: { member: '1' } };
export const Member2: Story = { args: { member: '2' } };
export const Member3: Story = { args: { member: '3' } };
export const Member4: Story = { args: { member: '4' } };
