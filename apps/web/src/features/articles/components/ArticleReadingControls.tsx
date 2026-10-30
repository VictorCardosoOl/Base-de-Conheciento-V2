import React, { useState, useRef, useEffect } from 'react';
import { Type, Eye, EyeOff, Check, SlidersHorizontal, RotateCcw } from 'lucide-react';
import {
  ReadingExperienceService,
  TypographyPreferences,
} from '@/features/reading/reading-experience-service';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface ArticleReadingControlsProps {
  isZenMode: boolean;
  onToggleZenMode: () => void;
  typography?: TypographyPreferences;
  onTypographyChange?: (pref: TypographyPreferences) => void;
}

export const ArticleReadingControls: React.FC<ArticleReadingControlsProps> = ({
  isZenMode,
  onToggleZenMode,
  typography,
  onTypographyChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localPref, setLocalPref] = useState<TypographyPreferences>(() =>
    ReadingExperienceService.getTypography()
  );
  const pref = typography ?? localPref;
  const activeMeasure = pref.measure || 'comfortable';
  const popoverRef = useRef<HTMLDivElement>(null);
  const popoverContentRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  const updatePreference = (newPref: Partial<TypographyPreferences>) => {
    const updated = { ...pref, ...newPref };
    setLocalPref(updated);
    ReadingExperienceService.setTypography(updated);
    if (onTypographyChange) onTypographyChange(updated);
  };

  const resetDefaults = () => {
    const defaults: TypographyPreferences = {
      fontSize: 'base',
      lineHeight: 'relaxed',
      fontFamily: 'serif',
      measure: 'comfortable',
    };
    setLocalPref(defaults);
    ReadingExperienceService.setTypography(defaults);
    if (onTypographyChange) onTypographyChange(defaults);
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useGSAP(() => {
    if (isOpen) {
      setMounted(true);
    } else if (mounted) {
      if (popoverContentRef.current) {
        gsap.to(popoverContentRef.current, {
          opacity: 0,
          scale: 0.98,
          y: -6,
          duration: 0.16,
          ease: 'power2.in',
          onComplete: () => setMounted(false),
        });
      }
    }
  }, [isOpen]);

  useGSAP(() => {
    if (mounted && isOpen && popoverContentRef.current) {
      gsap.fromTo(
        popoverContentRef.current,
        { opacity: 0, scale: 0.98, y: -6 },
        { opacity: 1, scale: 1, y: 0, duration: 0.22, ease: 'power3.out' }
      );
    }
  }, [mounted, isOpen]);

  return (
    <div className="relative inline-flex items-center gap-1.5" ref={popoverRef}>
      {/* Botão Modo Foco (Zen Mode) */}
      <button
        type="button"
        onClick={onToggleZenMode}
        title={
          isZenMode
            ? 'Sair do Modo Foco'
            : 'Modo Foco (Leitura imersiva sem barra lateral)'
        }
        aria-label={isZenMode ? 'Sair do Modo Foco' : 'Ativar Modo Foco'}
        aria-pressed={isZenMode}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
          isZenMode
            ? 'bg-[var(--text-main)] text-[var(--bg-main)] border-[var(--text-main)]'
            : 'bg-[var(--bg-paper)] text-[var(--text-secondary)] border-[var(--border-hairline)] hover:text-[var(--text-main)] hover:bg-[var(--bg-paper-warm)]'
        }`}
      >
        {isZenMode ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
        <span className="hidden sm:inline">{isZenMode ? 'Foco ativo' : 'Modo Foco'}</span>
      </button>

      {/* Botão de Personalização Tipográfica */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        title="Ajuste tipografia, entrelinha e largura da coluna"
        aria-label="Ajustar Tipografia e Leitura"
        aria-expanded={isOpen}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
          isOpen
            ? 'bg-[var(--text-main)] text-[var(--bg-main)] border-[var(--text-main)]'
            : 'bg-[var(--bg-paper)] text-[var(--text-secondary)] border-[var(--border-hairline)] hover:text-[var(--text-main)] hover:bg-[var(--bg-paper-warm)]'
        }`}
      >
        <SlidersHorizontal size={14} aria-hidden="true" />
        <span className="hidden sm:inline">Tipografia</span>
        <span className="font-serif italic text-[11px] opacity-80">Aa</span>
      </button>

      {/* Painel Editorial de Configurações */}
      {mounted && (
        <div
          ref={popoverContentRef}
          role="dialog"
          aria-label="Preferências de leitura"
          className="bg-[var(--bg-island)] border border-[var(--border-hairline)] absolute right-0 top-full mt-2.5 w-80 p-5 rounded-lg z-50 space-y-4 shadow-[0_12px_32px_rgba(0,0,0,0.14)] transform-gpu will-change-[transform,opacity]"
        >
          <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border-hairline)]">
            <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-[var(--text-muted)] font-semibold">
              Caderno de Leitura
            </span>
            <Type size={13} className="text-[var(--text-muted)]" aria-hidden="true" />
          </div>

          {/* 1. Tamanho da Fonte */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-medium text-[var(--text-secondary)]">
                Corpo do Texto
              </label>
              <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">
                {pref.fontSize === 'sm'
                  ? 'Compacto'
                  : pref.fontSize === 'base'
                    ? 'Padrão'
                    : pref.fontSize === 'lg'
                      ? 'Ampliado'
                      : 'Editorial XL'}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1 p-1 bg-[var(--bg-paper)] rounded-md border border-[var(--border-hairline)]">
              {(['sm', 'base', 'lg', 'xl'] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => updatePreference({ fontSize: size })}
                  className={`py-1.5 text-xs font-mono font-semibold rounded transition-colors ${
                    pref.fontSize === size
                      ? 'bg-[var(--text-main)] text-[var(--bg-main)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  {size === 'sm'
                    ? 'A-'
                    : size === 'base'
                      ? 'A'
                      : size === 'lg'
                        ? 'A+'
                        : 'A++'}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Largura da Coluna (Measure) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-medium text-[var(--text-secondary)]">
                Largura da Coluna
              </label>
              <span className="text-[10px] font-mono text-[var(--text-muted)] tabular-nums">
                {activeMeasure === 'narrow'
                  ? '60ch'
                  : activeMeasure === 'wide'
                    ? '84ch'
                    : '70ch'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1 p-1 bg-[var(--bg-paper)] rounded-md border border-[var(--border-hairline)]">
              {(
                [
                  { id: 'narrow', label: 'Estreita' },
                  { id: 'comfortable', label: 'Editorial' },
                  { id: 'wide', label: 'Ampla' },
                ] as const
              ).map((col) => (
                <button
                  key={col.id}
                  type="button"
                  onClick={() => updatePreference({ measure: col.id })}
                  className={`py-1.5 text-[11px] font-medium rounded transition-colors ${
                    activeMeasure === col.id
                      ? 'bg-[var(--text-main)] text-[var(--bg-main)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  {col.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Família Tipográfica */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-[var(--text-secondary)] block">
              Tipografia do Corpo
            </label>
            <div className="space-y-1">
              {[
                {
                  id: 'serif',
                  label: 'Playfair Editorial',
                  sub: 'Serifa clássica de livro',
                  fontClass: 'font-serif',
                },
                {
                  id: 'sans',
                  label: 'Inter Técnica',
                  sub: 'Sem serifa contemporânea',
                  fontClass: 'font-sans',
                },
                {
                  id: 'dyslexic',
                  label: 'Lexend Acessível',
                  sub: 'Espaçamento aberto de alta legibilidade',
                  fontClass: 'font-sans',
                },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    updatePreference({ fontFamily: item.id as TypographyPreferences['fontFamily'] })
                  }
                  className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs rounded-md border transition-colors ${
                    pref.fontFamily === item.id
                      ? 'border-[var(--text-main)] bg-[var(--bg-paper-warm)] text-[var(--text-main)] font-medium'
                      : 'border-transparent text-[var(--text-secondary)] hover:bg-[var(--bg-paper)]'
                  }`}
                >
                  <span className="flex flex-col">
                    <span className={item.fontClass}>{item.label}</span>
                    <span className="text-[10px] text-[var(--text-muted)] font-sans">{item.sub}</span>
                  </span>
                  {pref.fontFamily === item.id && (
                    <Check size={14} className="text-[var(--accent-editorial)] shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Espaçamento Entre Linhas */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-[var(--text-secondary)] block">
              Cadência Vertical (Entrelinha)
            </label>
            <div className="grid grid-cols-4 gap-1 p-1 bg-[var(--bg-paper)] rounded-md border border-[var(--border-hairline)]">
              {(['tight', 'normal', 'relaxed', 'loose'] as const).map(
                (lh) => (
                  <button
                    key={lh}
                    type="button"
                    onClick={() => updatePreference({ lineHeight: lh })}
                    className={`py-1.5 text-[11px] font-mono font-semibold tabular-nums rounded transition-colors ${
                      pref.lineHeight === lh
                        ? 'bg-[var(--text-main)] text-[var(--bg-main)]'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    {lh === 'tight'
                      ? '1.5'
                      : lh === 'normal'
                        ? '1.65'
                        : lh === 'relaxed'
                          ? '1.85'
                          : '2.1'}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--border-hairline)] flex justify-end">
            <button
              type="button"
              onClick={resetDefaults}
              className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
            >
              <RotateCcw size={12} aria-hidden="true" />
              <span>Restaurar padrão</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

