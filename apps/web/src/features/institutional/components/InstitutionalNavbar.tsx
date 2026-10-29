'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Smart Navbar / Auto-Hiding Navbar:
 * - Oculta suavemente na rolagem para baixo (translateY(-100%), opacity-0)
 * - Reaparece na rolagem para cima com elevação e sombra sutil
 * - Integração limpa no topo (y=0)
 * - Performance otimizada com threshold de delta (8px), requestAnimationFrame e listener passivo
 * - Acessibilidade completa com suporte a menu mobile e navegação por teclado (Escape)
 * - Restrição estrita: sem barra de busca, sem seletor de tema e sem botão 'Criar conta'
 */

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { SunburstEmblem } from './SunburstEmblem';
import {
  calculateReadingProgress,
  evaluateSmartNavbarScroll,
} from '../utils/sstCalculations';

export interface InstitutionalNavbarProps {
  activeSection?: string;
  themeMode?: 'alabaster' | 'noir';
  onToggleTheme?: () => void;
  onOpenLogin?: () => void;
  onOpenSearch?: () => void;
  isNotFoundView?: boolean;
  onNavigateHome?: (targetHash?: string) => void;
}

const NAV_LINKS = [
  { label: 'A Ideia', href: '#ideia', id: 'ideia' },
  { label: 'Cadernos', href: '#ensaio', id: 'ensaio' },
  { label: 'Módulos', href: '#modulos', id: 'modulos' },
  { label: 'Plataforma', href: '#tecnologia', id: 'tecnologia' },
  { label: 'Equipe', href: '#criadores', id: 'criadores' },
  { label: 'Dúvidas', href: '#faq', id: 'faq' },
  { label: 'Artigos', href: '/artigos', id: 'artigos' },
  { label: 'Sobre', href: '/sobre', id: 'sobre-page' },
] as const;

