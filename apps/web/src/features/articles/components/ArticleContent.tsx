'use client';
import React, { useEffect, useRef, useState, useCallback, useSyncExternalStore } from 'react';
import { ArticleLightbox } from './ArticleLightbox';
import { ArticleHighlightsToolbar } from './ArticleHighlightsToolbar';
import { useMermaidRenderer } from '../hooks/use-mermaid-renderer';
import { useTextHighlighter } from '../hooks/use-text-highlighter';
import {
  READING_EVENTS,
  ReadingExperienceService,
  type HighlightItem,
  type TypographyPreferences,
} from '@/features/reading/reading-experience-service';

interface ArticleContentProps {
  htmlContent: string;
  articleId?: string;
  typography?: TypographyPreferences;
}

const emptySubscribe = () => () => {};
const getClientMounted = () => true;
const getServerMounted = () => false;

export const ArticleContent: React.FC<ArticleContentProps> = ({
  htmlContent,
  articleId,
  typography: propTypography,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const isMounted = useSyncExternalStore(emptySubscribe, getClientMounted, getServerMounted);

  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState<string>('');
  const [typography, setTypography] = useState<TypographyPreferences | null>(
    () => propTypography || (typeof window !== 'undefined' ? ReadingExperienceService.getTypography() : null)
  );
  const [activeHighlights, setActiveHighlights] = useState<HighlightItem[]>(
    () => (articleId && typeof window !== 'undefined' ? ReadingExperienceService.getHighlights(articleId) : [])
  );

  // Sincronização de preferências de leitura e destaques
  useEffect(() => {
    const handleSettingsUpdate = () => {
      setTypography(ReadingExperienceService.getTypography());
    };

    const handleHighlightsUpdate = (e: Event) => {
      const evt = e as CustomEvent<{ articleId?: string }>;
      if (articleId && (!evt.detail?.articleId || evt.detail.articleId === articleId)) {
        setActiveHighlights(ReadingExperienceService.getHighlights(articleId));
      }
    };

    window.addEventListener(READING_EVENTS.typographyUpdated, handleSettingsUpdate);
    window.addEventListener(READING_EVENTS.highlightsUpdated, handleHighlightsUpdate);

    return () => {
      window.removeEventListener(READING_EVENTS.typographyUpdated, handleSettingsUpdate);
      window.removeEventListener(READING_EVENTS.highlightsUpdated, handleHighlightsUpdate);
    };
  }, [articleId]);

  // Hooks especializados
  useMermaidRenderer(htmlContent);
  const processedHtml = useTextHighlighter(htmlContent, activeHighlights, isMounted);

  const handleCloseLightbox = useCallback(() => {
    setLightboxSrc(null);
  }, []);

  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;

    // 1. Imagens com zoom suave
    const images = root.querySelectorAll('img');
    images.forEach((img) => {
      img.classList.add('cursor-zoom-in', 'transition-opacity', 'hover:opacity-90');
    });

    // 2. Limpeza de título redundante no primeiro parágrafo (ex: <p><strong>PGR</strong></p>)
    // e promoção de parágrafos curtos inteiramente em negrito para subtítulos navegáveis
    const children = Array.from(root.children) as HTMLElement[];
    let firstNarrativeParagraphFound = false;

    children.forEach((el, idx) => {
      el.removeAttribute('data-dropcap');
      el.removeAttribute('data-editorial-heading');
      el.removeAttribute('data-redundant-title');

      if (el.tagName !== 'P') return;

      const text = (el.textContent || '').trim();
      if (!text) return;

      // Verifica se o parágrafo contém apenas um <strong> como título isolado
      const elementChildren = Array.from(el.children);
      const onlyStrong =
        elementChildren.length === 1 &&
        (elementChildren[0].tagName === 'STRONG' || elementChildren[0].tagName === 'B') &&
        (elementChildren[0].textContent || '').trim() === text;

      if (onlyStrong && idx === 0 && text.length <= 36) {
        el.setAttribute('data-redundant-title', 'true');
        return;
      }

      if (onlyStrong && text.length > 3 && text.length <= 105 && !text.endsWith('.')) {
        el.setAttribute('data-editorial-heading', 'true');
        if (!el.id) {
          const slug = text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
          el.id = `sec-${idx}-${slug || idx}`;
        }
        return;
      }

      // Capitular editorial (Drop Cap) apenas no primeiro parágrafo narrativo real
      if (!firstNarrativeParagraphFound && text.length >= 85 && /^[A-Za-zÀ-ÿ]/.test(text)) {
        el.setAttribute('data-dropcap', 'true');
        firstNarrativeParagraphFound = true;
      }
    });

    // 3. Envelopamento responsivo de tabelas normativas
    const tables = root.querySelectorAll('table');
    tables.forEach((table) => {
      if (table.parentElement?.classList.contains('editorial-table-scroll')) return;
      const wrapper = document.createElement('div');
      wrapper.className = 'editorial-table-scroll';
      table.parentNode?.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });

    // 4. Botão de cópia em blocos técnicos (<pre>)
    const preBlocks = root.querySelectorAll('pre');
    preBlocks.forEach((pre) => {
      if (pre.querySelector('.editorial-code-copy') || pre.classList.contains('mermaid')) return;
      const codeEl = pre.querySelector('code');
      const codeText = (codeEl?.textContent || pre.textContent || '').trim();
      if (!codeText) return;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'editorial-code-copy no-print';
      btn.textContent = 'Copiar';
      btn.setAttribute('aria-label', 'Copiar trecho técnico');
      btn.addEventListener('click', (ev) => {
        ev.stopPropagation();
        navigator.clipboard?.writeText(codeText).then(() => {
          btn.textContent = 'Copiado';
          btn.setAttribute('data-copied', 'true');
          window.setTimeout(() => {
            btn.textContent = 'Copiar';
            btn.removeAttribute('data-copied');
          }, 1800);
        });
      });
      pre.appendChild(btn);
    });
  }, [processedHtml]);

  const handleContentClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      setLightboxSrc(target.getAttribute('src'));
      setLightboxAlt(target.getAttribute('alt') || 'Imagem do Artigo');
    }
  }, []);

  const activeTypo = propTypography || typography;
  const typoClasses = [
    activeTypo?.fontFamily === 'sans'
      ? 'article-font-sans'
      : activeTypo?.fontFamily === 'dyslexic'
        ? 'article-font-dyslexic'
        : 'article-font-serif',
    `article-size-${activeTypo?.fontSize || 'base'}`,
    `article-leading-${activeTypo?.lineHeight || 'relaxed'}`,
    `article-measure-${activeTypo?.measure || 'comfortable'}`,
  ].join(' ');

  return (
    <div className="relative">
      <div
        ref={contentRef}
        onClick={handleContentClick}
        className={`gsap-stagger-item article-content-render ${typoClasses}`}
        dangerouslySetInnerHTML={{ __html: processedHtml }}
      />
      {articleId && (
        <ArticleHighlightsToolbar
          articleId={articleId}
          containerRef={contentRef}
        />
      )}
      <ArticleLightbox
        src={lightboxSrc}
        alt={lightboxAlt}
        onClose={handleCloseLightbox}
      />
    </div>
  );
};

