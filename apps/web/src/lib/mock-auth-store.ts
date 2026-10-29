import crypto from 'node:crypto';
import { importJWK, SignJWT, type JWK } from 'jose';

export const MOCK_KID = 'mock-dev-key-1';
const MAX_MAP_ENTRIES = 1000;
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function isMockAuthAllowed(): boolean {
  return process.env.NODE_ENV !== 'production' || process.env.ENABLE_MOCK_AUTH === 'true';
}

export interface MockUserRecord {
  id: string;
  email: string;
  username: string;
  displayName: string;
  role: 'admin' | 'editor' | 'user';
  mustChangePassword: boolean;
  passwordHash?: string;
  password?: string;
  organization?: string | null;
  professionalArea?: string | null;
  createdAt: string;
}

interface LoginRateRecord {
  count: number;
  expiresAt: number;
}

// Armazenamento efêmero em memória durante a execução do processo de desenvolvimento
const globalStore = globalThis as unknown as {
  __mockKeyPair?: { pubJwk: JWK; privJwk: JWK };
  __mockUsers?: Map<string, MockUserRecord>;
  __mockSessions?: Map<string, { userId: string; createdAt: Date }>;
  __mockLoginRateLimits?: Map<string, LoginRateRecord>;
};

if (!globalStore.__mockKeyPair) {
  const pair = crypto.generateKeyPairSync('ed25519');
  const pubRaw = pair.publicKey.export({ format: 'jwk' }) as JWK;
  const privRaw = pair.privateKey.export({ format: 'jwk' }) as JWK;
  globalStore.__mockKeyPair = {
    pubJwk: {
      ...pubRaw,
      kid: MOCK_KID,
      alg: 'EdDSA',
      use: 'sig',
    },
    privJwk: {
      ...privRaw,
      kid: MOCK_KID,
      alg: 'EdDSA',
    },
  };
}

export const MOCK_PUB_JWK: JWK = globalStore.__mockKeyPair.pubJwk;

function resolvePrivateJwk(): JWK {
  const envJwk = process.env.MOCK_AUTH_PRIVATE_JWK;
  if (envJwk) {
    try {
      return JSON.parse(envJwk) as JWK;
    } catch (error) {
      console.error('[mock-auth-store] MOCK_AUTH_PRIVATE_JWK inválida; usando chave efêmera local:', error);
    }
  }
  return globalStore.__mockKeyPair!.privJwk;
}

/**
 * Gera um hash seguro (scrypt + salt aleatório) para armazenamento em memória.
 */
