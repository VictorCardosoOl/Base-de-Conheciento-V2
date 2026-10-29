'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * SmoothScroll: Gerenciador de rolagem suave (Lenis) sincronizado ao GSAP ScrollTrigger
 * e ao requestAnimationFrame do navegador para garantir 60fps sem engasgos ou quebras.
 *
 * Respeita preferências de redução de movimento (prefers-reduced-motion) e reseta a
 * posição de rolagem ao trocar de rota para evitar páginas abertas no rodapé.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname?.startsWith('/artigo/') && typeof window !== 'undefined' && !window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      lenisRef.current?.scrollTo(0, { immediate: true });
    }
  }, [pathname]);

  useEffect(() => {
    // Desativa Lenis na landing page institucional para evitar conflitos de rolagem
    if (pathname === '/') {
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;

    if (prefersReducedMotion || isTouchDevice) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;
    if (!window.location.hash) {
      lenis.scrollTo(0, { immediate: true });
    }

    lenis.on('scroll', ScrollTrigger.update);

    const updateLenis = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateLenis);

    return () => {
      gsap.ticker.remove(updateLenis);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [pathname === '/']);

  return <>{children}</>;
}
