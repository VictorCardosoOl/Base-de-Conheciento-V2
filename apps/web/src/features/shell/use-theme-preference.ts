'use client';
import { useCallback, useEffect, useSyncExternalStore } from 'react';
import { THEME_STORAGE_KEY } from './theme-storage';
import { safeStorage } from '@/lib/storage';

type ThemeListener = () => void;

declare global {
  interface Window {
    __SST_THEME_DARK__?: boolean;
    __SST_REACT_THEME_READY__?: boolean;
  }
}

const THEME_CHANGE_EVENT = 'sst-theme-change';
const listeners = new Set<ThemeListener>();
let currentThemeState: boolean | null = null;

export function readDomThemeState(): boolean | null {
  if (typeof document === 'undefined' || !document.documentElement) return null;
  const root = document.documentElement;
  if (root.classList.contains('dark') || root.dataset?.theme === 'dark') {
    return true;
  }
  if (root.classList.contains('theme-alabaster') || root.dataset?.theme === 'light') {
    return false;
  }
  return null;
}

function readInitialClientTheme(): boolean {
  if (typeof window === 'undefined') return false;
  const domState = readDomThemeState();
  if (domState !== null) return domState;
  if (typeof window.__SST_THEME_DARK__ === 'boolean') {
    return window.__SST_THEME_DARK__;
  }
  const saved = safeStorage.getString(THEME_STORAGE_KEY, '');
  if (saved === 'true') return true;
  if (saved === 'false') return false;
  return Boolean(
    window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
  );
}

export function applyThemeToDom(isDark: boolean) {
  if (typeof window !== 'undefined') {
    window.__SST_THEME_DARK__ = isDark;
  }
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.toggle('dark', isDark);
  root.classList.toggle('theme-alabaster', !isDark);
  root.dataset.theme = isDark ? 'dark' : 'light';
  root.style.colorScheme = isDark ? 'dark' : 'light';
  if (document.body) {
    document.body.classList.toggle('dark', isDark);
    document.body.classList.toggle('theme-alabaster', !isDark);
    document.body.dataset.theme = isDark ? 'dark' : 'light';
  }
}

function getThemeSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  const domState = readDomThemeState();
  if (domState !== null) {
    currentThemeState = domState;
    return domState;
  }
  if (typeof window.__SST_THEME_DARK__ === 'boolean') {
    currentThemeState = window.__SST_THEME_DARK__;
    return window.__SST_THEME_DARK__;
  }
  if (currentThemeState === null) {
    currentThemeState = readInitialClientTheme();
  }
  return currentThemeState;
}

function getServerThemeSnapshot(): boolean {
  return false;
}

function subscribeTheme(listener: ThemeListener): () => void {
  listeners.add(listener);
  if (typeof window !== 'undefined') {
    window.__SST_REACT_THEME_READY__ = true;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY && event.newValue !== null) {
      const next = event.newValue === 'true';
      if (currentThemeState !== next) {
        currentThemeState = next;
        applyThemeToDom(next);
        listeners.forEach((l) => l());
      }
    }
  };

  const handleCustomThemeEvent = (event: Event) => {
    const customEvent = event as CustomEvent<{ isDark?: boolean }>;
    const next =
      typeof customEvent.detail?.isDark === 'boolean'
        ? customEvent.detail.isDark
        : getThemeSnapshot();
    currentThemeState = next;
    listeners.forEach((l) => l());
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
    window.addEventListener(THEME_CHANGE_EVENT, handleCustomThemeEvent);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener(THEME_CHANGE_EVENT, handleCustomThemeEvent);
    }
  };
}

export function setGlobalThemePreference(
  nextOrUpdater: boolean | ((prev: boolean) => boolean)
) {
  const domState = readDomThemeState();
  const prev = domState !== null ? domState : getThemeSnapshot();
  const next =
    typeof nextOrUpdater === 'function' ? nextOrUpdater(prev) : Boolean(nextOrUpdater);
  currentThemeState = next;
  safeStorage.setItem(THEME_STORAGE_KEY, String(next));
  applyThemeToDom(next);
  listeners.forEach((listener) => listener());
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(
      new CustomEvent(THEME_CHANGE_EVENT, { detail: { isDark: next } })
    );
  }
}

const emptySubscribe = () => () => {};
const getClientMounted = () => true;
const getServerMounted = () => false;

/**
 * Tema claro/escuro sincronizado globalmente entre todos os componentes (Navbar,
 * ClientLayout, InstitutionalLandingPage, telas de Login/Cadastro e Catálogo).
 */
export function useThemePreference() {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    getClientMounted,
    getServerMounted
  );
  const isDarkMode = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot
  );

  useEffect(() => {
    if (!isMounted) return;
    if (typeof window !== 'undefined') {
      window.__SST_REACT_THEME_READY__ = true;
    }
    const domState = readDomThemeState();
    const resolved = domState !== null ? domState : isDarkMode;
    applyThemeToDom(resolved);
    if (resolved !== currentThemeState) {
      currentThemeState = resolved;
      listeners.forEach((l) => l());
    }
  }, [isDarkMode, isMounted]);

  const setIsDarkMode = useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      setGlobalThemePreference(value);
    },
    []
  );

  return { isDarkMode, setIsDarkMode, isMounted };
}
