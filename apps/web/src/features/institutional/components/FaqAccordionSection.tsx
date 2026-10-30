/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Plus, Minus, ArrowUpRight, Search, Copy, Check, X, BookOpen } from 'lucide-react';
import {
  PREVENCE_FAQ_CATEGORIES,
  PREVENCE_FAQ_ITEMS,
  SstFaqCategory,
  filterFaqItems,
  toggleFaqAccordionItem,
  formatNormativeCitation,
} from '../utils/sstCalculations';
import { useClipboardCopy } from '../hooks/useInteractiveHooks';

interface FaqAccordionSectionProps {
  onOpenCommandPalette: () => void;
  onSelectLabTab?: (tab: 'esocial' | 'gro' | 'ti' | 'juridico') => void;
}

export const FaqAccordionSection: React.FC<FaqAccordionSectionProps> = ({
  onOpenCommandPalette,
  onSelectLabTab,
}) => {
  const [activeCategory, setActiveCategory] = useState<SstFaqCategory>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openIds, setOpenIds] = useState<string[]>([PREVENCE_FAQ_ITEMS[0].id]);
  const [allowMultiple, setAllowMultiple] = useState<boolean>(false);

  const { copiedKey: copiedId, copyText } = useClipboardCopy(2500);

  const filteredItems = useMemo(
    () => filterFaqItems(activeCategory, searchQuery),
    [activeCategory, searchQuery]
  );

  const categoryCounts = useMemo(
    () =>
      PREVENCE_FAQ_CATEGORIES.reduce<Record<SstFaqCategory, number>>(
        (acc, cat) => ({
          ...acc,
          [cat.id]: filterFaqItems(cat.id).length,
        }),
        { todos: 0, esocial: 0, laudos: 0, previdenciario: 0, governanca: 0 }
      ),
    []
  );

  const allFilteredOpen =
    filteredItems.length > 0 && filteredItems.every((item) => openIds.includes(item.id));

  const handleToggleItem = (id: string) => {
    setOpenIds((prev) => toggleFaqAccordionItem(prev, id, allowMultiple));
  };

  const handleToggleAll = () => {
    if (allFilteredOpen) {
      setOpenIds([]);
    } else {
      setAllowMultiple(true);
      setOpenIds(filteredItems.map((item) => item.id));
    }
  };

  const handleCategoryChange = (category: SstFaqCategory) => {
    setActiveCategory(category);
    const nextFiltered = filterFaqItems(category, searchQuery);
    if (nextFiltered.length > 0 && !nextFiltered.some((item) => openIds.includes(item.id))) {
      setOpenIds([nextFiltered[0].id]);
    }
  };

  const handleActionClick = (itemCategory: SstFaqCategory, href: string) => {
    if (!onSelectLabTab || href !== '#laboratorio-normativo') return;
    if (itemCategory === 'esocial') onSelectLabTab('esocial');
    else if (itemCategory === 'laudos') onSelectLabTab('gro');
    else if (itemCategory === 'previdenciario') onSelectLabTab('juridico');
  };

  const handleCopyFaqCitation = (id: string, code: string, question: string, ref: string) => {
    const citation = formatNormativeCitation(`Parecer ${code}`, question, ref);
    void copyText(citation, id);
  };

  return (
    <section
      id="faq"
      data-testid="faq-accordion-section"
      className="relative border-b border-[var(--border-hairline)] bg-[var(--bg-paper)] py-20 lg:py-28 2xl:py-36 overflow-hidden"
    >
      <div className="relative z-10 w-full max-w-4xl 2xl:max-w-5xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* Editorial Section Header: Clean, Architectural, Aligned */}
        <div className="space-y-3 mb-10 sm:mb-12">
          <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[var(--accent-editorial)] block">
            Acervo Consultivo · Pareceres Técnicos
          </span>

          <h2 className="font-editorial text-3xl sm:text-4xl 2xl:text-5xl font-normal text-[var(--text-primary)] leading-[1.12]">
            Perguntas{' '}
            <span className="italic font-light text-[var(--accent-editorial)]">frequentes.</span>
          </h2>

          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl">
            Orientações objetivas fundamentadas na legislação previdenciária, nas Normas
            Regulamentadoras e no Manual de Orientação do eSocial (versão S-1.3).
          </p>
        </div>

        {/* Search Bar & Command Palette Shortcut */}
        <div className="mb-6 space-y-4">
          <div className="relative flex items-center">
            <Search className="absolute left-4 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar dúvida ou norma (ex: NR-15, S-2240, ruído, insalubridade)..."
              aria-label="Pesquisar perguntas frequentes"
              className="w-full h-12 pl-11 pr-24 rounded-xl border border-[var(--border-hairline)] bg-black/[0.02] dark:bg-white/[0.03] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-editorial)] focus:bg-[var(--bg-paper)] transition-all shadow-xs"
            />
            <div className="absolute right-3 flex items-center gap-1.5">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Limpar pesquisa"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={onOpenCommandPalette}
                title="Abrir índice completo (Ctrl+K)"
                className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono rounded-md bg-black/5 dark:bg-white/10 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              >
                <span>Ctrl+K</span>
              </button>
            </div>
          </div>

          {/* Segmented Category Filter Tabs */}
          <div
            role="tablist"
            aria-label="Filtrar perguntas frequentes por domínio"
            className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 border-b border-[var(--border-hairline)] pb-2"
          >
            {PREVENCE_FAQ_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              const count = categoryCounts[cat.id];
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="faq-accordion-list"
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`min-h-[36px] px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap cursor-pointer transition-all flex items-center gap-2 shrink-0 ${
                    isActive
                      ? 'bg-[var(--accent-editorial)] text-white shadow-xs font-semibold'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
                  }`}
                >
                  <span>{cat.label}</span>
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-black/20 text-white'
                        : 'bg-black/5 dark:bg-white/10 text-[var(--text-muted)]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Accordion Count & Expand/Collapse Toggle */}
        <div className="flex items-center justify-between pb-3 mb-2 text-xs text-[var(--text-secondary)]">
          <div>
            <span>
              Mostrando <strong className="text-[var(--text-primary)] font-medium">{filteredItems.length}</strong>{' '}
              {filteredItems.length === 1 ? 'parecer' : 'pareceres'}
            </span>
            {searchQuery && (
              <span className="text-[var(--accent-editorial)] ml-1">
                para &ldquo;{searchQuery}&rdquo;
              </span>
            )}
          </div>

          {filteredItems.length > 0 && (
            <button
              type="button"
              onClick={handleToggleAll}
              className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline underline-offset-4 transition-colors cursor-pointer"
            >
              {allFilteredOpen ? 'Recolher todas' : 'Expandir todas'}
            </button>
          )}
        </div>

        {/* Accordion Items List: Meticulously Aligned, Editorial Precision */}
        <div id="faq-accordion-list" className="divide-y divide-[var(--border-hairline)] border-t border-[var(--border-hairline)]">
          {filteredItems.length === 0 ? (
            <div className="text-center py-14 px-6 border border-dashed border-[var(--border-hairline)] rounded-xl my-4 space-y-3">
              <BookOpen className="w-8 h-8 mx-auto text-[var(--text-muted)] opacity-60" />
              <p className="text-sm font-medium text-[var(--text-primary)]">
                Nenhum parecer encontrado para os critérios selecionados.
              </p>
              <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">
                Tente buscar por outro termo ou selecione &ldquo;Todos os Domínios&rdquo; para ver todo o acervo.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('todos');
                }}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[var(--border-hairline)] text-xs font-medium text-[var(--text-primary)] hover:border-[var(--accent-editorial)] transition-colors cursor-pointer"
              >
                Limpar filtros de busca
              </button>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isOpen = openIds.includes(item.id);
              const panelId = `${item.id}-panel`;
              const buttonId = `${item.id}-trigger`;
              const isCopied = copiedId === item.id;

              return (
                <div
                  key={item.id}
                  data-testid={`faq-item-${item.indexCode}`}
                  className="py-5 sm:py-6 transition-colors"
                >
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => handleToggleItem(item.id)}
                    className="w-full text-left flex items-start justify-between gap-4 group focus-visible:outline-none cursor-pointer"
                  >
                    <div className="space-y-1.5 flex-1 pr-2">
                      {/* Technical Meta Strip: Aligned with Question */}
                      <div className="flex flex-wrap items-center gap-x-2 text-xs font-mono text-[var(--text-muted)]">
                        <span className="font-semibold text-[var(--accent-editorial)]">
                          Parecer {item.indexCode}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="text-[var(--text-secondary)] font-medium">
                          {item.categoryLabel}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{item.normativeRef}</span>
                      </div>

                      {/* Question Headline */}
                      <h3 className="font-editorial text-xl sm:text-2xl font-normal text-[var(--text-primary)] group-hover:text-[var(--accent-editorial)] transition-colors leading-snug">
                        {item.question}
                      </h3>
                    </div>

                    {/* Subtle Disclosure Affordance */}
                    <span
                      aria-hidden="true"
                      className={`mt-1 w-7 h-7 shrink-0 rounded-lg border flex items-center justify-center transition-all duration-200 ${
                        isOpen
                          ? 'border-[var(--accent-editorial)] bg-[var(--accent-editorial)] text-white shadow-xs'
                          : 'border-[var(--border-hairline)] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] group-hover:border-[var(--accent-editorial)]'
                      }`}
                    >
                      {isOpen ? (
                        <Minus className="w-3.5 h-3.5" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                    </span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={panelId}
                        role="region"
                        aria-labelledby={buttonId}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 space-y-4">
                          {/* Editorial Callout Quote */}
                          <div className="p-4 border-l-2 border-[var(--accent-editorial)] bg-black/[0.02] dark:bg-white/[0.02] rounded-r-lg">
                            <p className="font-editorial italic text-base sm:text-lg text-[var(--text-primary)] leading-relaxed">
                              &ldquo;{item.editorialPullQuote}&rdquo;
                            </p>
                          </div>

                          {/* Primary Normative Prose */}
                          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                            {item.answer}
                          </p>

                          {/* Practical Engineering Note & Citations */}
                          <div className="pt-4 border-t border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <p className="text-[var(--text-muted)] leading-relaxed max-w-xl">
                              <strong className="text-[var(--text-primary)] font-medium">
                                Nota técnica:{' '}
                              </strong>
                              {item.technicalNote}
                            </p>

                            <div className="flex flex-wrap items-center gap-3 shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  handleCopyFaqCitation(
                                    item.id,
                                    item.indexCode,
                                    item.question,
                                    item.normativeRef
                                  )
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-editorial)] transition-colors whitespace-nowrap cursor-pointer"
                              >
                                {isCopied ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                    <span className="text-emerald-700 dark:text-emerald-300 font-medium">Copiado</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copiar citação</span>
                                  </>
                                )}
                              </button>

                              <a
                                href={item.actionHref}
                                onClick={() => handleActionClick(item.category, item.actionHref)}
                                className="inline-flex items-center gap-1 font-medium text-[var(--text-primary)] hover:text-[var(--accent-editorial)] underline underline-offset-4 shrink-0 whitespace-nowrap"
                              >
                                <span>{item.actionLabel}</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};
