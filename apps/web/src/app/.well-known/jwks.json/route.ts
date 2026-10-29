import { NextResponse } from 'next/server';
import { isMockAuthAllowed, MOCK_PUB_JWK } from '@/lib/mock-auth-store';

export async function GET() {
  if (!isMockAuthAllowed()) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: 'Mock JWKS desativado em ambiente de produção' } },
      { status: 403 }
    );
  }

  return NextResponse.json({
    keys: [MOCK_PUB_JWK],
  });
}
