import { NextResponse, type NextRequest } from 'next/server';
import { buildLoginRedirect } from '@/features/auth/redirect';

/**
 * Checagem rápida (otimista) no proxy de borda do Next.js 16 antes de renderizar
 * rotas protegidas: sem cookie de access, redireciona diretamente para o login.
 * A validação criptográfica definitiva acontece no servidor via requireSession().
 */
export function proxy(request: NextRequest) {
  const cookieName = process.env.AUTH_ACCESS_COOKIE_NAME;
  if (!cookieName || !request.cookies.has(cookieName)) {
    const { pathname, searchParams } = request.nextUrl;
    return NextResponse.redirect(new URL(buildLoginRedirect(pathname, searchParams), request.url));
  }
  return NextResponse.next();
}

/** Alias para compatibilidade com a convenção clássica */
export const middleware = proxy;

export const config = {
  matcher: ['/admin', '/admin/:path*', '/conta', '/conta/:path*'],
};
