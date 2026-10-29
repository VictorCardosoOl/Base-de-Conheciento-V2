/**
 * Utilitário seguro para persistência em localStorage
 * com proteção contra falhas de SSR, QuotaExceeded e permissões.
 */

export const safeStorage = {
  getItem<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) return fallback;
      try {
        return JSON.parse(item) as T;
      } catch {
        return item as unknown as T;
      }
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[safeStorage] Falha ao ler chave "${key}":`, err);
      }
      return fallback;
    }
  },

  getString(key: string, fallback = ''): string {
    if (typeof window === 'undefined') return fallback;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return fallback;
      try {
        const parsed = JSON.parse(raw);
        return typeof parsed === 'string' ? parsed : raw;
      } catch {
        return raw;
      }
    } catch {
      return fallback;
    }
  },

  setItem<T>(key: string, value: T): boolean {
    if (typeof window === 'undefined') return false;
    try {
      const payload = typeof value === 'string' ? value : JSON.stringify(value);
      window.localStorage.setItem(key, payload);
      return true;
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[safeStorage] Quota excedida ou falha ao gravar "${key}":`, err);
      }
      return false;
    }
  },

  removeItem(key: string): boolean {
    if (typeof window === 'undefined') return false;
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  },
};
