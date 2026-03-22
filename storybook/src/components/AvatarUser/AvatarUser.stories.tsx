import type { Meta, StoryObj } from '@storybook/react-vite';
import { AvatarUser } from './AvatarUser.tsx';

const meta = {
  title: 'Components/AvatarUser',
  component: AvatarUser,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
} satisfies Meta<typeof AvatarUser>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ActiveWithName: Story = { args: { name: 'David', active: true,  member: '1' } };
export const InactiveNoName: Story = { args: { name: 'David', active: false, member: '1' } };
export const DifferentMember: Story = { args: { name: 'Anna',  active: true,  member: '2' } };
