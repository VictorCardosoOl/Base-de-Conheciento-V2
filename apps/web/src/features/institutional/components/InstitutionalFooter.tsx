'use client';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowUp, ArrowUpRight } from 'lucide-react';
import {
  INSTITUTIONAL_FOOTER_LINKS,
  INSTITUTIONAL_SOCIAL_CHANNELS,
  formatFooterCopyright,
  type FooterSocialChannel,
} from '../utils/sstCalculations';

export interface InstitutionalFooterProps {
  onOpenLogin?: () => void;
  onOpenRegister?: () => void;
  onOpenSearch?: () => void;
  onSelectDossierCode?: (code: string) => void;
  isNotFoundView?: boolean;
  onNavigateHome?: (targetHash?: string) => void;
}

const CATALOG_MODULE_LINKS = [
  { label: 'GRO · PGR, PCMSO e LTCAT', href: '/artigos?category=GRO', code: 'NR-01' },
  { label: 'eSocial · Guia e e-CAC', href: '/artigos?category=eSocial', code: 'e-CAC' },
  { label: 'Eventos SST · S-2210 a S-2240', href: '/artigos?category=Eventos', code: 'S-2240' },
  { label: 'Informações · CAT e Previdência', href: '/artigos?category=Informa%C3%A7%C3%B5es', code: 'LTCAT' },
  { label: 'Coletivo · Atendimento e Feedback 24h', href: '/artigos?category=Coletivo', code: 'NR-07' },
  { label: 'Tecnologia · XML, SMTP e VPN', href: '/artigos?category=Tecnologia', code: 'e-CAC' },
] as const;

function renderSocialIcon(id: FooterSocialChannel['id']) {
  switch (id) {
    case 'linkedin':
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
        </svg>
      );
    case 'github':
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
          />
        </svg>
      );
    case 'instagram':
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      );
    case 'youtube':
      return (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
  }
}

