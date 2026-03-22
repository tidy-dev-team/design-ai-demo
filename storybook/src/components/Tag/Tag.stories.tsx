import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Tag } from './Tag.tsx';

const meta = {
  title: 'Components/Tag',
  component: Tag,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><Story /></div>],
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default:      Story = { args: { label: 'Change pension plans' } };
export const WithChevron:  Story = { args: { label: 'View details', showChevron: true } };
export const ShortLabel:   Story = { args: { label: 'Insurance' } };
