'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check, Plus } from 'lucide-react';
import type { FAQItem } from '@/features/articles/types';
import { useReadingQueue } from '@/features/reading/use-reading-queue';

interface CardItemProps {
  item: FAQItem;
  /** Chamado ao abrir o artigo (além da navegação do link). */
  onClick?: () => void;
  isInQueue: boolean;
  onToggleQueue: (e?: React.MouseEvent) => void;
  index?: number;
}

export const CardItem: React.FC<CardItemProps> = ({ item, onClick, isInQueue, onToggleQueue, index = 0 }) => {
  return (
    <article
      style={{ '--enter-index': index } as React.CSSProperties}
      className="group relative flex h-full flex-col justify-between gap-5 p-6 sm:p-7 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-paper)] dark:bg-[var(--bg-island)] hover:border-[var(--border)] transition-colors duration-150 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-[var(--accent-editorial)]"
    >
      <div className="flex flex-col gap-3.5">
        {/* Top Header: Category Tag & Save Bookmark Button */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5 text-[11px] font-mono uppercase tracking-wider">
            <span className="inline-flex items-center rounded px-2 py-0.5 font-medium text-[var(--text-secondary)] bg-[var(--bg-elevated)] border border-[var(--border-hairline)]">
              {item.category}
            </span>
            <span className="truncate text-[11px] text-[var(--text-muted)]">{item.date}</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onToggleQueue(e);
            }}
            aria-label={
              isInQueue
                ? `Remover "${item.question}" da lista de leitura`
                : `Salvar "${item.question}" na lista de leitura`
            }
            aria-pressed={isInQueue}
            className={`relative z-10 shrink-0 rounded-md p-1.5 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-editorial)] ${
              isInQueue
                ? 'bg-[var(--accent-editorial)] text-white'
                : 'text-[var(--text-muted)] hover:bg-[var(--bg-paper-warm)] hover:text-[var(--text-main)] opacity-0 group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100'
            }`}
          >
            {isInQueue ? <Check size={15} aria-hidden="true" /> : <Plus size={15} aria-hidden="true" />}
          </button>
        </div>

        {/* Title with Editorial Serif */}
        <h3 className="font-serif text-[1.35rem] sm:text-[1.5rem] font-medium leading-[1.22] tracking-tight text-[var(--text-main)] group-hover:text-[var(--accent-editorial)] transition-colors duration-150">
          <Link
            href={`/artigo/${item.id}`}
            scroll={false}
            onClick={() => onClick?.()}
            className="after:absolute after:inset-0 after:rounded-[inherit] after:content-[''] focus-visible:outline-none"
          >
            {item.question}
          </Link>
        </h3>

        {/* Answer Snippet */}
        <p className="line-clamp-3 text-[0.875rem] leading-relaxed text-[var(--text-secondary)] font-normal">{item.answer}</p>
      </div>

      {/* Footer with Action CTA */}
      <div className="pt-3 border-t border-[var(--border-hairline)] flex items-center justify-between text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
        <span
          aria-hidden="true"
          className="inline-flex items-center gap-1.5 font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-editorial)] transition-colors duration-150"
        >
          <span>Ler artigo</span>
          <ArrowUpRight
            size={14}
            className="transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </span>
        <span className="text-[11px] text-[var(--text-muted)]/80">
          Documento verificado
        </span>
      </div>
    </article>
  );
};

export const ArticleGrid = ({
  items,
  onModalStateChange,
}: {
  items: FAQItem[];
  onModalStateChange?: (isOpen: boolean) => void;
}) => {
  const { queue, toggleQueue } = useReadingQueue();

  return (
    <div className="relative">
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-5 2xl:grid-cols-3" role="list">
        {items.map((item, idx) => (
          <li
            key={item.id}
            className="h-full [content-visibility:auto] [contain-intrinsic-size:auto_220px]"
          >
            <CardItem
              item={item}
              index={idx}
              onClick={() => onModalStateChange?.(true)}
              isInQueue={queue.includes(item.id)}
              onToggleQueue={() => toggleQueue(item.id)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};
