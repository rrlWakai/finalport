import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'section' | 'article';
}

export function GlassCard({ children, className = '', as: Tag = 'div' }: GlassCardProps) {
  return (
    <Tag
      className={`bg-black/[0.03] backdrop-blur-xl border border-black/10 ${className}`}
    >
      {children}
    </Tag>
  );
}
