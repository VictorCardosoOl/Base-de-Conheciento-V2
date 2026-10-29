'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CuratedPlate {
  index: string;
  code: string;
  tag: string;
  src: string;
  quote: string;
  author: string;
  role: string;
}

const CURATED_PLATES: ReadonlyArray<CuratedPlate> = [
  {
    index: '01',
    code: 'NR-01 · GRO / PGR',
    tag: 'SST Enterprise · eSocial S-2240',
    src: '/assets/aistudio/consultoria-auditoria-sst_fd37d9f7.webp',
    quote:
      'A padronização dos laudos técnicos e o cruzamento dos eventos de SST garantem segurança jurídica integral e rastreabilidade pericial em campo.',
    author: 'Sabrina Fraguela & João Sanchez',
    role: 'Consultoria Técnica & Engenharia de Segurança',
  },
  {
    index: '02',
    code: 'TABELA 24 · S-2240',
    tag: 'Conformidade Previdenciária · LTCAT',
    src: '/assets/aistudio/inspecao-seguranca-trabalho_dd5a1bfb.webp',
    quote:
      'Da caracterização de agentes nocivos ao protocolo XML no e-CAC, cada caderno operacional foi estruturado para eliminar divergências com o PPP eletrônico.',
    author: 'Victor Cardoso & Guilherme Cruz',
    role: 'Idealizadores & Arquitetura da Plataforma',
  },
  {
    index: '03',
    code: 'NR-07 · S-2220',
    tag: 'Saúde Ocupacional · PCMSO & ASO',
    src: '/assets/aistudio/profissional-saude-ocupacional_560cc41f.webp',
    quote:
      'Integração contínua entre o inventário de riscos do PGR, o monitoramento biológico do PCMSO e a gestão de acidentes de trabalho (CAT / S-2210).',
    author: 'Acervo Técnico Base de Conhecimento',
    role: 'Curadoria Multidisciplinar de SST & eSocial',
  },
];

/**
 * Layout Editorial Split-Screen limpo e sem excesso de bordas internas:
 * - Coluna esquerda: superfície limpa em papel arquivístico (Alabaster) / ardósia (Noir).
 * - Coluna direita: fotografia documental com citação editorial fluida diretamente sobre
 *   o gradiente da imagem (inspirado nas referências Untitled UI e Nestvested).
 */
export function AuthSplitLayout({ children }: { children: React.ReactNode }) {
  const [plateIdx, setPlateIdx] = useState(0);
  const activePlate = CURATED_PLATES[plateIdx] ?? CURATED_PLATES[0];

  const handlePrev = () => {
    setPlateIdx((prev) => (prev - 1 + CURATED_PLATES.length) % CURATED_PLATES.length);
  };

  const handleNext = () => {
    setPlateIdx((prev) => (prev + 1) % CURATED_PLATES.length);
  };

  return (
    <div className="flex items-center justify-center w-full py-2 sm:py-6 2xl:py-12 3xl:py-16 4xl:py-24">
      <div className="w-full max-w-[1200px] 2xl:max-w-[1480px] 3xl:max-w-[1680px] 4xl:max-w-[1920px] rounded-xl 2xl:rounded-2xl border border-[var(--border-hairline)] overflow-hidden text-[var(--text-primary)] bg-[var(--bg-paper)] dark:bg-[#11151A] shadow-sm grid grid-cols-1 lg:grid-cols-12">
        {/* Coluna Esquerda: Formulário Limpo (Zero Bordas Internas) */}
        <div className="lg:col-span-6 flex flex-col justify-between p-6 sm:p-10 xl:p-14 2xl:p-16 3xl:p-20 relative z-10 bg-[var(--bg-paper)] dark:bg-[#11151A]">
          <div className="w-full max-w-[420px] 2xl:max-w-[480px] 3xl:max-w-[520px] mx-auto my-auto py-2">
            {children}
          </div>

          {/* Rodapé Discreto sem Linha Divisória */}
          <div className="w-full max-w-[420px] 2xl:max-w-[480px] 3xl:max-w-[520px] mx-auto pt-6 flex flex-wrap items-center justify-between gap-2 text-[11px] font-tabular text-[var(--text-muted)]/80">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-sm bg-[#B27E29]" />
              Base SST · Plataforma de Engenharia
            </span>
            <span>NR-01 · NR-07 · eSocial S-1.3</span>
          </div>
        </div>

        {/* Coluna Direita: Fotografia Editorial sem Caixas ou Bordas Internas */}
        <div
          aria-hidden="true"
          data-testid="auth-visual"
          className="hidden lg:flex lg:col-span-6 p-3 xl:p-4 2xl:p-5 bg-[var(--bg-paper)] dark:bg-[#11151A]"
        >
          <div className="relative w-full min-h-[600px] 2xl:min-h-[680px] 3xl:min-h-[760px] 4xl:min-h-[840px] h-full rounded-lg 2xl:rounded-xl overflow-hidden bg-[#12161A] flex flex-col justify-between p-8 xl:p-11 2xl:p-14 select-none group border border-[var(--border-hairline)]">
            {/* Fotografia Documental Real */}
            <img
              key={activePlate.src}
              src={activePlate.src}
              alt=""
              className="absolute inset-0 w-full h-full object-cover editorial-photo saturate-[0.85] scale-[1.01] transition-all duration-700"
            />

            {/* Gradiente Suave para Leitura Direta sobre a Imagem (Estilo Untitled UI) */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'linear-gradient(180deg, rgba(11, 13, 16, 0.42) 0%, rgba(11, 13, 16, 0.08) 42%, rgba(11, 13, 16, 0.86) 100%)',
              }}
            />

            {/* Topo da Imagem: Badge Elegante Geométrico (Zero-Pill) */}
            <div className="relative z-10 flex items-center justify-between gap-2 w-full">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/45 backdrop-blur-md text-white whitespace-nowrap">
                <span className="w-2 h-2 rounded-sm bg-[#68B2A0] shrink-0" />
                <span className="text-[11px] font-tabular uppercase tracking-wider text-white/95">
                  {activePlate.tag}
                </span>
              </div>

              <span className="px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-md text-[11px] font-tabular text-[#E8BF74] tracking-wider uppercase whitespace-nowrap">
                {activePlate.index} / 03 · {activePlate.code.split('·')[0].trim()}
              </span>
            </div>

            {/* Base da Imagem: Citação Direta na Foto + Controles Geométricos */}
            <div className="relative z-10 w-full mt-auto space-y-5 pt-12">
              <div className="space-y-3">
                <span className="block font-editorial text-5xl leading-none text-white/80 select-none">
                  &ldquo;
                </span>
                <p className="font-editorial text-xl xl:text-2xl text-white font-normal leading-relaxed">
                  {activePlate.quote}
                </p>
              </div>

              <div className="flex items-end justify-between gap-4 pt-2">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold text-white">
                    {activePlate.author}
                  </p>
                  <p className="text-xs text-white/75">
                    {activePlate.role}
                  </p>
                </div>

                {/* Navegação Geométrica Minimalista (Zero-Pill) */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={handlePrev}
                    aria-label="Item anterior"
                    className="w-10 h-10 rounded-lg bg-white/15 hover:bg-white/25 backdrop-blur-md text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={handleNext}
                    aria-label="Próximo item"
                    className="w-10 h-10 rounded-lg bg-white/15 hover:bg-white/25 backdrop-blur-md text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
