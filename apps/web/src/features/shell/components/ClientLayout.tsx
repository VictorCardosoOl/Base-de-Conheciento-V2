'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '@/features/navigation/components/Sidebar';
import { Footer } from '@/features/navigation/components/Footer';
import { InstitutionalNavbar } from '@/features/institutional/components/InstitutionalNavbar';
import { InstitutionalFooter } from '@/features/institutional/components/InstitutionalFooter';
import { useConsent } from '@/features/consent/ConsentContext';
import { useReadingQueue } from '@/features/reading/use-reading-queue';
import { initTelemetry, stopTelemetry } from '@/features/analytics/telemetry';
import { SessionSummaryContext, useSessionSummary } from '@/features/auth/use-session-summary';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Category, FAQItem } from '@/features/articles/types';
import { useThemePreference } from '../use-theme-preference';
import { useCommandPaletteShortcuts } from '../use-command-palette-shortcuts';
import { LiquidGlassEffects } from './LiquidGlassEffects';
import { SmoothScroll } from './SmoothScroll';
import { ToastProvider } from '@/components/ui/Toast';

import { CommandPalette } from '@/features/search/components/CommandPalette';
import { BackToTopButton } from './BackToTopButton';
import { CookieBanner } from '@/features/consent/components/CookieBanner';

const MAIN_LAYOUT_PADDING_CLASS = 'pt-24 md:pt-32 2xl:pt-40 3xl:pt-48 4xl:pt-56 px-6 md:px-12 2xl:px-16 3xl:px-24 4xl:px-32';
const SOBRE_CATEGORY = 'Sobre' as Category;

/** Notificações (toasts) disponíveis para todas as páginas e para a navegação. */
export function ClientLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ToastProvider>
      <ClientLayoutContent>{children}</ClientLayoutContent>
    </ToastProvider>
  );
}

