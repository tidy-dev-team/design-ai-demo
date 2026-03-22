import type { Meta, StoryObj } from '@storybook/react-vite';
import { TrendBadge } from './TrendBadge.tsx';

const meta = {
  title: 'Components/TrendBadge',
  component: TrendBadge,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof TrendBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Positive: Story = { args: { value: '+12.4%', direction: 'positive' } };
export const Negative: Story = { args: { value: '-3.2%', direction: 'negative' } };
