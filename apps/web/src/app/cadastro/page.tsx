import type { Metadata } from 'next';
import { sanitizeNextPath } from '@/features/auth/redirect';
import { sanitizeInput } from '@/features/auth/security';
import { RegisterForm } from './RegisterForm';

export const metadata: Metadata = {
  title: 'Criar conta | SST FAQ',
  robots: { index: false, follow: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstParam(val: string | string[] | undefined): string {
  return Array.isArray(val) ? val[0] ?? '' : val ?? '';
}

// Cadastro público: a conta nasce como leitor. O `next` e os parâmetros de pré-preenchimento são sanitizados no servidor.
export default async function RegisterPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const nextPath = sanitizeNextPath(firstParam(params.next), '/conta');
  const initialPrefill = {
    email: sanitizeInput(firstParam(params.email), 160),
    displayName: sanitizeInput(firstParam(params.name), 120),
    organization: sanitizeInput(firstParam(params.org), 140),
  };

  return <RegisterForm next={nextPath} initialPrefill={initialPrefill} />;
}