export const InstitutionalFooter: React.FC<InstitutionalFooterProps> = ({
  onOpenSearch,
  onSelectDossierCode,
  isNotFoundView = false,
  onNavigateHome,
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const isHomeRoute = pathname === '/';
  const currentYear = new Date().getFullYear();

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSectionAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
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
      }
    }
  };

  return (
    <footer
      data-testid="institutional-footer"
      aria-label="Rodapé Institucional Base de Conhecimento"
      className="relative overflow-hidden border-t border-[var(--border-hairline)] mesh-gradient-footer bg-[var(--bg-canvas)] text-[var(--text-primary)] pt-14 pb-12 lg:pt-24 lg:pb-16 2xl:pt-32 2xl:pb-24 3xl:pt-40 3xl:pb-32 4xl:pt-48 4xl:pb-36"
      style={{ paddingBottom: 'max(3rem, env(safe-area-inset-bottom))' }}
    >
      <div className="relative z-10 w-full max-w-[1920px] 3xl:max-w-[2200px] 4xl:max-w-[2560px] mx-auto px-4 sm:px-8 lg:px-16 2xl:px-24 3xl:px-32 4xl:px-44">
        {/* Main Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-10 2xl:gap-16 pb-12 lg:pb-20 border-b border-[var(--border-hairline)]">
          {/* Column 1-5: Brand Identity & Project Context */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6 sm:space-y-8">
            <div className="space-y-4">
              <a
                href={isHomeRoute ? '#hero' : '/'}
                onClick={(e) => handleSectionAnchorClick(e, '#hero')}
                className="group block focus:outline-none"
                aria-label="Base SST — Voltar ao início"
              >
                <span className="block font-editorial text-3xl sm:text-4xl 2xl:text-[42px] font-normal tracking-[-0.01em] leading-[1.08] text-[var(--text-primary)]">
                  Base <span className="text-[#B27E29]">SST</span>{' '}
                  <span className="italic font-light text-[var(--accent-editorial)]">
                    &amp; eSocial
                  </span>
                </span>
              </a>

              <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-prose">
                Portal colaborativo de procedimentos operacionais, eventos do eSocial (S-2210,
                S-2220, S-2221 e S-2240), Gestão de Riscos Ocupacionais (PGR, PCMSO, LTCAT) e
                padronização de atendimento técnico.
              </p>
            </div>

            <div className="pt-2 space-y-2 text-xs text-[var(--text-muted)]">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                <span>
                  Idealizado por <strong className="text-[var(--text-primary)] font-medium">Victor Cardoso</strong> &amp;{' '}
                  <strong className="text-[var(--text-primary)] font-medium">Guilherme Cruz</strong>
                </span>
                <span aria-hidden="true">·</span>
                <span>Consultoria Técnica: Sabrina Fraguela &amp; João Sanchez</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span>Ciclo de Revisão de 12 Meses</span>
                <span aria-hidden="true">·</span>
                <span>6 Módulos Operacionais</span>
                <span aria-hidden="true">·</span>
                <span>Leiaute eSocial S-1.3</span>
              </div>
            </div>
          </div>

          {/* Column 6-8: Institutional Navigation Links */}
          <div className="lg:col-span-3 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Navegação do Portal
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-1">
              {INSTITUTIONAL_FOOTER_LINKS.map((link) => {
                const resolvedHref =
                  link.href.startsWith('#') && !isHomeRoute ? `/${link.href}` : link.href;
                return (
                  <li key={link.id}>
                    <a
                      href={resolvedHref}
                      onClick={(e) => handleSectionAnchorClick(e, link.href)}
                      className="min-h-[40px] inline-flex items-center text-xs sm:text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors py-1"
                    >
                      <span>{link.label}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Column 9-10: Real Modules & Platform Access */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Módulos do Acervo
            </h2>
            <ul className="space-y-1">
              {CATALOG_MODULE_LINKS.map((mod) => (
                <li key={mod.label}>
                  {onSelectDossierCode && isHomeRoute ? (
                    <button
                      type="button"
                      onClick={() => onSelectDossierCode(mod.code)}
                      className="min-h-[40px] inline-flex items-center text-left text-xs sm:text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors py-1 cursor-pointer"
                    >
                      {mod.label}
                    </button>
                  ) : (
                    <Link
                      href={mod.href}
                      className="min-h-[40px] inline-flex items-center text-left text-xs sm:text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors py-1"
                    >
                      {mod.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            <div className="pt-3 border-t border-[var(--border-hairline)] flex flex-col items-start gap-1 text-xs">
              {onOpenSearch && (
                <button
                  type="button"
                  onClick={onOpenSearch}
                  className="min-h-[40px] inline-flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors py-1 cursor-pointer"
                >
                  Buscar no acervo (Ctrl+K)
                </button>
              )}
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/login"
                  className="min-h-[40px] inline-flex items-center font-medium text-[var(--text-primary)] hover:underline underline-offset-4 transition-colors cursor-pointer"
                >
                  Entrar
                </Link>
                <Link
                  href="/cadastro"
                  className="min-h-[40px] inline-flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  Criar Conta
                </Link>
                <Link
                  href="/minha-lista"
                  className="min-h-[40px] inline-flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  Minha Lista
                </Link>
              </div>
            </div>
          </div>

          {/* Column 11-12: Project Channels & Authors */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Repositório &amp; Autores
            </h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Acesse o código-fonte do projeto, a página institucional sobre a equipe e os perfis dos idealizadores.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
              {INSTITUTIONAL_SOCIAL_CHANNELS.map((channel) => {
                const isExternal = channel.href.startsWith('http');
                return (
                  <a
                    key={channel.id}
                    href={channel.href}
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                    onClick={!isExternal ? (e) => handleSectionAnchorClick(e, channel.href) : undefined}
                    aria-label={`${channel.label} — ${channel.handle}`}
                    className="group glass-interactive-tile min-h-[44px] flex items-center justify-between gap-2 px-3.5 py-2.5 transition-all"
                  >
                    <span className="inline-flex items-center gap-2.5 text-xs font-medium text-[var(--text-primary)]">
                      <span className="text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                        {renderSocialIcon(channel.id)}
                      </span>
                      <span>{channel.label}</span>
                    </span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors shrink-0" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Copyright, Legal Links & Back-to-Top Bar */}
        <div className="pt-8 lg:pt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <p className="text-xs text-[var(--text-secondary)]">
              {formatFooterCopyright(currentYear)}
            </p>
            <Link
              href="/artigos"
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] underline underline-offset-4 transition-colors py-1"
            >
              Catálogo (/artigos)
            </Link>
            <Link
              href="/sobre"
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] underline underline-offset-4 transition-colors py-1"
            >
              Sobre o Projeto (/sobre)
            </Link>
            <Link
              href="/termos"
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors py-1"
            >
              Termos de Uso
            </Link>
            <Link
              href="/privacidade"
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors py-1"
            >
              Privacidade
            </Link>
            <Link
              href="/cookies"
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors py-1"
            >
              Cookies
            </Link>
          </div>

          <button
            type="button"
            onClick={handleScrollToTop}
            aria-label="Voltar ao topo da página"
            className="group glass-interactive-tile min-h-[44px] inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-[var(--text-primary)] transition-all cursor-pointer shrink-0"
          >
            <span>Voltar ao topo</span>
            <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
          </button>
        </div>
      </div>
    </footer>
  );
};
