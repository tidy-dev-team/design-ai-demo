import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { CardInsuranceCoverage } from './CardInsuranceCoverage.tsx';

const meta = {
  title: 'Components/CardInsuranceCoverage',
  component: CardInsuranceCoverage,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [(Story) => <div style={{ width: 880 }}><Story /></div>],
} satisfies Meta<typeof CardInsuranceCoverage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Insurance Coverage',
  },
};

export const TwoItems: Story = {
  args: {
    title: 'Insurance Coverage',
    items: [
      { id: '1', title: 'Life',   icon: 'shield',  provider: 'Harel',  coverage: '$1,200,000', monthlyPremium: '$450' },
      { id: '2', title: 'Health', icon: 'headset', provider: 'Maccabi', coverage: '$500,000',  monthlyPremium: '$320' },
    ],
  },
};
