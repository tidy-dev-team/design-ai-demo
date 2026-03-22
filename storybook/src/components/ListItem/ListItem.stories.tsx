import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ListItem } from './ListItem.tsx';

const meta = {
  title: 'Components/ListItem',
  component: ListItem,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: 280 }}><Story /></div>],
  argTypes: {
    state: { control: 'select', options: ['idle', 'hover', 'selected'] },
    icon:  { control: 'select', options: ['home', 'wallet', 'shield', 'savings', 'file-text', 'mail', 'headset'] },
  },
} satisfies Meta<typeof ListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle:         Story = { args: { text: 'Dashboard', icon: 'home',   state: 'idle' } };
export const Hover:        Story = { args: { text: 'Pension',   icon: 'wallet', state: 'hover', showChevron: true } };
export const Selected:     Story = { args: { text: 'Dashboard', icon: 'home',   state: 'selected' } };
export const WithBadge:    Story = { args: { text: 'Inbox',     icon: 'mail',   state: 'idle', badgeCount: 3 } };
export const WithChevron:  Story = { args: { text: 'Insurance', icon: 'shield', state: 'idle', showChevron: true } };
