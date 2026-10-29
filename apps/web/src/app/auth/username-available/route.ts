import { NextRequest, NextResponse } from 'next/server';
import { isMockAuthAllowed, mockUsers } from '@/lib/mock-auth-store';
import { RESERVED_USERNAMES } from '@/features/auth/identity';

export async function GET(request: NextRequest) {
  if (!isMockAuthAllowed()) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: 'Mock auth desativado em ambiente de produção' } },
      { status: 403 }
    );
  }

  const username = request.nextUrl.searchParams.get('username')?.trim().toLowerCase();

  if (!username) {
    return NextResponse.json({ available: false, reason: 'invalid' }, { status: 400 });
  }

  const clean = username.replace(/[._-]/g, '');
  if (RESERVED_USERNAMES.has(clean)) {
    return NextResponse.json({ available: false, reason: 'reserved' });
  }

  if (mockUsers.has(username)) {
    return NextResponse.json({ available: false, reason: 'taken' });
  }

  return NextResponse.json({ available: true });
}
