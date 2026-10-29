import { NextRequest, NextResponse } from 'next/server';
import {
  mockUsers,
  mockSessions,
  createMockAccessToken,
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
    const refreshToken = request.cookies.get('kb_rt')?.value;

    if (!refreshToken || !mockSessions.has(refreshToken)) {
      return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });
    }

    const session = mockSessions.get(refreshToken)!;
    let foundUser = null;
    for (const u of mockUsers.values()) {
      if (u.id === session.userId) {
        foundUser = u;
        break;
      }
    }

    if (!foundUser) {
      return NextResponse.json({ error: { code: 'NOT_FOUND' } }, { status: 404 });
    }

    // Rotaciona o refresh token
    mockSessions.delete(refreshToken);
    pruneMockSessions();
    const newSessionId = crypto.randomUUID();
    mockSessions.set(newSessionId, { userId: foundUser.id, createdAt: new Date() });

    const accessToken = await createMockAccessToken(foundUser, newSessionId, request.nextUrl.origin);
    const cookieName = process.env.AUTH_ACCESS_COOKIE_NAME || 'kb_at';
    const isSecure =
      request.headers.get('x-forwarded-proto') === 'https' ||
      request.url.startsWith('https://');
    const sameSite = resolveCookieSameSite(isSecure);

    const response = NextResponse.json({ ok: true });
    response.cookies.set(cookieName, accessToken, {
      path: '/',
      httpOnly: true,
      sameSite,
      secure: isSecure,
      maxAge: 3600,
    });

    response.cookies.set('kb_rt', newSessionId, {
      path: '/auth',
      httpOnly: true,
      sameSite,
      secure: isSecure,
      maxAge: 7 * 86400,
    });

    return response;
  } catch {
    return NextResponse.json({ error: { code: 'SERVER_ERROR' } }, { status: 500 });
  }
}
