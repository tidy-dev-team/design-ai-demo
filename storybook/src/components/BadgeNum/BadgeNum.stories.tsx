import type { Meta, StoryObj } from '@storybook/react-vite';
import { BadgeNum } from './BadgeNum.tsx';

const meta = {
  title: 'Components/BadgeNum',
  component: BadgeNum,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof BadgeNum>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { count: 3 } };
export const LargeCount: Story = { args: { count: 12 } };
export const SingleDigit: Story = { args: { count: 1 } };
