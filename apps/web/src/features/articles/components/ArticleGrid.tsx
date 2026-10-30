'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, Bookmark, BookmarkCheck, Clock } from 'lucide-react';
import type { FAQItem } from '@/features/articles/types';
import { readingMinutes } from '@/features/articles/article-meta';
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
  const minutes = readingMinutes(item.searchText);

  return (
    <article
      style={{ '--enter-index': index } as React.CSSProperties}
      className="group relative flex h-full flex-col justify-between gap-5 p-6 sm:p-7 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-paper)] dark:bg-[var(--bg-island)] hover:border-[#1C4E46]/60 dark:hover:border-[#68B2A0]/60 hover:shadow-md transition-all duration-200 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-[var(--accent-editorial)]"
    >
      <div className="flex flex-col gap-3.5">
        {/* Cabeçalho do Card: Módulo, Data e Marcador */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="inline-flex items-center px-3 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider font-semibold text-[#1C4E46] dark:text-[#8CD1BE] bg-[#1C4E46]/8 dark:bg-[#8CD1BE]/10 border border-[#1C4E46]/15 dark:border-[#8CD1BE]/20">
              {item.category}
            </span>
            <span className="text-[11px] font-mono text-[var(--text-muted)] tabular-nums truncate">
              {item.lastReviewed || item.date}
            </span>
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
            title={isInQueue ? 'Salvo na sua lista de leitura' : 'Salvar na sua lista de leitura'}
            className={`relative z-10 shrink-0 rounded-full p-2 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-editorial)] focus-visible:opacity-100 [@media(hover:none)]:opacity-100 ${
              isInQueue
                ? 'bg-[#1C4E46] text-white shadow-xs'
                : 'text-[var(--text-muted)] hover:bg-[var(--bg-paper-warm)] hover:text-[var(--text-main)] opacity-0 group-hover:opacity-100'
            }`}
          >
            {isInQueue ? (
              <BookmarkCheck size={16} aria-hidden="true" className="text-white" />
            ) : (
              <Bookmark size={16} aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Título com Serif Editorial */}
        <h3 className="font-editorial text-[1.3rem] sm:text-[1.42rem] font-medium leading-[1.24] tracking-tight text-[var(--text-main)] group-hover:text-[#1C4E46] dark:group-hover:text-[#8CD1BE] transition-colors duration-150">
          <Link
            href={`/artigo/${item.id}`}
            scroll={false}
            onClick={() => onClick?.()}
            className="after:absolute after:inset-0 after:rounded-[inherit] after:content-[''] focus-visible:outline-none"
          >
            {item.question}
          </Link>
        </h3>

        {/* Resumo Técnico / Síntese */}
        <p className="line-clamp-3 text-[13.5px] leading-relaxed text-[var(--text-secondary)] font-normal">
          {item.answer}
        </p>
      </div>

      {/* Rodapé do Card com Ação de Acesso */}
      <div className="pt-4 border-t border-[var(--border-hairline)] flex items-center justify-between text-xs text-[var(--text-muted)]">
        <span
          aria-hidden="true"
          className="inline-flex items-center gap-1.5 font-medium text-[var(--text-primary)] group-hover:text-[#1C4E46] dark:group-hover:text-[#8CD1BE] transition-colors duration-150"
        >
          <span>Acessar dossiê técnico</span>
          <ArrowUpRight
            size={14}
            className="transition-transform duration-150 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </span>
        {minutes ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[var(--text-muted)] tabular-nums">
            <Clock size={12} aria-hidden="true" />
            <span>{minutes} min</span>
          </span>
        ) : null}
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
      <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:gap-6 2xl:grid-cols-3" role="list">
        {items.map((item, idx) => (
          <li
            key={item.id}
            className="h-full"
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
