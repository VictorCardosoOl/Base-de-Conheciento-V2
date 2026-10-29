import React from 'react';
import { SunburstEmblem } from '@/features/institutional/components/SunburstEmblem';

/**
 * Marca oficial da Base SST: carimbo radial dourado (SunburstEmblem)
 * consistente em todas as páginas e interfaces da plataforma.
 */
export function LogoMark({ size = 26, className = '' }: { size?: number; className?: string }) {
  return (
    <SunburstEmblem
      size={size}
      strokeColor="#B27E29"
      dotColor="#B27E29"
      className={className}
    />
  );
}

/** Marca + nome Base SST unificado. */
export function Logo({ compact = false, className = '' }: { compact?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark />
      {!compact && (
        <span className="font-sans text-[15px] font-bold tracking-tight text-text-main leading-none">
          Base <span className="text-[#B27E29]">SST</span>
        </span>
      )}
    </span>
  );
}

