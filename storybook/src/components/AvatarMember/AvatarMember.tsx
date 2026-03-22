import React from 'react';
import styles from './AvatarMember.module.css';
import avatar1 from './avatar-member-1.png';
import avatar2 from './avatar-member-2.png';
import avatar3 from './avatar-member-3.png';
import avatar4 from './avatar-member-4.png';

export type MemberVariant = '1' | '2' | '3' | '4';

export interface AvatarMemberProps {
  member?: MemberVariant;
  /** URL to override the default member image */
  src?: string;
  alt?: string;
}

const DEFAULT_IMAGES: Record<MemberVariant, string> = {
  '1': avatar1,
  '2': avatar4,
  '3': avatar3,
  '4': avatar2,
};

export function AvatarMember({ member = '1', src, alt }: AvatarMemberProps) {
  const imgSrc = src ?? DEFAULT_IMAGES[member];
  return (
    <div className={styles.avatar}>
      <img src={imgSrc} alt={alt ?? `Member ${member}`} className={styles.img} />
    </div>
  );
}
