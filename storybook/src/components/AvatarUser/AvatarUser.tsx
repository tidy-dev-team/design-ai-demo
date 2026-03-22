import React from 'react';
import styles from './AvatarUser.module.css';
import { AvatarMember } from '../AvatarMember/AvatarMember.tsx';
import type { MemberVariant } from '../AvatarMember/AvatarMember.tsx';

export interface AvatarUserProps {
  name?: string;
  member?: MemberVariant;
  /** When active=yes show pill with name, when no show avatar only */
  active?: boolean;
  src?: string;
}

export function AvatarUser({ name = 'David', member = '1', active = true, src }: AvatarUserProps) {
  if (!active) {
    return <AvatarMember member={member} src={src} alt={name} />;
  }
  return (
    <div className={styles.pill}>
      <AvatarMember member={member} src={src} alt={name} />
      <span className={styles.name}>{name}</span>
    </div>
  );
}