export const InstitutionalNavbar: React.FC<InstitutionalNavbarProps> = ({
  activeSection = 'hero',
  isNotFoundView = false,
  onNavigateHome,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const isHomeRoute = pathname === '/';

  const [atTop, setAtTop] = useState(true);
  const [isHidden, setIsHidden] = useState(false);
  const [isElevated, setIsElevated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const progressBarRef = useRef<HTMLDivElement>(null);
  const lastScrollYRef = useRef(0);
  const isHiddenRef = useRef(false);
  const atTopRef = useRef(true);
  const isElevatedRef = useRef(false);
  const mobileMenuOpenRef = useRef(false);

  // Trava o fechamento/ocultação da navbar quando o menu mobile está aberto
  useEffect(() => {
    mobileMenuOpenRef.current = mobileMenuOpen;
    if (mobileMenuOpen && isHiddenRef.current) {
      isHiddenRef.current = false;
      setIsHidden(false);
    }
  }, [mobileMenuOpen]);

  // Teclado (Escape fecha o menu) e resize fecha drawer no desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpenRef.current) {
        setMobileMenuOpen(false);
      }
    };
    const handleResize = () => {
      if (window.innerWidth >= 1280 && mobileMenuOpenRef.current) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Detector inteligente de rolagem com requestAnimationFrame e tolerância (threshold)
  useEffect(() => {
    const barEl = progressBarRef.current;
    let rafId = 0;

    const updateOnScroll = () => {
      rafId = 0;
      const currentY = window.scrollY;

      const nextState = evaluateSmartNavbarScroll({
        currentScrollY: currentY,
        prevScrollY: lastScrollYRef.current,
        prevHidden: isHiddenRef.current,
        mobileMenuOpen: mobileMenuOpenRef.current,
        threshold: 8,
        topOffset: 16,
      });

      lastScrollYRef.current = nextState.lastScrollY;

      if (nextState.atTop !== atTopRef.current) {
        atTopRef.current = nextState.atTop;
        setAtTop(nextState.atTop);
      }
      if (nextState.isHidden !== isHiddenRef.current) {
        isHiddenRef.current = nextState.isHidden;
        setIsHidden(nextState.isHidden);
      }
      if (nextState.isElevated !== isElevatedRef.current) {
        isElevatedRef.current = nextState.isElevated;
        setIsElevated(nextState.isElevated);
      }

      if (barEl) {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const pct = calculateReadingProgress(currentY, maxScroll);
        barEl.style.transform = `scaleX(${(pct / 100).toFixed(4)})`;
      }
    };

    const handleScroll = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(updateOnScroll);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    updateOnScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const effectiveHidden = isHidden && !mobileMenuOpen;

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setMobileMenuOpen(false);
    if (href.startsWith('#')) {
      e.preventDefault();
      if (isNotFoundView && onNavigateHome) {
        onNavigateHome(href);
        return;
      }
      if (!isHomeRoute) {
        router.push(href === '#hero' ? '/' : `/${href}`);
        return;
      }
      const id = href.slice(1);
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.pushState(null, '', href);
      } else if (href === '#hero') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        window.history.pushState(null, '', '/');
      }
      return;
    }
  };

  return (
    <header
      data-testid="smart-navbar"
      data-navbar-state={effectiveHidden ? 'hidden' : isElevated ? 'elevated' : 'top'}
      className={`fixed top-0 left-0 right-0 z-50 will-change-transform transition-[transform,opacity,background-color,box-shadow,border-color,padding] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] border-b ${
        effectiveHidden
          ? '-translate-y-full opacity-0 pointer-events-none'
          : 'translate-y-0 opacity-100'
      } ${
        isElevated || mobileMenuOpen
          ? 'bg-[var(--bg-glass-strong)] backdrop-blur-2xl border-[var(--border-hairline)] shadow-[0_12px_32px_-12px_rgba(0,0,0,0.22)] py-2.5 sm:py-3.5 2xl:py-4'
          : atTop
          ? 'bg-[var(--bg-glass)] backdrop-blur-md border-[var(--border-hairline)] shadow-none py-3.5 sm:py-4 2xl:py-5'
          : 'bg-[var(--bg-glass-strong)] backdrop-blur-xl border-[var(--border-hairline)] py-3 sm:py-3.5'
      }`}
    >
      <nav
        role="navigation"
        aria-label="Navegação Institucional"
        className="w-full max-w-[1920px] 3xl:max-w-[2200px] 4xl:max-w-[2560px] mx-auto px-4 sm:px-8 lg:px-16 2xl:px-24 3xl:px-32 4xl:px-44 flex items-center justify-between gap-4 lg:gap-6"
      >
        {/* Marca Editorial com o Ícone Oficial do Círculo Dourado (SunburstEmblem) */}
        <a
          href={isHomeRoute ? '#hero' : '/'}
          onClick={(e) => handleLinkClick(e, '#hero')}
          data-testid="brand-wordmark"
          className="font-editorial text-lg sm:text-2xl 2xl:text-[26px] font-medium tracking-[-0.01em] text-[var(--text-primary)] whitespace-nowrap shrink-0 min-h-[44px] inline-flex items-center gap-2.5 transition-opacity hover:opacity-85"
        >
          <SunburstEmblem size={26} strokeColor="#B27E29" dotColor="#B27E29" />
          <span>
            Base <span className="text-[#B27E29]">SST</span>
          </span>
        </a>

        {/* Links Centrais de Navegação */}
        <div className="hidden xl:flex items-center gap-5 2xl:gap-7 text-[13px] 2xl:text-sm font-normal">
          {NAV_LINKS.map((link) => {
            const isSectionLink = link.href.startsWith('#');
            const isActive = isSectionLink
              ? isHomeRoute && !isNotFoundView && activeSection === link.id
              : pathname === link.href;
            const resolvedHref = isSectionLink && !isHomeRoute ? `/${link.href}` : link.href;

            return isSectionLink ? (
              <a
                key={link.id}
                href={resolvedHref}
                onClick={(e) => handleLinkClick(e, link.href)}
                aria-current={isActive ? 'location' : undefined}
                className={`relative min-h-[44px] inline-flex items-center py-1 transition-colors duration-200 whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-[var(--text-primary)] font-medium'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-1.5 left-0 right-0 h-[1px] bg-[var(--text-primary)]" />
                )}
              </a>
            ) : (
              <Link
                key={link.id}
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className={`relative min-h-[44px] inline-flex items-center py-1 transition-colors duration-200 whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-[var(--text-primary)] font-medium'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-1.5 left-0 right-0 h-[1px] bg-[var(--text-primary)]" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Ações Restritas: Artigos + Entrar (Sem busca, sem troca de tema e sem criar conta) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/artigos"
            className="inline-flex items-center justify-center min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--accent-editorial)] text-white hover:opacity-90 shadow-sm transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <span>Ver Artigos</span>
          </Link>

          <Link
            href="/login"
            aria-current={pathname === '/login' ? 'page' : undefined}
            className={`inline-flex items-center justify-center min-h-[40px] px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap shrink-0 cursor-pointer ${
              pathname === '/login'
                ? 'bg-[var(--text-primary)] text-[var(--bg-canvas)] font-semibold'
                : 'text-[var(--text-primary)] glass-interactive-tile hover:opacity-90'
            }`}
          >
            <span>Entrar</span>
          </Link>

          {/* Botão de Menu Hambúrguer Mobile com Acessibilidade ARIA */}
          <button
            type="button"
            data-testid="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="xl:hidden flex items-center justify-center min-w-[40px] min-h-[40px] rounded-lg glass-interactive-tile cursor-pointer"
            aria-label={mobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
            aria-expanded={mobileMenuOpen}
            aria-controls="smart-navbar-mobile-drawer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Linha discreta de progresso de leitura */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 right-0 h-[1px] bg-transparent overflow-hidden pointer-events-none"
      >
        <div
          ref={progressBarRef}
          style={{
            transform: 'scaleX(0)',
            transformOrigin: 'left center',
          }}
          className="h-full w-full bg-[var(--accent-editorial)] opacity-60 will-change-transform"
        />
      </div>

      {/* Menu Drawer Mobile */}
      {mobileMenuOpen && (
        <div
          id="smart-navbar-mobile-drawer"
          role="region"
          aria-label="Menu de navegação móvel"
          className="fixed inset-x-3 sm:inset-x-6 top-[4.25rem] p-5 sm:p-6 rounded-xl atelier-glass xl:hidden flex flex-col gap-3 text-sm z-50 shadow-2xl border border-[var(--border-glass)]"
          style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
        >
          <div className="flex flex-col divide-y divide-[var(--border-hairline)]">
            {NAV_LINKS.map((link) => {
              const isSectionLink = link.href.startsWith('#');
              const resolvedHref = isSectionLink && !isHomeRoute ? `/${link.href}` : link.href;
              return isSectionLink ? (
                <a
                  key={link.id}
                  href={resolvedHref}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className="flex items-center justify-between min-h-[48px] py-3 px-2 text-[var(--text-primary)] hover:text-[var(--accent-editorial)] transition-colors"
                >
                  <span className="font-medium">{link.label}</span>
                  <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                </a>
              ) : (
                <Link
                  key={link.id}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between min-h-[48px] py-3 px-2 text-[var(--text-primary)] hover:text-[var(--accent-editorial)] transition-colors"
                >
                  <span className="font-medium">{link.label}</span>
                  <ArrowUpRight className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                </Link>
              );
            })}
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <Link
              href="/artigos"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full min-h-[48px] py-2.5 px-4 rounded-lg text-center text-xs font-semibold bg-[var(--accent-editorial)] text-white flex items-center justify-center cursor-pointer"
            >
              Catálogo de Artigos
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full min-h-[48px] py-2.5 px-4 rounded-lg text-center text-xs font-medium glass-interactive-tile flex items-center justify-center text-[var(--text-primary)] cursor-pointer"
            >
              Entrar
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
