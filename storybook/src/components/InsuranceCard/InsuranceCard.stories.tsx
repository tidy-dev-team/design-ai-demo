import type { Meta, StoryObj } from '@storybook/react-vite';
import { InsuranceCard } from './InsuranceCard.tsx';

const meta = {
  title: 'Components/InsuranceCard',
  component: InsuranceCard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof InsuranceCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Life: Story = {
  args: { title: 'Life', icon: 'shield', provider: 'Harel', coverage: '$1,200,000', monthlyPremium: '$450' },
};
export const Health: Story = {
  args: { title: 'Health', icon: 'headset', provider: 'Maccabi', coverage: '$500,000', monthlyPremium: '$320' },
};
export const Pension: Story = {
  args: { title: 'Pension', icon: 'wallet', provider: 'Phoenix', coverage: '$840,000', monthlyPremium: '$650' },
};
