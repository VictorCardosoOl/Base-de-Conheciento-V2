/**
 * Headers de segurança de todas as respostas do Next (páginas, /admin, estáticos).
 *
 * Antes ficavam em vercel.json e public/_headers (herança do Vite), que o `next start`
 * ignora — as páginas saíam sem nenhum deles. As respostas de /auth/* vêm do
 * AuthService, que envia a própria política (mais restrita, `default-src 'none'`).
 *
 * CSP sem nonce (guia "Without Nonces" do Next): o Next injeta scripts inline para a
 * hidratação e o layout tem o script de tema, por isso `'unsafe-inline'` em script-src.
 * Em produção (`isDev === false`), removemos `'unsafe-eval'` e protocolos não criptografados (`http:`, `ws:`).
 */
export interface SecurityHeader {
  key: string;
  value: string;
}

export function contentSecurityPolicy(isDev: boolean): string {
  const scriptSrc = isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: blob:"
    : "script-src 'self' 'unsafe-inline' https: blob:";

  const connectSrc = isDev
    ? "connect-src 'self' ws: wss: https: http:"
    : "connect-src 'self' https: wss:";

  const frameAncestors = isDev ? "frame-ancestors *" : "frame-ancestors 'none'";

  return [
    "default-src 'self' https: data: blob:",
    scriptSrc,
    "style-src 'self' 'unsafe-inline' https:",
    "img-src 'self' blob: data: https:",
    "font-src 'self' data: https:",
    connectSrc,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    frameAncestors,
  ].join('; ');
}

export function securityHeaders(isDev: boolean): SecurityHeader[] {
  const headers: SecurityHeader[] = [
    { key: 'Content-Security-Policy', value: contentSecurityPolicy(isDev) },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  ];
  if (!isDev) {
    headers.push({ key: 'X-Frame-Options', value: 'DENY' });
    headers.push({ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' });
  }
  return headers;
}
