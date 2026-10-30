'use client';
import React, { useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { LogoMark } from '@/components/ui/Logo';
import { Bell, Bookmark, Moon, Sun } from 'lucide-react';
import { HeaderSearch } from '@/features/search/components/HeaderSearch';
import { Category } from '@/features/articles/types';
import { PillNav, type PillNavItem } from './PillNav';

export interface AppHeaderProps {
  drawerId: string;
  drawerOpen: boolean;
  onToggleDrawer: () => void;
  toggleRef: React.RefObject<HTMLButtonElement | null>;
  queueCount: number;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onAlerts: () => void;
  onHome: () => void;
  accountSlot: React.ReactNode;
  currentCategory?: Category | null;
  onSelectCategory?: (cat: Category | null) => void;
}

function useSafePathname(): string {
  try {
    return usePathname() || '/artigos';
  } catch {
    return '/artigos';
  }
}

function useSafeCategoryParam(): string | null {
  try {
    const params = useSearchParams();
    return params?.get('category') ?? null;
  } catch {
    return null;
  }
}

const APP_PILL_ITEMS: Array<PillNavItem & { category: Category | null }> = [
  { label: 'Catálogo', href: '/artigos', category: null },
  { label: 'GRO & PGR', href: '/artigos?category=GRO', category: Category.GRO },
  { label: 'eSocial', href: '/artigos?category=eSocial', category: Category.ESOCIAL },
  { label: 'Eventos', href: '/artigos?category=Eventos', category: Category.EVENTOS },
  {
    label: 'Informações',
    href: `/artigos?category=${encodeURIComponent(Category.INFORMACOES)}`,
    category: Category.INFORMACOES,
  },
  { label: 'Coletivo', href: '/artigos?category=Coletivo', category: Category.COLETIVO },
  { label: 'Tecnologia', href: '/artigos?category=Tecnologia', category: Category.TI },
  { label: 'Sobre', href: '/sobre', category: Category.SOBRE },
];

/** Ícone com dica de vidro (mesmo padrão para todas as ações do cabeçalho). */
function HeaderAction({ tip, children }: { tip: string; children: React.ReactNode }) {
  return (
    <div className="group relative flex items-center">
      {children}
      <span className="nav-tooltip" aria-hidden="true">
        {tip}
      </span>
    </div>
  );
}

/**
 * Cabeçalho flutuante do aplicativo com <PillNav /> (React Bits).
 *
 * Rolar para baixo esconde (só transform); para cima, volta. Depois de 24px o vidro
 * fica mais denso. Não some com o menu aberto, com a busca aberta ou com o foco dentro dele.
 */
export function AppHeader({
  drawerOpen = false,
  queueCount,
  isDarkMode,
  onToggleTheme,
  onAlerts,
  onHome,
  accountSlot,
  currentCategory,
  onSelectCategory,
}: AppHeaderProps) {
  const headerRef = useRef<HTMLElement>(null);
  const drawerOpenRef = useRef(drawerOpen);
  const pathname = useSafePathname();
  const categoryParam = useSafeCategoryParam();

  useEffect(() => {
    drawerOpenRef.current = drawerOpen;
    if (drawerOpen) headerRef.current?.removeAttribute('data-hidden');
  }, [drawerOpen]);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;
    let lastY = window.scrollY;
    let frame = 0;
    let scrolled = false;
    let hidden = false;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const nextScrolled = y > 24;
      const pinned =
        drawerOpenRef.current ||
        header.contains(document.activeElement) ||
        header.querySelector('.header-search[data-open]') !== null;
      let nextHidden = hidden;
      if (pinned || y < 80) nextHidden = false;
      else if (y > lastY + 4) nextHidden = true;
      else if (y < lastY - 4) nextHidden = false;
      lastY = y;

      if (nextScrolled !== scrolled) {
        scrolled = nextScrolled;
        header.toggleAttribute('data-scrolled', scrolled);
      }
      if (nextHidden !== hidden) {
        hidden = nextHidden;
        header.toggleAttribute('data-hidden', hidden);
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

  const activeHref = useMemo(() => {
    if (pathname === '/sobre' || currentCategory === Category.SOBRE) {
      return '/sobre';
    }
    const activeCat = (categoryParam as Category | null) ?? currentCategory ?? null;
    if (activeCat) {
      const matched = APP_PILL_ITEMS.find((item) => item.category === activeCat);
      if (matched?.href) return matched.href;
    }
    return '/artigos';
  }, [pathname, categoryParam, currentCategory]);

  const queueLabel = `Minha Lista (${queueCount} ${queueCount === 1 ? 'item salvo' : 'itens salvos'})`;

  return (
    <header
      ref={headerRef}
      className="app-header"
      data-theme={isDarkMode ? 'dark' : 'light'}
      aria-label="Cabeçalho de navegação"
    >
      <div className="app-header-left">
        <PillNav
          logo={<LogoMark size={22} className="app-header-brand-mark" />}
          logoAlt="Início"
          logoHref="/"
          onLogoClick={onHome}
          linkComponent={Link}
          items={APP_PILL_ITEMS}
          activeHref={activeHref}
          onItemClick={(_item, index, event) => {
            const target = APP_PILL_ITEMS[index];
            if (target && onSelectCategory) {
              event.preventDefault();
              onSelectCategory(target.category);
            }
          }}
          theme={isDarkMode ? 'dark' : 'light'}
          layout="split"
          size="md"
          surface="glass"
          itemStyle="pill"
          hoverEffect="fill"
          indicator="dot"
          collapse="never"
          ariaLabel="Módulos da Base SST"
        />
      </div>

      <div className="app-header-actions">
        <HeaderSearch />
        <HeaderAction tip="Alertas">
          <button
            type="button"
            className="nav-icon-button"
            aria-label="Alertas"
            onClick={onAlerts}
          >
            <Bell size={18} strokeWidth={1.7} aria-hidden="true" />
          </button>
        </HeaderAction>
        <HeaderAction tip={isDarkMode ? 'Modo claro' : 'Modo escuro'}>
          <button
            type="button"
            data-testid="app-theme-toggle"
            className="nav-icon-button nav-theme-toggle"
            aria-label={isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
            aria-pressed={isDarkMode}
            data-dark={isDarkMode || undefined}
            onClick={onToggleTheme}
          >
            <Sun size={18} strokeWidth={1.7} aria-hidden="true" className="nav-theme-sun" />
            <Moon size={17} strokeWidth={1.7} aria-hidden="true" className="nav-theme-moon" />
          </button>
        </HeaderAction>
        <HeaderAction tip="Minha Lista">
          <Link href="/minha-lista" aria-label={queueLabel} className="nav-icon-button">
            <Bookmark size={18} strokeWidth={1.7} aria-hidden="true" />
            {queueCount > 0 && (
              <span className="nav-badge" aria-hidden="true">
                {queueCount}
              </span>
            )}
          </Link>
        </HeaderAction>
        {accountSlot}
      </div>
    </header>
  );
}
