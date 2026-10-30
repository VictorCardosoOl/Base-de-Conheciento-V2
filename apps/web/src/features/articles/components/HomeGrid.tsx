'use client';
import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, SlidersHorizontal, BookOpen, Clock, ArrowRight } from 'lucide-react';
import { ArticleGrid } from './ArticleGrid';
import { FAQ_DATA } from '@/features/articles/catalog';
import { articleTime as timeOf, recentArticles, readingMinutes } from '@/features/articles/article-meta';
import { IntroHero } from './IntroHero';
import { Category } from '@/features/articles/types';
import { useSearch } from '@/features/search/use-search';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/StateMessage';

const SEARCH_KEYS = ['question', 'tags', 'answer', 'category', 'searchText'];
const SEARCH_OPTIONS = { keys: SEARCH_KEYS, threshold: 0.4 };

type Sort = 'relevance' | 'recent' | 'az';

/** Os mais recentes (publicados ou revisados), para o destaque da página inicial. */
const RECENT = recentArticles(3);

function useSafeSearchParams() {
  try {
    return useSearchParams();
  } catch {
    return null;
  }
}

function useSafeRouter() {
  try {
    return useRouter();
  } catch {
    return null;
  }
}

/**
 * Catálogo e Acervo Técnico: módulos em abas editoriais, busca instantânea,
 * ordenação analítica e cards no padrão de dossiê técnico.
 */
