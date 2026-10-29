import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  hashMockPassword,
  verifyMockPassword,
  checkLoginRateLimit,
  resetLoginRateLimit,
  type MockUserRecord,
} from '../mock-auth-store';
import { contentSecurityPolicy, securityHeaders } from '../security-headers';
import { sanitizeInput, isDisposableEmail, evaluatePasswordStrength } from '../../features/auth/security';
import { scrub } from '../../features/analytics/telemetry';
import { calculateOccupationalAddition } from '../../features/institutional/utils/sstCalculations';

describe('3D Audit Fixes — Security, Telemetry & Domain Logic', () => {
  it('hashes and verifies passwords in constant time via scrypt', () => {
    const hash = hashMockPassword('Seguranca@2026!');
    assert.ok(hash.includes(':'), 'Hash must include salt:derived format');
    assert.notEqual(hash, 'Seguranca@2026!');

    const mockUser: MockUserRecord = {
      id: 'u-1',
      email: 'eng@sst.local',
      username: 'eng_sst',
      displayName: 'Engenheiro SST',
      role: 'user',
      mustChangePassword: false,
      passwordHash: hash,
      createdAt: new Date().toISOString(),
    };

    assert.equal(verifyMockPassword('Seguranca@2026!', mockUser), true);
    assert.equal(verifyMockPassword('senha-incorreta', mockUser), false);
    assert.equal(verifyMockPassword('', mockUser), false);
  });

  it('enforces login rate limiting after maxAttempts', () => {
    const key = '127.0.0.1:ratetest@sst.local';
    resetLoginRateLimit(key);

    for (let i = 0; i < 3; i += 1) {
      const res = checkLoginRateLimit(key, 3, 60_000);
      assert.equal(res.allowed, true);
    }

    const blocked = checkLoginRateLimit(key, 3, 60_000);
    assert.equal(blocked.allowed, false);
    assert.ok(blocked.retryAfterSec > 0);
    resetLoginRateLimit(key);
  });

  it('differentiates Content-Security-Policy between dev and production', () => {
    const devCsp = contentSecurityPolicy(true);
    const prodCsp = contentSecurityPolicy(false);

    assert.ok(devCsp.includes("'unsafe-eval'"), 'Dev CSP allows unsafe-eval for Next dev');
    assert.ok(!prodCsp.includes("'unsafe-eval'"), 'Prod CSP strips unsafe-eval');
    assert.ok(!prodCsp.includes(' ws:'), 'Prod CSP strips unencrypted ws:');
    assert.ok(prodCsp.includes('wss:'), 'Prod CSP retains wss:');

    const prodHeaders = securityHeaders(false);
    assert.ok(prodHeaders.some((h) => h.key === 'Strict-Transport-Security'));
    assert.ok(prodHeaders.some((h) => h.key === 'Permissions-Policy'));
  });

  it('sanitizes HTML tags, ASCII control characters, and executable URI schemes', () => {
    const malicious = '  <script>alert(1)</script>Eng.\u0000 Roberto javascript:alert(2)  ';
    const cleaned = sanitizeInput(malicious, 80);
    assert.equal(cleaned.includes('<script>'), false);
    assert.equal(cleaned.includes('\u0000'), false);
    assert.equal(cleaned.toLowerCase().includes('javascript:'), false);
    assert.ok(cleaned.includes('Eng. Roberto'));
  });

  it('scrubs sensitive keys and handles circular references without stack overflow', () => {
    const cyclic: Record<string, unknown> = {
      username: 'victor',
      password: 'secret-password',
      nested: {
        Authorization: 'Bearer xyz',
        safeField: 'S-2240',
      },
    };
    cyclic.self = cyclic;

    const result = scrub(cyclic);
    assert.equal(result.password, '[Filtered]');
    assert.equal((result.nested as Record<string, unknown>).Authorization, '[Filtered]');
    assert.equal((result.nested as Record<string, unknown>).safeField, 'S-2240');
    assert.equal(result.self, '[Circular]');
  });

  it('evaluates NR-15 vs NR-16 occupational additions accurately', () => {
    const res = calculateOccupationalAddition(4200, 20, 1518);
    assert.equal(res.insalubrityAmount, 303.6);
    assert.equal(res.periculosityAmount, 1260);
    assert.equal(res.recommendedOption, 'periculosidade');
    assert.equal(isDisposableEmail('user@tempmail.com'), true);
    assert.equal(isDisposableEmail('roberto@empresa.com.br'), false);
    assert.ok(evaluatePasswordStrength('Sst@Conformidade2026', 'roberto').score >= 3);
  });

  it('synchronizes light and dark theme state across documentElement and body', async () => {
    const rootClasses = new Set<string>();
    const bodyClasses = new Set<string>();
    const mockDoc = {
      documentElement: {
        classList: {
          toggle: (cls: string, force?: boolean) => {
            if (force) rootClasses.add(cls);
            else rootClasses.delete(cls);
          },
          contains: (cls: string) => rootClasses.has(cls),
        },
        dataset: {} as Record<string, string>,
        style: { colorScheme: '' },
      },
      body: {
        classList: {
          toggle: (cls: string, force?: boolean) => {
            if (force) bodyClasses.add(cls);
            else bodyClasses.delete(cls);
          },
          contains: (cls: string) => bodyClasses.has(cls),
        },
        dataset: {} as Record<string, string>,
      },
    };

    const prevDoc = (globalThis as Record<string, unknown>).document;
    (globalThis as Record<string, unknown>).document = mockDoc;
    try {
      const { applyThemeToDom, setGlobalThemePreference } = await import(
        '../../features/shell/use-theme-preference'
      );
      applyThemeToDom(true);
      assert.equal(rootClasses.has('dark'), true);
      assert.equal(rootClasses.has('theme-alabaster'), false);
      assert.equal(mockDoc.documentElement.dataset.theme, 'dark');
      assert.equal(mockDoc.documentElement.style.colorScheme, 'dark');
      assert.equal(bodyClasses.has('dark'), true);

      // Toggling from live DOM 'dark' state must always switch to light ('theme-alabaster')
      setGlobalThemePreference((prev) => !prev);
      assert.equal(rootClasses.has('dark'), false);
      assert.equal(rootClasses.has('theme-alabaster'), true);
      assert.equal(mockDoc.documentElement.dataset.theme, 'light');
      assert.equal(mockDoc.documentElement.style.colorScheme, 'light');
      assert.equal(bodyClasses.has('theme-alabaster'), true);

      // Toggling again from live DOM 'light' state must switch back to 'dark'
      setGlobalThemePreference((prev) => !prev);
      assert.equal(rootClasses.has('dark'), true);
      assert.equal(rootClasses.has('theme-alabaster'), false);
      assert.equal(mockDoc.documentElement.dataset.theme, 'dark');
    } finally {
      (globalThis as Record<string, unknown>).document = prevDoc;
    }
  });
});

