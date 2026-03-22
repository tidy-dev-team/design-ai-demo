import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { SearchBar } from './SearchBar.tsx';

const meta = {
  title: 'Components/SearchBar',
  component: SearchBar,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: 520 }}><Story /></div>],
  argTypes: {
    state: { control: 'select', options: ['idle', 'focused', 'disabled'] },
  },
} satisfies Meta<typeof SearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty:    Story = { args: { state: 'idle',     placeholder: 'Ask me anything...' } };
export const Filled:   Story = { args: { state: 'idle',     defaultValue: 'Show my pension balance' } };
export const Focused:  Story = { args: { state: 'focused',  placeholder: 'Ask me anything...' } };
export const Disabled: Story = { args: { state: 'disabled', placeholder: 'Ask me anything...' } };
