'use client';
import React, { useEffect, useRef, useState } from 'react';
import { ArrowUp, Check, Highlighter, Printer, Share2 } from 'lucide-react';
import { useShare } from '@/hooks/use-share';
import { TableOfContents } from './TableOfContents';
import { ArticleNeighbors } from './ArticleNeighbors';
import { RelatedArticles } from './RelatedArticles';
import { LazyMount } from '@/components/ui/LazyMount';
import { ArticleInteractions } from '@/features/content/components/ArticleInteractions';
import { useReadingProgress } from '@/features/reading/use-reading-progress';
import { ArticleContent } from './ArticleContent';
import { ArticleReadingControls } from './ArticleReadingControls';
import {
  ReadingExperienceService,
  type TypographyPreferences,
} from '@/features/reading/reading-experience-service';

/**
 * Leitura na página do artigo: caderno editorial sobre superfície de papel arquival,
 * controles de tipografia/medida/foco no topo, sumário lateral dinâmico e dock discreto.
 */
export function ArticleReader({
  htmlContent,
  articleId,
  title,
  summary,
}: {
  htmlContent: string;
  articleId: string;
  title: string;
  summary: string;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [showDock, setShowDock] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [typography, setTypography] = useState<TypographyPreferences>(() =>
    ReadingExperienceService.getTypography()
  );
  const { shareContent, shareFeedback } = useShare();

  // Progresso escrito direto no DOM; o dock só re-renderiza quando aparece/some.
  useReadingProgress(barRef, { target: bodyRef });
  useEffect(() => {
    let frame = 0;
    let shown = false;
    const update = () => {
      frame = 0;
      const next = window.scrollY > 240;
      if (next !== shown) {
        shown = next;
        setShowDock(next);
      }
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const dockButton =
    'h-9 px-3 rounded-md inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-paper-warm)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-editorial)]';

  return (
    <>
      <div
        className="fixed top-0 left-0 right-0 z-[70] h-[2px] no-print pointer-events-none"
      >
        <div
          ref={barRef}
          role="progressbar"
          aria-label="Progresso de leitura do artigo"
          aria-valuemin={0}
          aria-valuemax={100}
          data-testid="reading-progress"
          className="h-full origin-left bg-[var(--accent-editorial)]"
          style={{ transform: 'scaleX(0)' }}
        />
      </div>

      {/* Barra Editorial do Leitor (Tipografia, Largura da Coluna, Modo Foco e Dica de Marca-texto) */}
      <div className="flex flex-wrap items-center justify-between gap-3 py-3 px-4 sm:px-5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-paper)] dark:bg-[var(--bg-island)] no-print">
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <Highlighter size={14} className="text-[var(--accent-editorial)] shrink-0" aria-hidden="true" />
          <span>
            Selecione qualquer trecho do texto para destacar no seu caderno local
          </span>
        </div>
        <ArticleReadingControls
          isZenMode={isZenMode}
          onToggleZenMode={() => setIsZenMode((prev) => !prev)}
          typography={typography}
          onTypographyChange={setTypography}
        />
      </div>

      <div
        className={`grid grid-cols-1 ${
          !isZenMode ? 'xl:grid-cols-[1fr_270px] 2xl:grid-cols-[1fr_310px]' : ''
        } gap-8 xl:gap-14 items-start w-full`}
      >
        <div
          ref={bodyRef}
          data-reveal
          className={`min-w-0 w-full rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-paper)] dark:bg-[var(--bg-island)] px-6 sm:px-10 md:px-14 lg:px-16 py-8 sm:py-12 transition-all ${
            isZenMode ? 'max-w-4xl mx-auto shadow-sm' : ''
          }`}
        >
          <div className="max-w-none text-[var(--text-body)]">
            <ArticleContent
              htmlContent={htmlContent}
              articleId={articleId}
              typography={typography}
            />
          </div>
        </div>
        {!isZenMode && (
          <div className="hidden xl:block">
            <TableOfContents containerRef={bodyRef} scrollRoot="viewport" />
          </div>
        )}
      </div>

      {!isZenMode && (
        <>
          <ArticleNeighbors articleId={articleId} />
          <RelatedArticles articleId={articleId} />
        </>
      )}
      <LazyMount>
        <ArticleInteractions articleId={articleId} articleTitle={title} contentRef={bodyRef} />
      </LazyMount>

      {/* Dock de ações flutuante */}
      <div
        className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-[45] no-print transition-opacity duration-200 ${
          showDock ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          role="toolbar"
          aria-label="Ações do artigo"
          className="bg-[var(--bg-island)] rounded-lg border border-[var(--border-hairline)] flex items-center gap-1 p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
        >
          <button
            type="button"
            onClick={() => shareContent(title, summary, window.location.href)}
            aria-label={shareFeedback ? 'Link copiado' : 'Compartilhar'}
            className={dockButton}
            tabIndex={showDock ? 0 : -1}
          >
            {shareFeedback ? <Check size={15} aria-hidden="true" /> : <Share2 size={15} aria-hidden="true" />}
            <span className="hidden sm:inline">{shareFeedback ? 'Copiado' : 'Compartilhar'}</span>
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            aria-label="Gerar PDF do Artigo"
            className={dockButton}
            tabIndex={showDock ? 0 : -1}
          >
            <Printer size={15} aria-hidden="true" />
            <span className="hidden sm:inline">PDF</span>
          </button>
          <span aria-hidden="true" className="w-px h-5 bg-[var(--border-hairline)] mx-1" />
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Voltar ao início do artigo"
            className={dockButton}
            tabIndex={showDock ? 0 : -1}
          >
            <ArrowUp size={15} aria-hidden="true" />
            <span className="hidden sm:inline">Topo</span>
          </button>
        </div>
      </div>
    </>
  );
}

