import { NextRequest, NextResponse } from 'next/server';
import { isMockAuthAllowed, mockSessions } from '@/lib/mock-auth-store';

export async function POST(request: NextRequest) {
  if (!isMockAuthAllowed()) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: 'Mock auth desativado em ambiente de produção' } },
      { status: 403 }
    );
  }

  const refreshToken = request.cookies.get('kb_rt')?.value;
  if (refreshToken) {
    mockSessions.delete(refreshToken);
  }

  const cookieName = process.env.AUTH_ACCESS_COOKIE_NAME || 'kb_at';
  const response = NextResponse.json({ ok: true });

  response.cookies.delete(cookieName);
  response.cookies.set(cookieName, '', { path: '/', maxAge: 0 });
  response.cookies.delete('kb_rt');
  response.cookies.set('kb_rt', '', { path: '/auth', maxAge: 0 });

  return response;
}
