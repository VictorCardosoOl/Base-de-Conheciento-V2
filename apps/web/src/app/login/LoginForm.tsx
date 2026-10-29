"use client";

import React, { useEffect, useRef, useState } from 'react';
import { AuthSplitLayout } from '@/features/auth/components/AuthSplitLayout';
import Link from 'next/link';
import { Eye, EyeOff, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { SunburstEmblem } from '@/features/institutional/components/SunburstEmblem';
import { login, refreshSession, type LoginResult } from '@/features/auth/client';
import { clearAuthReturn, isAuthReturnLoop, markAuthReturn } from '@/features/auth/return-guard';
import { hardNavigate } from '@/lib/navigation';
import { PASSWORD_CHANGE_PATH } from '@/features/auth/redirect';
import { SocialLoginButtons } from '@/features/auth/components/SocialLoginButtons';
import { tooManyAttemptsMessage } from '@/features/auth/presentation';

type FailedLogin = Exclude<LoginResult, { ok: true }>;

function messageFor(result: FailedLogin): string {
  switch (result.reason) {
    case 'invalid_credentials':
      return 'Email ou senha inválidos.';
    case 'rate_limited':
      return tooManyAttemptsMessage(result.retryAfterSeconds);
    case 'validation':
      return 'Verifique o email e a senha informados.';
    case 'unavailable':
      return 'Serviço de autenticação indisponível. Tente novamente em instantes.';
  }
}

const SESSION_NOT_KEPT =
  'Não foi possível manter a sessão neste navegador. Tente entrar novamente; se o problema continuar, contate o administrador.';

function returnTo(next: string) {
  markAuthReturn(next);
  hardNavigate(next);
}

export function LoginForm({
  next,
  initialError = null,
  notice = null,
}: {
  next: string;
  initialError?: string | null;
  notice?: string | null;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(initialError ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const [demoFilled, setDemoFilled] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);
  const demoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (demoTimerRef.current) {
        clearTimeout(demoTimerRef.current);
      }
    };
  }, []);

  // Renovação silenciosa em segundo plano (sem bloquear a renderização do formulário).
  useEffect(() => {
    let active = true;
    refreshSession()
      .then((renewed) => {
        if (!active) return;
        if (renewed && isAuthReturnLoop(next)) {
          console.error(
            '[auth] Sessão renovada, mas o destino voltou ao login. Verifique a configuração de cookies.'
          );
          clearAuthReturn();
          setError(SESSION_NOT_KEPT);
        } else if (renewed) {
          returnTo(next);
        } else {
          clearAuthReturn();
        }
      })
      .catch(() => {
        if (active) clearAuthReturn();
      });

    return () => {
      active = false;
    };
  }, [next]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email.trim(), password);
    if (result.ok) {
      returnTo(
        result.user.must_change_password
          ? `${PASSWORD_CHANGE_PATH}?${new URLSearchParams({ next })}`
          : next
      );
      return;
    }

    setPassword('');
    setError(messageFor(result));
    setIsLoading(false);
    passwordRef.current?.focus();
  };

  const handleFillDemo = () => {
    setEmail('admin@sst.local');
    setPassword('admin123456');
    setError('');
    setDemoFilled(true);
    if (demoTimerRef.current) {
      clearTimeout(demoTimerRef.current);
    }
    demoTimerRef.current = setTimeout(() => setDemoFilled(false), 2500);
  };

  const softInputClass =
    'w-full h-11 px-4 rounded-lg bg-[#ECE9E2] dark:bg-white/[0.06] border border-[var(--border-hairline)] focus:bg-[#E5E1D8] dark:focus:bg-white/[0.09] focus:ring-1 focus:ring-[var(--accent-editorial)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/70 text-sm transition-all outline-none';

  return (
    <AuthSplitLayout>
      <div className="w-full space-y-6">
        {/* Cabeçalho Minimalista Sem Bordas */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2.5">
              <SunburstEmblem size={24} strokeColor="#B27E29" dotColor="#B27E29" />
              <div className="leading-tight">
                <span className="block text-xs font-semibold tracking-tight text-[var(--text-primary)]">
                  Base <span className="text-[#B27E29]">SST</span>
                </span>
                <span className="block text-[11px] text-[var(--text-muted)]">
                  Plataforma de Engenharia SST &amp; eSocial
                </span>
              </div>
            </div>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-3 py-1.5 rounded-lg bg-[#ECE9E2]/70 dark:bg-white/[0.05] hover:bg-[#ECE9E2] dark:hover:bg-white/[0.1]"
            >
              <span>← Início</span>
            </Link>
          </div>

          <div className="pt-2 space-y-2">
            <h1 className="font-editorial text-4xl sm:text-[2.6rem] font-normal tracking-tight text-[var(--text-primary)] leading-[1.08]">
              Bem-vindo, acesse sua conta.
            </h1>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Consulte os cadernos operacionais de GRO/PGR, LTCAT, eventos S-2210 a S-2240 e matrizes de conformidade.
            </p>
          </div>
        </div>

        {notice && !error && (
          <div
            role="status"
            data-tone="success"
            className="p-3.5 rounded-xl bg-emerald-500/10 text-xs text-[var(--text-primary)] flex items-center gap-2"
          >
            <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {/* Bloco de Demonstração Limpo Sem Pílula Genérica */}
        <div className="p-3.5 rounded-xl bg-[#ECE9E2]/65 dark:bg-white/[0.04] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#234F46]/10 dark:bg-[#68B2A0]/15 text-[#234F46] dark:text-[#68B2A0] flex items-center justify-center shrink-0">
              <Sparkles size={15} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-[var(--text-primary)] block truncate">
                Acesso Rápido de Demonstração
              </span>
              <span className="text-[11px] font-tabular text-[var(--text-muted)] block truncate">
                admin@sst.local
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleFillDemo}
            className="px-3.5 py-1.5 rounded-lg bg-[var(--bg-paper)] dark:bg-white/10 text-[var(--text-primary)] hover:text-[var(--accent-editorial)] text-[11px] font-semibold transition-all active:scale-95 cursor-pointer shrink-0"
          >
            {demoFilled ? 'Preenchido ✓' : 'Preencher dados'}
          </button>
        </div>

        <SocialLoginButtons next={next} mode="login" />

        <form onSubmit={handleLogin} className="space-y-4" noValidate>
          {error && (
            <div
              id="login-error-msg"
              role="alert"
              data-tone="danger"
              className="p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300 text-xs font-medium text-center"
            >
              {error}
            </div>
          )}

          {/* Campo: Email (Soft Fill sem Borda - Estilo Nestvested) */}
          <div className="space-y-1.5">
            <label
              htmlFor="login-email"
              className="block text-xs font-medium text-[var(--text-secondary)] pl-1"
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="nome@empresa.com.br"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? 'login-error-msg' : undefined}
              className={softInputClass}
            />
          </div>

          {/* Campo: Senha (Soft Fill sem Borda) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <label
                htmlFor="login-password"
                className="block text-xs font-medium text-[var(--text-secondary)]"
              >
                Senha
              </label>
              <Link
                href={`/esqueci-senha?${new URLSearchParams({ next })}`}
                className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--accent-editorial)] underline underline-offset-4 transition-colors"
              >
                Esqueceu a senha?
              </Link>
            </div>
            <div className="relative">
              <input
                id="login-password"
                ref={passwordRef}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Sua senha de acesso"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'login-error-msg' : undefined}
                className={`${softInputClass} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors focus:outline-none cursor-pointer"
                aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              >
                {showPassword ? (
                  <EyeOff size={18} aria-hidden="true" />
                ) : (
                  <Eye size={18} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          {/* Botão Principal Limpo */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              aria-label="Entrar"
              className="w-full h-11 px-6 rounded-lg font-semibold text-sm tracking-wide bg-spectral-gradient text-white hover:opacity-95 transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Autenticando…</span>
                </>
              ) : (
                <>
                  <span>Entrar na Plataforma</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </>
              )}
            </button>
          </div>

          {/* Link para Cadastro sem Linha Divisória */}
          <p className="pt-3 text-center text-sm text-[var(--text-secondary)]">
            Não possui uma conta?{' '}
            <Link
              href={`/cadastro?${new URLSearchParams({ next })}`}
              className="font-semibold text-[var(--accent-editorial)] hover:underline underline-offset-4 transition-colors ml-1"
            >
              Criar conta
            </Link>
          </p>
        </form>
      </div>
    </AuthSplitLayout>
  );
}
