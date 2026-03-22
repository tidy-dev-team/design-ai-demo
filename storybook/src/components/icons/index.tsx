/**
 * Icon wrappers — all backed by @tabler/icons-react.
 * The wrapper API (size, color, className) is kept stable so consumer
 * components don't need to be touched.
 */
import React from 'react';
import {
  IconHome,
  IconWallet,
  IconArrowsLeftRight,
  IconShieldCheck,
  IconPigMoney,
  IconFileText,
  IconHeadset,
  IconMail,
  IconChevronRight,
  IconChevronLeft,
  IconChevronUp,
  IconChevronDown,
  IconSend,
  IconSearch,
  IconArrowUpRight,
  IconSparkles,
  IconArrowNarrowRight,
} from '@tabler/icons-react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

const STROKE = 1.5;

export function HomeIcon({ size = 18, color = '#171717', className }: IconProps) {
  return <IconHome size={size} color={color} stroke={STROKE} className={className} />;
}

export function WalletIcon({ size = 18, color = '#171717', className }: IconProps) {
  return <IconWallet size={size} color={color} stroke={STROKE} className={className} />;
}

export function SwitchIcon({ size = 16, color = '#171717', className }: IconProps) {
  return <IconArrowsLeftRight size={size} color={color} stroke={STROKE} className={className} />;
}

export function ShieldIcon({ size = 18, color = '#171717', className }: IconProps) {
  return <IconShieldCheck size={size} color={color} stroke={STROKE} className={className} />;
}

export function SavingsIcon({ size = 18, color = '#171717', className }: IconProps) {
  return <IconPigMoney size={size} color={color} stroke={STROKE} className={className} />;
}

export function FileTextIcon({ size = 18, color = '#171717', className }: IconProps) {
  return <IconFileText size={size} color={color} stroke={STROKE} className={className} />;
}

export function HeadsetIcon({ size = 18, color = '#171717', className }: IconProps) {
  return <IconHeadset size={size} color={color} stroke={STROKE} className={className} />;
}

export function MailIcon({ size = 18, color = '#171717', className }: IconProps) {
  return <IconMail size={size} color={color} stroke={STROKE} className={className} />;
}

export function SearchIcon({ size = 16, color = '#636363', className }: IconProps) {
  return <IconSearch size={size} color={color} stroke={STROKE} className={className} />;
}

export function SendIcon({ size = 16, color = '#ffffff', className }: IconProps) {
  return <IconSend size={size} color={color} stroke={STROKE} className={className} />;
}

export function ArrowUpRightIcon({ size = 14, color = '#ffffff', className }: IconProps) {
  return <IconArrowUpRight size={size} color={color} stroke={STROKE} className={className} />;
}

export function AiSparkleIcon({ size = 20, color = '#2c2c2e', className }: IconProps) {
  return <IconSparkles size={size} color={color} stroke={STROKE} className={className} />;
}

export function ArrowNarrowRightIcon({ size = 16, color = '#ffffff', className }: IconProps) {
  return <IconArrowNarrowRight size={size} color={color} stroke={2} className={className} />;
}

export type ChevronDirection = 'up' | 'down' | 'left' | 'right';

const CHEVRON_MAP = {
  right: IconChevronRight,
  left:  IconChevronLeft,
  up:    IconChevronUp,
  down:  IconChevronDown,
} as const;

export function ChevronIcon({
  size = 16,
  color = '#636363',
  direction = 'right',
  className,
}: IconProps & { direction?: ChevronDirection }) {
  const Icon = CHEVRON_MAP[direction];
  return <Icon size={size} color={color} stroke={STROKE} className={className} />;
}