export function HomeGrid({ categoryParam }: { categoryParam: string | null }) {
  const router = useSafeRouter();
  const searchParams = useSafeSearchParams();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<Sort>('relevance');

  // Reatividade a query parameters no cliente
  const urlCategory = searchParams?.get('category');
  const activeCategory =
    urlCategory !== undefined && urlCategory !== null
      ? (urlCategory || null)
      : categoryParam;

  const inModule = useMemo(
    () => (activeCategory ? FAQ_DATA.filter((a) => a.category === activeCategory) : FAQ_DATA),
    [activeCategory]
  );

  const found = useSearch(inModule, query, SEARCH_OPTIONS);

  const articles = useMemo(() => {
    if (sort === 'recent') return [...found].sort((a, b) => timeOf(b) - timeOf(a));
    if (sort === 'az') return [...found].sort((a, b) => a.question.localeCompare(b.question, 'pt-BR'));
    return found;
  }, [found, sort]);

  if (activeCategory === Category.SOBRE) {
    return (
      <div className="w-full flex flex-col items-center justify-center">
        <IntroHero />
      </div>
    );
  }

  const filtering = query.trim().length > 0;
  const countLabel = `${articles.length} ${articles.length === 1 ? 'artigo' : 'artigos'}${
    activeCategory ? ` em ${activeCategory}` : ''
  }${filtering ? ` para "${query.trim()}"` : ''}`;

  const handleSelectModule = (cat: string | null) => {
    if (cat) {
      router?.push(`/artigos?category=${encodeURIComponent(cat)}`, { scroll: false });
    } else {
      router?.push('/artigos', { scroll: false });
    }
  };

  return (
    <div className="space-y-10 w-full max-w-[1720px] mx-auto pb-16">
      {/* Cabeçalho Editorial */}
      <header className="space-y-6 border-b border-[var(--border-hairline)] pb-8">
        <div className="space-y-3 max-w-4xl">
          <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent-editorial)] tracking-wider">
            <BookOpen size={14} className="shrink-0" aria-hidden="true" />
            <span>Saúde e Segurança do Trabalho &amp; eSocial</span>
          </div>

          <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.05] tracking-tight text-[var(--text-main)]">
            Base de Conhecimento
          </h1>

          <p className="text-text-muted text-sm sm:text-base leading-relaxed" aria-live="polite">
            {countLabel}
          </p>
        </div>

        {/* Barra de Busca e Ordenação (formato pílula harmonizado com o PillNav) */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2" role="search">
          <div className="relative flex-1">
            <span className="sr-only">Filtrar artigos{activeCategory ? ` de ${activeCategory}` : ''}</span>
            <Search
              size={17}
              aria-hidden="true"
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={
                activeCategory
                  ? `Buscar dentro do módulo ${activeCategory}...`
                  : 'Buscar por norma, agente, evento eSocial, CID ou palavra-chave...'
              }
              className="w-full h-11 pl-11 pr-11 rounded-full text-sm bg-[var(--bg-paper)] dark:bg-[var(--bg-island)] text-[var(--text-main)] border border-[var(--border-hairline)] focus:border-[var(--accent-editorial)] focus:outline-none transition-colors"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Limpar termo de busca"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <label className="flex items-center gap-2 h-11 px-4 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-paper)] dark:bg-[var(--bg-island)] text-xs font-mono text-[var(--text-secondary)]">
              <SlidersHorizontal size={14} className="text-[var(--text-muted)]" aria-hidden="true" />
              <span>Ordem:</span>
              <select
                className="bg-transparent text-[var(--text-main)] font-sans font-medium text-xs focus:outline-none cursor-pointer"
                value={sort}
                onChange={(event) => setSort(event.target.value as Sort)}
              >
                <option value="relevance">{filtering ? 'Relevância da busca' : 'Destaque curricular'}</option>
                <option value="recent">Mais recentes primeiro</option>
                <option value="az">Alfabética (A-Z)</option>
              </select>
            </label>

            {activeCategory && (
              <button
                type="button"
                onClick={() => handleSelectModule(null)}
                className="h-11 px-4 rounded-full text-xs font-medium text-[var(--accent-editorial)] border border-[var(--accent-editorial)]/25 hover:bg-[var(--accent-editorial)]/10 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                title="Limpar filtro de módulo"
              >
                <X size={14} />
                <span>Ver todos</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Seção de Atualizados Recentemente (Aparece apenas sem busca e no acervo geral) */}
      {!activeCategory && !filtering && RECENT.length > 0 && (
        <section aria-labelledby="secao-recentes" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 id="secao-recentes" className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
              Publicações &amp; Revisões Técnicas Recentes
            </h2>
            <span className="text-xs font-mono text-[var(--text-muted)]">Validação pericial</span>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {RECENT.map((item) => {
              const minutes = readingMinutes(item.searchText);
              return (
                <article
                  key={item.id}
                  className="group relative rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-paper)] dark:bg-[var(--bg-island)] hover:border-[var(--accent-editorial)] p-5 flex flex-col justify-between gap-4 transition-all duration-200"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
                      <span className="font-semibold text-[var(--accent-editorial)]">{item.category}</span>
                      <span className="tabular-nums">{item.lastReviewed || item.date}</span>
                    </div>

                    <h3 className="font-editorial text-lg leading-snug font-medium text-[var(--text-main)] group-hover:text-[var(--accent-editorial)] transition-colors line-clamp-2">
                      <Link href={`/artigo/${item.id}`} scroll={false} className="after:absolute after:inset-0">
                        {item.question}
                      </Link>
                    </h3>

                    <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[var(--border-hairline)] flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span className="inline-flex items-center gap-1 text-[var(--text-main)] font-medium group-hover:text-[var(--accent-editorial)] transition-colors">
                      <span>Acessar dossiê</span>
                      <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                    {minutes ? (
                      <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                        <Clock size={12} />
                        <span>{minutes} min</span>
                      </span>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Grid Principal dos Artigos */}
      <section aria-label="Lista de artigos técnicos">
        {articles.length ? (
          <ArticleGrid key={activeCategory ?? 'todos'} items={articles} />
        ) : filtering ? (
          <EmptyState
            className="glass-card my-12"
            icon={<Search size={22} aria-hidden="true" />}
            title={`Nenhum dossiê encontrado para "${query.trim()}"`}
            action={
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setQuery('')}>
                  <X size={14} aria-hidden="true" /> Limpar busca
                </Button>
                {activeCategory && (
                  <Button size="sm" variant="ghost" onClick={() => handleSelectModule(null)}>
                    Buscar em todos os módulos
                  </Button>
                )}
              </div>
            }
          >
            Tente buscar por termos técnicos alternativos (ex.: PGR, S-2240, insalubridade, ruído) ou limpe o filtro do módulo.
          </EmptyState>
        ) : (
          <EmptyState
            className="glass-card my-12"
            title="Nenhum artigo neste módulo ainda."
          >
            Este caderno técnico está sendo atualizado conforme as diretrizes do Ministério do Trabalho.
          </EmptyState>
        )}
      </section>
    </div>
  );
}
