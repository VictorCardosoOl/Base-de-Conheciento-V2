import { NextRequest, NextResponse } from 'next/server';
import {
  mockUsers,
  mockSessions,
  createMockAccessToken,
  verifyMockPassword,
  checkLoginRateLimit,
  resetLoginRateLimit,
  isMockAuthAllowed,
  pruneMockSessions,
  resolveCookieSameSite,
} from '@/lib/mock-auth-store';

export async function POST(request: NextRequest) {
  if (!isMockAuthAllowed()) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: 'Mock auth desativado em ambiente de produção' } },
      { status: 403 }
    );
  }

  try {
    const ip =
      request.headers.get('x-real-ip') ||
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      '127.0.0.1';

    const { email, password } = await request.json();
    if (!email || !password || typeof password !== 'string') {
      return NextResponse.json(
        { error: { code: 'INVALID_CREDENTIALS', message: 'Credenciais inválidas' } },
        { status: 401 }
      );
    }

    const normEmail = String(email).trim().toLowerCase();
    const ipRateKey = `ip:${ip}:${normEmail}`;
    const acctRateKey = `acct:${normEmail}`;
    const ipRateCheck = checkLoginRateLimit(ipRateKey);
    const acctRateCheck = checkLoginRateLimit(acctRateKey, 15);
    if (!ipRateCheck.allowed || !acctRateCheck.allowed) {
      const retryAfterSec = Math.max(ipRateCheck.retryAfterSec, acctRateCheck.retryAfterSec);
      return NextResponse.json(
        {
          error: {
            code: 'RATE_LIMITED',
            message: 'Muitas tentativas de login. Aguarde alguns instantes antes de tentar novamente.',
          },
        },
        { status: 429, headers: { 'Retry-After': String(retryAfterSec) } }
      );
    }

    const user = mockUsers.get(normEmail);
    if (!user || !verifyMockPassword(password, user)) {
      return NextResponse.json(
        { error: { code: 'INVALID_CREDENTIALS', message: 'Credenciais inválidas' } },
        { status: 401 }
      );
    }

    resetLoginRateLimit(ipRateKey);
    resetLoginRateLimit(acctRateKey);

    pruneMockSessions();
    const sessionId = crypto.randomUUID();
    mockSessions.set(sessionId, { userId: user.id, createdAt: new Date() });

    const accessToken = await createMockAccessToken(user, sessionId, request.nextUrl.origin);
    const cookieName = process.env.AUTH_ACCESS_COOKIE_NAME || 'kb_at';
    const isSecure =
      request.headers.get('x-forwarded-proto') === 'https' ||
      request.url.startsWith('https://');
    const sameSite = resolveCookieSameSite(isSecure);

    const response = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        display_name: user.displayName,
        role: user.role,
        must_change_password: user.mustChangePassword,
        email_verified: true,
        has_password: true,
      },
    });

    response.cookies.set(cookieName, accessToken, {
      path: '/',
      httpOnly: true,
      sameSite,
      secure: isSecure,
      maxAge: 3600,
    });

    response.cookies.set('kb_rt', sessionId, {
      path: '/auth',
      httpOnly: true,
      sameSite,
      secure: isSecure,
      maxAge: 7 * 86400,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: { code: 'SERVER_ERROR', message: 'Falha no login' } },
      { status: 500 }
    );
  }
}