export function hashMockPassword(password: string, salt = crypto.randomBytes(16).toString('hex')): string {
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

/**
 * Verifica a senha em tempo constante (timing-safe) contra o hash armazenado.
 */
export function verifyMockPassword(candidate: string, user: MockUserRecord): boolean {
  if (!candidate || typeof candidate !== 'string') return false;

  if (user.passwordHash) {
    const [salt, storedHex] = user.passwordHash.split(':');
    if (!salt || !storedHex) return false;
    const candidateBuf = crypto.scryptSync(candidate, salt, 64);
    const storedBuf = Buffer.from(storedHex, 'hex');
    if (candidateBuf.length !== storedBuf.length) return false;
    return crypto.timingSafeEqual(candidateBuf, storedBuf);
  }

  if (user.password) {
    const a = Buffer.from(candidate, 'utf8');
    const b = Buffer.from(user.password, 'utf8');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  }

  return false;
}

if (!globalStore.__mockUsers) {
  globalStore.__mockUsers = new Map<string, MockUserRecord>();
  const initialAdminPassword =
    process.env.MOCK_ADMIN_INITIAL_PASSWORD ||
    (process.env.NODE_ENV !== 'production' ? 'admin123456' : crypto.randomBytes(24).toString('base64url'));
  const defaultAdmin: MockUserRecord = {
    id: 'a0000000-0000-0000-0000-000000000001',
    email: 'admin@sst.local',
    username: 'admin',
    displayName: 'Administrador SST',
    role: 'admin',
    passwordHash: hashMockPassword(initialAdminPassword),
    mustChangePassword: false,
    createdAt: new Date().toISOString(),
  };
  globalStore.__mockUsers.set(defaultAdmin.email.toLowerCase(), defaultAdmin);
  globalStore.__mockUsers.set(defaultAdmin.username.toLowerCase(), defaultAdmin);
}

if (!globalStore.__mockSessions) {
  globalStore.__mockSessions = new Map<string, { userId: string; createdAt: Date }>();
}

if (!globalStore.__mockLoginRateLimits) {
  globalStore.__mockLoginRateLimits = new Map<string, LoginRateRecord>();
}

export const mockUsers = globalStore.__mockUsers;
export const mockSessions = globalStore.__mockSessions;

export function pruneMockSessions(now = Date.now()): void {
  if (mockSessions.size < MAX_MAP_ENTRIES) return;
  for (const [sid, session] of mockSessions.entries()) {
    if (now - session.createdAt.getTime() >= SESSION_TTL_MS) {
      mockSessions.delete(sid);
    }
  }
  while (mockSessions.size >= MAX_MAP_ENTRIES) {
    const oldestKey = mockSessions.keys().next().value;
    if (!oldestKey) break;
    mockSessions.delete(oldestKey);
  }
}

export function pruneRateLimitMap(
  map: Map<string, { count: number; expiresAt: number }>,
  now = Date.now()
): void {
  if (map.size < MAX_MAP_ENTRIES) return;
  for (const [k, v] of map.entries()) {
    if (now >= v.expiresAt) {
      map.delete(k);
    }
  }
  while (map.size >= MAX_MAP_ENTRIES) {
    const oldestKey = map.keys().next().value;
    if (!oldestKey) break;
    map.delete(oldestKey);
  }
}

/**
 * Rate limiter em memória para tentativas de login (máx 10 tentativas / 5 min por chave).
 */
export function checkLoginRateLimit(
  key: string,
  maxAttempts = 10,
  windowMs = 5 * 60 * 1000
): { allowed: boolean; retryAfterSec: number } {
  const store = globalStore.__mockLoginRateLimits!;
  const now = Date.now();
  pruneRateLimitMap(store, now);
  const current = store.get(key);

  if (!current || current.expiresAt <= now) {
    store.set(key, { count: 1, expiresAt: now + windowMs });
    return { allowed: true, retryAfterSec: 0 };
  }

  if (current.count >= maxAttempts) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((current.expiresAt - now) / 1000)),
    };
  }

  current.count += 1;
  return { allowed: true, retryAfterSec: 0 };
}

export function resetLoginRateLimit(key: string): void {
  globalStore.__mockLoginRateLimits?.delete(key);
}

export function resolveCookieSameSite(isSecure: boolean): 'none' | 'lax' {
  const allowIframeCookies =
    process.env.ALLOW_IFRAME_COOKIES === 'true' || process.env.NODE_ENV !== 'production';
  return isSecure && allowIframeCookies ? 'none' : 'lax';
}

export async function createMockAccessToken(
  user: MockUserRecord,
  sessionId: string,
  fallbackOrigin?: string
): Promise<string> {
  if (!isMockAuthAllowed()) {
    throw new Error('[Security] Mock auth tokens are strictly prohibited in production mode without ENABLE_MOCK_AUTH=true.');
  }

  const privateKey = await importJWK(resolvePrivateJwk(), 'EdDSA');
  const issuer = process.env.AUTH_ISSUER || fallbackOrigin || 'http://localhost:3000';
  const audience = process.env.AUTH_AUDIENCE || 'knowledge-api';

  return new SignJWT({
    role: user.role,
    sid: sessionId,
  })
    .setProtectedHeader({ alg: 'EdDSA', kid: MOCK_KID })
    .setSubject(user.id)
    .setIssuer(issuer)
    .setAudience(audience)
    .setIssuedAt()
    .setJti(crypto.randomUUID())
    .setExpirationTime('1h')
    .sign(privateKey);
}