function ClientLayoutContent({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { isDarkMode, setIsDarkMode } = useThemePreference();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);

  const pathname = usePathname();
  const router = useRouter();
  const { queue } = useReadingQueue();
  const { hasConsented } = useConsent();
  // Uma consulta por carregamento, compartilhada pela navegação (só UX, não autorização).
  const session = useSessionSummary();

  const isArticleRoute = pathname?.startsWith('/artigo/');

  // Consentimento é revogável a qualquer momento: sem ele, o monitoramento para na hora.
  useEffect(() => {
    if (hasConsented) initTelemetry();
    else stopTelemetry();
  }, [hasConsented]);

  const isAuthRoute =
    pathname === '/login' ||
    pathname === '/cadastro' ||
    pathname === '/cadastro/social' ||
    pathname === '/esqueci-senha' ||
    pathname === '/redefinir-senha' ||
    pathname === '/verificar-email';
  const isInstitutionalLanding = pathname === '/';
  const isAuthenticated = Boolean(session && session.authenticated);
  const isPublicInstitutionalOrAuth =
    isInstitutionalLanding || isAuthRoute || (pathname === '/sobre' && !isAuthenticated);

  useCommandPaletteShortcuts(setIsCommandPaletteOpen, isArticleRoute, !isPublicInstitutionalOrAuth);

  const handleCategorySelect = (cat: Category | null) => {
    setCurrentCategory(cat);
    if (cat === SOBRE_CATEGORY) {
      router.push('/sobre');
    } else if (cat) {
      router.push(`/artigos?category=${encodeURIComponent(cat)}`);
    } else {
      router.push('/artigos');
    }
  };

  const isSobreRoute = pathname === '/sobre';
  const effectiveCategory = isSobreRoute ? SOBRE_CATEGORY : currentCategory;

  const toggleDark = () => setIsDarkMode((prev) => !prev);
  const goToQueue = (close?: () => void) => {
    router.push('/minha-lista');
    close?.();
  };
  const closePalette = () => setIsCommandPaletteOpen(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Transição entre páginas: o conteúdo assenta (só transform e opacity, curta). Abrir ou
  // fechar um artigo não anima o fundo: o artigo vem por cima (modal) e o resto fica parado.
  const previousPath = useRef(pathname);
  useGSAP(() => {
    const from = previousPath.current;
    previousPath.current = pathname;
    if (!containerRef.current || from === pathname) return;
    if (from?.startsWith('/artigo/') || pathname?.startsWith('/artigo/')) return;
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.32, ease: 'expo.out', overwrite: 'auto', clearProps: 'transform,opacity' }
      );
    });
    return () => mm.revert();
  }, [pathname]);

  // Nas rotas de login/cadastro (e /sobre público), exibe exatamente a mesma InstitutionalNavbar e InstitutionalFooter da Home (/)
  const useInstitutionalChrome =
    !isInstitutionalLanding && (isAuthRoute || (pathname === '/sobre' && !isAuthenticated));

  const sidebar = useInstitutionalChrome ? (
    <InstitutionalNavbar
      activeSection={pathname === '/sobre' ? 'sobre-page' : 'hero'}
      onOpenLogin={() => router.push('/login')}
    />
  ) : isInstitutionalLanding && !isAuthenticated ? null : (
    <Sidebar
      currentCat={effectiveCategory}
      onSelect={handleCategorySelect}
      isDarkMode={isDarkMode}
      toggleDark={toggleDark}
      onSelectQueue={() => goToQueue()}
      queueCount={queue.length}
      onLogoClick={() => setCurrentCategory(null)}
      session={session}
    />
  );

  const commandPalette = isCommandPaletteOpen && (
    <Suspense fallback={null}>
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={closePalette}
        onSelectArticle={(a: FAQItem) => {
          router.push(`/artigo/${a.id}`, { scroll: false });
          closePalette();
        }}
        onToggleTheme={toggleDark}
        isDarkMode={isDarkMode}
        onSelectCategory={(cat: Category | null) => {
          handleCategorySelect(cat);
          closePalette();
        }}
        onSelectQueue={() => goToQueue(closePalette)}
      />
    </Suspense>
  );

  return (
    <SessionSummaryContext.Provider value={session}>
      {isInstitutionalLanding ? (
        <>
          <div className="relative z-10 flex min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] selection:bg-selection">
            <main className="flex-1 w-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] relative">
              <div className="w-full">
                <div ref={containerRef} className="w-full">
                  {children}
                </div>
              </div>
            </main>
          </div>
          <Suspense fallback={null}>
            <BackToTopButton />
            <CookieBanner />
          </Suspense>
        </>
      ) : (
        <SmoothScroll>
          <LiquidGlassEffects />
          {/* Conteúdo acima do fundo (z-10). */}
          <div className="relative z-10 flex min-h-screen selection:bg-selection">
            {sidebar}
            {commandPalette}

            <main
              className="flex-1 w-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] relative"
            >
              <div
                className={`max-w-[2000px] 3xl:max-w-[2240px] 4xl:max-w-[2560px] mx-auto w-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                            ${
                              isArticleRoute
                                ? 'px-4 sm:px-8 md:px-12 2xl:px-16 3xl:px-24 4xl:px-32 pt-20 md:pt-24 2xl:pt-32 pb-16 2xl:pb-24'
                                : `px-5 sm:px-8 2xl:px-16 3xl:px-24 4xl:px-32 max-lg:pt-24 max-lg:pb-12 lg:pt-28 lg:pb-12 2xl:pb-20 3xl:pb-28 4xl:pb-36 ${MAIN_LAYOUT_PADDING_CLASS}`
                            }
                        `}
              >
                <div ref={containerRef} className="w-full">
                  {children}
                </div>
              </div>
            </main>
          </div>

          {useInstitutionalChrome ? (
            <InstitutionalFooter
              onOpenLogin={() => router.push('/login')}
              onOpenRegister={() => router.push('/cadastro')}
              onOpenSearch={() => setIsCommandPaletteOpen(true)}
            />
          ) : (
            <Footer />
          )}

          <Suspense fallback={null}>
            <BackToTopButton />
            <CookieBanner />
          </Suspense>
        </SmoothScroll>
      )}
    </SessionSummaryContext.Provider>
  );
}
