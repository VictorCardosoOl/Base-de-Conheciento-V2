'use client';
import React from 'react';
import Link from 'next/link';
import { Bookmark, ArrowUpRight } from 'lucide-react';
import { useReadingQueue } from '@/features/reading/use-reading-queue';
import { AnimatedNumber } from '@/components/ui/glass/GlassMetrics';

/** Bloco "Minha Lista" da conta: a lista vive no navegador, por isso é um componente cliente. */
export function ReadingQueueTile() {
  const { queue } = useReadingQueue();
  return (
    <Link
      href="/minha-lista"
      className="group flex h-full flex-col justify-between gap-6 p-6 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-paper)] dark:bg-[var(--bg-island)] hover:border-[var(--border)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-editorial)]"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
          Minha Lista
        </span>
        <span className="w-8 h-8 rounded-md bg-[var(--bg-elevated)] border border-[var(--border-hairline)] flex items-center justify-center text-text-main group-hover:border-[var(--border)] transition-colors">
          <Bookmark size={15} aria-hidden="true" />
        </span>
      </div>
      <div>
        <AnimatedNumber value={queue.length} className="block text-4xl font-serif font-medium tracking-tight text-text-main tabular-nums" />
        <span className="mt-1 inline-flex items-center gap-1 text-sm text-text-muted">
          {queue.length === 1 ? 'artigo salvo para ler' : 'artigos salvos para ler'}
          <ArrowUpRight size={14} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}
