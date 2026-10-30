"use client";

import React from 'react';
import Link from 'next/link';
import { AuthSplitLayout } from '@/features/auth/components/AuthSplitLayout';
import { Eye, EyeOff, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from '@/features/auth/client';
import { IdentityFields } from '@/features/auth/components/IdentityFields';
import { ProfileFields } from '@/features/auth/components/ProfileFields';
import { SocialLoginButtons } from '@/features/auth/components/SocialLoginButtons';
import { TermsConsent } from '@/features/auth/components/TermsConsent';
import { useRegisterForm, type RegisterInitialPrefill } from '@/features/auth/use-register-form';

export function RegisterForm({
  next,
  initialPrefill,
}: {
  next: string;
  initialPrefill?: RegisterInitialPrefill;
}) {
  const {
    email,
    setEmail,
    emailError,
    validateEmail,
    emailRef,
    password,
    setPassword,
    confirm,
    setConfirm,
    showPassword,
    setShowPassword,
    showConfirm,
    setShowConfirm,
    passwordStrength,
    passwordError,
    setPasswordError,
    confirmError,
    setConfirmError,
    passwordRef,
    confirmRef,
    username,
    setUsername,
    usernameError,
    setUsernameError,
    usernameStatus,
    usernameRef,
    displayName,
    setDisplayName,
    displayNameError,
    organization,
    setOrganization,
    professionalArea,
    setProfessionalArea,
    acceptTerms,
    setAcceptTerms,
    termsError,
    setTermsError,
    termsRef,
    error,
    isSaving,
    honeypot,
    setHoneypot,
    handleSubmit,
  } = useRegisterForm(next, initialPrefill);

  const inputClass =
    'w-full h-11 px-4 rounded-lg bg-[#ECE9E2] dark:bg-white/[0.06] border border-[var(--border-hairline)] focus:bg-[#E5E1D8] dark:focus:bg-white/[0.09] focus:ring-1 focus:ring-[var(--accent-editorial)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/70 text-sm transition-all outline-none';
  const labelClass =
    'block text-xs font-medium text-[var(--text-secondary)] pl-1';
  const loginHref = `/login?${new URLSearchParams({ next })}`;

  const alert = error && (
    <div
      role="alert"
      data-tone="danger"
      className="p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300 text-xs font-medium text-center"
    >
      {error}
    </div>
  );

  return (
    <AuthSplitLayout>
      <div className="w-full space-y-5">
        {/* Cabeçalho Minimalista Sem Bordas */}
        <div className="space-y-2">
          <h1 className="font-editorial text-4xl sm:text-[2.6rem] font-normal tracking-tight text-[var(--text-primary)] leading-[1.08]">
            Criar sua conta corporativa.
          </h1>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
            Acesse gratuitamente os cadernos normativos, checklists operacionais do eSocial e listas de leitura.
          </p>
        </div>

        <SocialLoginButtons next={next} mode="signup" />

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {alert}

          {/* Campo Honeypot Oculto (Anti-Bot) */}
          <div className="hidden" aria-hidden="true">
            <label htmlFor="register-website">Não preencha este campo</label>
            <input
              id="register-website"
              name="website_url"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="register-email" className={labelClass}>
              Email corporativo ou pessoal
            </label>
            <input
              id="register-email"
              ref={emailRef}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) validateEmail(e.target.value);
              }}
              onBlur={() => validateEmail(email)}
              required
              maxLength={254}
              placeholder="voce@empresa.com.br"
              className={`${inputClass} ${emailError ? 'ring-2 ring-red-500/50' : ''}`}
              aria-invalid={Boolean(emailError)}
            />
            {emailError && (
              <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 mt-1 pl-1">
                <AlertCircle size={13} aria-hidden="true" />
                {emailError}
              </p>
            )}
          </div>

          {/* Identidade em Grade 2 Colunas: Nome e Usuário */}
          <IdentityFields
            idPrefix="register"
            username={username}
            displayName={displayName}
            onUsernameChange={(value) => {
              setUsername(value);
              setUsernameError(null);
            }}
            onDisplayNameChange={(value) => {
              setDisplayName(value);
            }}
            usernameStatus={usernameStatus}
            usernameError={usernameError}
            displayNameError={displayNameError}
            usernameRef={usernameRef}
            inputClass={inputClass}
            labelClass={labelClass}
          />

          {/* Senha e Confirmação em Grade 2 Colunas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <label htmlFor="register-password" className={labelClass}>
                Senha
              </label>
              <div className="relative">
                <input
                  id="register-password"
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  aria-describedby="register-password-hint"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError(null);
                  }}
                  required
                  minLength={PASSWORD_MIN_LENGTH}
                  maxLength={PASSWORD_MAX_LENGTH}
                  placeholder={`Mín. ${PASSWORD_MIN_LENGTH} caracteres`}
                  className={`${inputClass} pr-10 ${passwordError ? 'ring-2 ring-red-500/50' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors focus:outline-none cursor-pointer"
                  aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showPassword ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
                </button>
              </div>

              {password.length > 0 && (
                <div className="pt-1 space-y-1 px-1">
                  <div className="flex items-center justify-between text-[10px] font-tabular">
                    <span className="text-[var(--text-muted)] flex items-center gap-1">
                      <ShieldCheck size={11} aria-hidden="true" /> Segurança:
                    </span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 h-1 w-full bg-[#ECE9E2] dark:bg-white/10 rounded-full overflow-hidden">
                    <div className={`h-full ${passwordStrength.score >= 1 ? passwordStrength.color : 'opacity-0'} transition-all`} />
                    <div className={`h-full ${passwordStrength.score >= 2 ? passwordStrength.color : 'opacity-0'} transition-all`} />
                    <div className={`h-full ${passwordStrength.score >= 3 ? passwordStrength.color : 'opacity-0'} transition-all`} />
                    <div className={`h-full ${passwordStrength.score >= 4 ? passwordStrength.color : 'opacity-0'} transition-all`} />
                  </div>
                </div>
              )}

              {passwordError ? (
                <p className="text-[11px] text-red-600 dark:text-red-400 pl-1">{passwordError}</p>
              ) : (
                <p id="register-password-hint" className="text-[11px] text-[var(--text-muted)] pl-1">
                  Mínimo {PASSWORD_MIN_LENGTH} caracteres com variedade.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="register-confirm" className={labelClass}>
                Confirme a senha
              </label>
              <div className="relative">
                <input
                  id="register-confirm"
                  ref={confirmRef}
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => {
                    setConfirm(e.target.value);
                    if (confirmError) setConfirmError(null);
                  }}
                  required
                  placeholder="Repita a senha"
                  className={`${inputClass} pr-10 ${confirmError ? 'ring-2 ring-red-500/50' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors focus:outline-none cursor-pointer"
                  aria-label={showConfirm ? 'Ocultar confirmação de senha' : 'Exibir confirmação de senha'}
                >
                  {showConfirm ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
                </button>
              </div>
              {confirmError && (
                <p className="text-[11px] text-red-600 dark:text-red-400 pl-1">{confirmError}</p>
              )}
            </div>
          </div>

          {/* Perfil Profissional Opcional em 2 Colunas */}
          <ProfileFields
            idPrefix="register"
            organization={organization}
            professionalArea={professionalArea}
            onOrganizationChange={setOrganization}
            onProfessionalAreaChange={setProfessionalArea}
            inputClass={inputClass}
            labelClass={labelClass}
          />

          {/* Consentimento Termos */}
          <div className="pt-1">
            <TermsConsent
              id="register-terms"
              checked={acceptTerms}
              onChange={(value) => {
                setAcceptTerms(value);
                if (value) setTermsError(null);
              }}
              error={termsError}
              inputRef={termsRef}
            />
          </div>

          {/* Botão Primário Limpo */}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full h-11 px-6 rounded-lg font-semibold text-sm tracking-wide bg-spectral-gradient text-white hover:opacity-95 transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2 shadow-sm"
          >
            {isSaving ? (
              <>
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>Criando conta…</span>
              </>
            ) : (
              <>
                <span>Criar conta</span>
                <ArrowRight size={16} aria-hidden="true" />
              </>
            )}
          </button>

          {/* Link para Login sem Linha Divisória */}
          <p className="pt-2 text-center text-sm text-[var(--text-secondary)]">
            Já possui uma conta?{' '}
            <Link
              href={loginHref}
              className="font-semibold text-[var(--accent-editorial)] hover:underline underline-offset-4 transition-colors ml-1"
            >
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </AuthSplitLayout>
  );
}
