import { NextRequest, NextResponse } from 'next/server';
import { importJWK, jwtVerify } from 'jose';
import { isMockAuthAllowed, MOCK_PUB_JWK, mockSessions, mockUsers } from '@/lib/mock-auth-store';

export async function GET(request: NextRequest) {
  if (!isMockAuthAllowed()) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: 'Mock auth desativado em ambiente de produção' } },
      { status: 403 }
    );
  }

  try {
    const authHeader = request.headers.get('authorization');
    const cookieName = process.env.AUTH_ACCESS_COOKIE_NAME || 'kb_at';
    const token =
      (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null) ||
      request.cookies.get(cookieName)?.value ||
      null;

    if (!token) {
      return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });
    }

    const publicKey = await importJWK(MOCK_PUB_JWK, 'EdDSA');
    const { payload } = await jwtVerify(token, publicKey, {
      audience: process.env.AUTH_AUDIENCE || 'knowledge-api',
    });

    const sessionId = typeof payload.sid === 'string' ? payload.sid : null;
    if (!sessionId || !mockSessions.has(sessionId)) {
      return NextResponse.json({ error: { code: 'SESSION_REVOKED' } }, { status: 401 });
    }

    const userId = payload.sub;
    let foundUser = null;
    for (const u of mockUsers.values()) {
      if (u.id === userId) {
        foundUser = u;
        break;
      }
    }

    if (!foundUser) {
      return NextResponse.json({ error: { code: 'NOT_FOUND' } }, { status: 404 });
    }

    return NextResponse.json({
      id: foundUser.id,
      email: foundUser.email,
      username: foundUser.username,
      display_name: foundUser.displayName,
      role: foundUser.role,
      must_change_password: foundUser.mustChangePassword,
      email_verified: true,
      has_password: true,
    });
  } catch {
    return NextResponse.json({ error: { code: 'UNAUTHENTICATED' } }, { status: 401 });
  }
}
