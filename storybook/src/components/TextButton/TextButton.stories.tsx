import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextButton } from './TextButton.tsx';

const meta = {
  title: 'Components/TextButton',
  component: TextButton,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  argTypes: {
    state: {
      control: 'select',
      options: ['idle', 'hover', 'pressed', 'focus', 'disabled'],
    },
  },
} satisfies Meta<typeof TextButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle:        Story = { args: { label: 'View Full Portfolio', state: 'idle' } };
export const Hover:       Story = { args: { label: 'View Full Portfolio', state: 'hover' } };
export const Pressed:     Story = { args: { label: 'View Full Portfolio', state: 'pressed' } };
export const Focus:       Story = { args: { label: 'View Full Portfolio', state: 'focus' } };
export const Disabled:    Story = { args: { label: 'View Full Portfolio', state: 'disabled' } };
export const NoChevron:   Story = { args: { label: 'Details', showChevron: false } };
