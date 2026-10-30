'use client';
import React from 'react';
import Link from 'next/link';
import { CalendarDays, Clock, RefreshCcw, UserCheck, UserRound } from 'lucide-react';
import type { FAQItem } from '@/features/articles/types';

/** O suficiente de um artigo do catálogo (FAQItem) ou lido do Markdown (ArticleFile). */
type HeroArticle = Pick<FAQItem, 'question' | 'answer' | 'lastReviewed' | 'validityMonths' | 'verifiedBy'> & {
  id?: string;
  category: string;
  date?: string;
  author?: string;
};

/**
 * Cabeçalho do artigo: módulo, título, resposta curta (subtítulo) e metadados reais da
 * publicação. Só mostra autoria e revisão quando o artigo as declara (frontmatter
 * `author`, `verifiedBy`, `lastReviewed`): nada inventado. Editorial limpo, sem caixa ao redor.
 */
export function ArticleHero({
  article,
  titleId,
  headingLevel = 1,
  minutes,
  actions,
}: {
  article: HeroArticle;
  titleId?: string;
  headingLevel?: 1 | 2;
  minutes?: number | null;
  actions?: React.ReactNode;
}) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2';
  const reviewed = article.lastReviewed && article.lastReviewed !== article.date ? article.lastReviewed : null;
  const meta = 'inline-flex items-center gap-1.5';

  return (
    <header
      className="article-hero relative isolate w-full border-b border-[var(--border-hairline)] pb-8 sm:pb-12 transition-colors"
      data-testid="article-hero"
    >
      <div className="relative w-full">
        {/* Top Curatorial Kicker & Reading Time */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border-hairline)] pb-3.5 mb-6 sm:mb-8 text-xs font-mono uppercase tracking-[0.14em] text-[var(--text-muted)]">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/artigos"
              className="hover:text-[var(--text-main)] transition-colors"
            >
              Acervo Técnico
            </Link>
            <span aria-hidden="true" className="opacity-40">/</span>
            <Link
              href={`/artigos?category=${encodeURIComponent(article.category)}`}
              className="font-semibold text-[var(--accent-editorial)] hover:underline underline-offset-4"
            >
              {article.category}
            </Link>
          </div>

          {minutes ? (
            <div className={`${meta} tabular-nums text-[var(--text-muted)]`}>
              <Clock size={13} aria-hidden="true" />
              <span>{minutes} min de leitura</span>
            </div>
          ) : null}
        </div>

        <Heading
          id={titleId}
          className="font-serif font-normal text-[var(--text-main)] text-[clamp(2.15rem,1.7rem+2.8vw,3.85rem)] leading-[1.08] tracking-[-0.03em] max-w-4xl"
        >
          {article.question}
        </Heading>

        {article.answer && (
          <p className="mt-5 sm:mt-6 text-[clamp(1.075rem,1rem+0.35vw,1.3rem)] leading-[1.6] text-[var(--text-secondary)] max-w-3xl font-serif italic font-normal">
            {article.answer}
          </p>
        )}

        <div className="mt-7 pt-5 border-t border-[var(--border-hairline)] flex flex-wrap items-center justify-between gap-4">
          <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[var(--text-muted)] font-mono">
            {article.author && (
              <div className={meta}>
                <dt className="sr-only">Autoria</dt>
                <UserRound size={14} aria-hidden="true" />
                <dd className="font-medium text-[var(--text-main)] font-sans">{article.author}</dd>
              </div>
            )}
            {article.date && (
              <div className={`${meta} tabular-nums`}>
                <dt className="sr-only">Publicado em</dt>
                <CalendarDays size={14} aria-hidden="true" />
                <dd>Publicado em {article.date}</dd>
              </div>
            )}
            {reviewed && (
              <div className={`${meta} tabular-nums`}>
                <dt className="sr-only">Atualizado em</dt>
                <RefreshCcw size={13} aria-hidden="true" />
                <dd>Atualizado em {reviewed}</dd>
              </div>
            )}
            {article.verifiedBy && (
              <div className={meta}>
                <dt className="sr-only">Revisão técnica</dt>
                <UserCheck size={14} aria-hidden="true" />
                <dd>Revisado por {article.verifiedBy}</dd>
              </div>
            )}
          </dl>

          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      </div>
    </header>
  );
}

