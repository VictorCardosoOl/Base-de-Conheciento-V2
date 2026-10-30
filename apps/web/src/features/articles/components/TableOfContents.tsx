import React, { useEffect, useRef, useState, useMemo } from 'react';

export interface TocItem {
  id: string;
  text: string;
  level: number; // 2 para h2/subtítulo editorial, 3 para h3
}

export interface NumberedTocItem extends TocItem {
  indexStr: string | null;
}

function getNumberedTocItems(items: TocItem[]): NumberedTocItem[] {
  let counter = 0;
  return items.map((item) => {
    const isMain = item.level === 2;
    if (isMain) counter += 1;
    return {
      ...item,
      indexStr: isMain ? String(counter).padStart(2, '0') : null,
    };
  });
}

interface TableOfContentsProps {
  containerRef: React.RefObject<HTMLElement | null>;
  onNavigate?: (id: string) => void;
  /** Quem rola: o próprio contêiner (modal) ou a janela (página do artigo). */
  scrollRoot?: 'container' | 'viewport';
  /** Onde procurar os títulos (o corpo do artigo); padrão: o contêiner. */
  contentRef?: React.RefObject<HTMLElement | null>;
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({
  containerRef,
  scrollRoot = 'container',
  contentRef,
}) => {
  const [items, setItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');
  const navRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);

  // 1. Cabeçalhos do corpo do artigo (h2, h3 e subtítulos editoriais promovidos).
  useEffect(() => {
    const scope = (contentRef ?? containerRef).current;
    if (!scope) return;
    let timer = 0;

    const scan = () => {
      const tocItems: TocItem[] = [];
      scope
        .querySelectorAll('h2, h3, [data-editorial-heading="true"]')
        .forEach((heading, idx) => {
          const text = (heading.textContent || '').trim();
          if (!text) return;
          let id = heading.id;
          if (!id) {
            id = `toc-${idx}-${
              text
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '') || idx
            }`;
            heading.id = id;
          }
          const tag = heading.tagName.toLowerCase();
          tocItems.push({
            id,
            text,
            level: tag === 'h3' ? 3 : 2,
          });
        });

      setItems((prev) =>
        prev.length === tocItems.length && prev.every((item, i) => item.id === tocItems[i].id)
          ? prev
          : tocItems
      );
      setActiveId((current) => current || tocItems[0]?.id || '');
    };
    const schedule = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(scan, 90);
    };

    schedule();
    const observer = new MutationObserver(schedule);
    observer.observe(scope, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-editorial-heading'],
    });
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [containerRef, contentRef]);

  // 2. Scrollspy via IntersectionObserver
  useEffect(() => {
    const container = containerRef.current;
    if (!container || items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        root: scrollRoot === 'viewport' ? null : container,
        rootMargin: '0px 0px -60% 0px',
        threshold: 0.1,
      }
    );

    items.forEach((item) => {
      const el = container.querySelector(`#${CSS.escape(item.id)}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items, containerRef, scrollRoot]);

  // Indicador arquitetural no trilho lateral
  useEffect(() => {
    const nav = navRef.current;
    if (!nav || !activeId) return;
    const button = Array.from(nav.querySelectorAll<HTMLElement>('[data-toc-id]')).find(
      (el) => el.dataset.tocId === activeId
    );
    const indicator = indicatorRef.current;
    if (!button || !indicator) return;
    indicator.style.transform = `translateY(${button.offsetTop}px)`;
    indicator.style.height = `${button.offsetHeight}px`;
    indicator.style.opacity = '1';
  }, [activeId, items]);

  const scrollToHeading = (id: string) => {
    const container = containerRef.current;
    if (!container) return;

    const target = container.querySelector(`#${CSS.escape(id)}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
    }
  };

  const numberedItems = useMemo(() => getNumberedTocItems(items), [items]);

  if (items.length < 2) return null;

  return (
    <aside
      className="sticky top-28 text-xs"
      aria-label="Neste artigo"
    >
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border-hairline)]">
        <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Sumário do Documento
        </span>
        <span className="text-[10px] font-mono tabular-nums text-[var(--text-muted)]">
          {String(items.length).padStart(2, '0')} seções
        </span>
      </div>

      <nav
        ref={navRef}
        className="relative border-l border-[var(--border-hairline)] max-h-[68vh] overflow-y-auto no-scrollbar"
      >
        <span
          ref={indicatorRef}
          aria-hidden="true"
          className="
            absolute top-0 -left-[1px] w-[2px] h-0 opacity-0
            bg-[var(--accent-editorial)]
            transition-[transform,height,opacity] duration-200 ease-out
            motion-reduce:transition-none
          "
        />
        {numberedItems.map((item) => {
          const isActive = activeId === item.id;
          const { indexStr } = item;

          return (
            <button
              key={item.id}
              type="button"
              data-toc-id={item.id}
              onClick={() => scrollToHeading(item.id)}
              aria-current={isActive ? 'location' : undefined}
              className={`group relative flex items-baseline gap-2.5 w-full text-left py-2 pr-2 transition-colors duration-150 focus-visible:outline-none focus-visible:bg-[var(--bg-paper-warm)] ${
                item.level === 3 ? 'pl-7 text-[11.5px]' : 'pl-4 text-xs'
              } ${
                isActive
                  ? 'text-[var(--text-main)] font-medium bg-[var(--bg-paper-warm)]/60'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              {indexStr && (
                <span
                  className={`font-mono text-[10px] tabular-nums shrink-0 ${
                    isActive ? 'text-[var(--accent-editorial)] font-semibold' : 'opacity-55'
                  }`}
                >
                  {indexStr}
                </span>
              )}
              <span className="line-clamp-2 leading-snug">{item.text}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

