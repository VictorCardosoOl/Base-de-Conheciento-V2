'use client';

import React from 'react';

/**
 * Layout Editorial Split-Screen integrado diretamente ao corpo da página:
 * - Sem caixa/borda externa envolvendo o formulário e a imagem.
 * - Coluna esquerda: formulário integrado diretamente ao fundo do site.
 * - Coluna direita: fotografia documental limpa, sem legendas superiores ou textos sobrepostos.
 */
export function AuthSplitLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full py-6 sm:py-10 lg:py-14 2xl:py-16">
      <div className="w-full max-w-[1440px] 2xl:max-w-[1680px] 3xl:max-w-[1840px] mx-auto px-4 sm:px-8 lg:px-12 2xl:px-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 2xl:gap-24 items-center text-[var(--text-primary)]">
        {/* Coluna Esquerda: Formulário Integrado Diretamente ao Corpo do Site */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          <div className="w-full max-w-[440px] 2xl:max-w-[480px] 3xl:max-w-[520px] mx-auto">
            {children}
          </div>
        </div>

        {/* Coluna Direita: Fotografia Documental Limpa no Corpo do Site */}
        <div
          aria-hidden="true"
          data-testid="auth-visual"
          className="hidden lg:flex lg:col-span-6 items-center justify-center"
        >
          <div className="relative w-full min-h-[560px] xl:min-h-[620px] 2xl:min-h-[680px] 3xl:min-h-[740px] rounded-2xl overflow-hidden select-none">
            <img
              src="/assets/aistudio/consultoria-auditoria-sst_fd37d9f7.webp"
              alt=""
              className="absolute inset-0 w-full h-full object-cover editorial-photo saturate-[0.88]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

