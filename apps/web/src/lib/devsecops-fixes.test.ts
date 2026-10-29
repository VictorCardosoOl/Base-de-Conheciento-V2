import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluatePasswordStrength,
  isDisposableEmail,
  sanitizeInput,
} from '../features/auth/security';
import {
  displayNameProblem,
  isReservedUsername,
  isValidUsername,
  normalizeUsername,
} from '../features/auth/identity';
import {
  checkLoginRateLimit,
  hashMockPassword,
  isMockAuthAllowed,
  MOCK_PUB_JWK,
  pruneRateLimitMap,
  resetLoginRateLimit,
  resolveCookieSameSite,
  verifyMockPassword,
} from './mock-auth-store';
import { sanitizeTextInput } from '../features/institutional/utils/sstCalculations';

test('evaluatePasswordStrength enforces 12-character minimum length contract', () => {
  const shortStrongVariety = evaluatePasswordStrength('Aa1!bcdefg', 'usuario'); // 10 chars
  assert.ok(shortStrongVariety.score < 2, 'Passwords under 12 chars must score < 2');
  assert.ok(
    shortStrongVariety.feedback.includes('Use pelo menos 12 caracteres.'),
    'Must instruct user to use at least 12 characters'
  );

  const valid12Chars = evaluatePasswordStrength('Aa1!bcdefghij', 'usuario'); // 13 chars
  assert.ok(valid12Chars.score >= 2, '12+ char password with variety must pass score >= 2');
  assert.equal(valid12Chars.feedback.length, 0);
});

test('sanitizeInput and sanitizeTextInput strip HTML tags, control chars, and executable schemes', () => {
  const payload = '  <script>alert(1)</script>javascript:evil() \u0007Texto Seguro  ';
  assert.equal(sanitizeInput(payload), 'alert(1)evil() Texto Seguro');
  assert.equal(sanitizeTextInput(payload), 'alert(1)evil() Texto Seguro');
  assert.equal(isDisposableEmail('user@10minutemail.com'), true);
  assert.equal(isDisposableEmail('engenharia@empresa.com.br'), false);
});

test('identity validation blocks reserved and malformed usernames', () => {
  assert.equal(isValidUsername(normalizeUsername('Nova.Pessoa_1')), true);
  assert.equal(isValidUsername('ab'), false);
  assert.equal(isReservedUsername('Su.Por-te'), true);
  assert.equal(isReservedUsername('admin'), true);
  assert.equal(isReservedUsername('engenheiro_sst'), false);
  assert.equal(displayNameProblem('   '), 'Informe como você quer ser chamado.');
  assert.equal(displayNameProblem('Engenheiro SST'), null);
});

test('mock-auth-store generates ephemeral Ed25519 JWK without exposing private d parameter in MOCK_PUB_JWK', () => {
  assert.equal(MOCK_PUB_JWK.kty, 'OKP');
  assert.equal(MOCK_PUB_JWK.crv, 'Ed25519');
  assert.equal('d' in MOCK_PUB_JWK, false, 'Public JWK must never contain private parameter d');

  const hash = hashMockPassword('SenhaForte#2026');
  const record = {
    id: 'u1',
    email: 'u1@sst.local',
    username: 'u1',
    displayName: 'User 1',
    role: 'user' as const,
    mustChangePassword: false,
    passwordHash: hash,
    createdAt: new Date().toISOString(),
  };
  assert.equal(verifyMockPassword('SenhaForte#2026', record), true);
  assert.equal(verifyMockPassword('SenhaErrada#2026', record), false);
});

test('pruneRateLimitMap and checkLoginRateLimit enforce bounded map size and rate limits', () => {
  const key = 'test-rate-key-devsecops';
  resetLoginRateLimit(key);
  for (let i = 0; i < 3; i++) {
    assert.equal(checkLoginRateLimit(key, 3, 60_000).allowed, true);
  }
  const blocked = checkLoginRateLimit(key, 3, 60_000);
  assert.equal(blocked.allowed, false);
  assert.ok(blocked.retryAfterSec > 0);
  resetLoginRateLimit(key);

  const map = new Map<string, { count: number; expiresAt: number }>();
  const now = Date.now();
  for (let i = 0; i < 1005; i++) {
    map.set(`ip-${i}`, { count: 1, expiresAt: i < 500 ? now - 1000 : now + 60_000 });
  }
  pruneRateLimitMap(map, now);
  assert.ok(map.size < 1000, 'pruneRateLimitMap must evict expired/excess entries below 1000');
});

test('isMockAuthAllowed and resolveCookieSameSite enforce production security defaults', () => {
  assert.equal(typeof isMockAuthAllowed(), 'boolean');
  assert.equal(resolveCookieSameSite(false), 'lax');
});
