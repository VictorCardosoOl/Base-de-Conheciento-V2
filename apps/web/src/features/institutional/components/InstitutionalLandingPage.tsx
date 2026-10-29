/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Highlighter,
  Send,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
  BookOpen,
} from 'lucide-react';
import { InstitutionalNavbar } from './InstitutionalNavbar';
import { CommandPaletteModal } from './CommandPaletteModal';
import { FaqAccordionSection } from './FaqAccordionSection';
import { NormativeDossierDrawer } from './NormativeDossierDrawer';
import { InstitutionalFooter } from './InstitutionalFooter';
import { EsocialComplianceAnalytics } from './EsocialComplianceAnalytics';
import ScrollExpand from './ScrollExpand';
import ScrollStack, { ScrollStackItem } from './ScrollStack';
import { NotFoundPage } from './NotFoundPage';
import { SplitTextReveal, MagneticWrapper } from './AwwwardsMotion';
import {
  calculateParallaxOffset,
  calculateOccupationalAddition,
  SECTION_GSAP_CHOREOGRAPHIES,
  getHeroPlateDivergenceVector,
  ARCHITECTURE_SCROLL_EXPAND_PLATES,
  isValidCorporateEmail,
  sanitizeTextInput,
  resolveInstitutionalRoute,
} from '../utils/sstCalculations';
import {
  ESOCIAL_EVENTS,
  GLEAM_ESSAYS,
  MZIA_PILLARS,
  RESEARCH_MATRIX_12,
  FOUNDATION_THESES,
  type EsocialEventCode,
  type NormativeLabTabId,
} from '../data/sstCatalogData';
import { useCardSpotlight, useClipboardCopy } from '../hooks/useInteractiveHooks';
import { useThemePreference } from '@/features/shell/use-theme-preference';
import { AnalyticsService } from '@/features/analytics/analytics-service';

gsap.registerPlugin(ScrollTrigger);
gsap.config({ force3D: true });
ScrollTrigger.config({ ignoreMobileResize: true });

const ACTIVE_SECTION_IDS = [
  'hero',
  'ideia',
  'ensaio',
  'modulos',
  'tecnologia',
  'criadores',
  'faq',
  'sobre',
] as const;

export const InstitutionalLandingPage: React.FC = () => {
  const router = useRouter();
  const pageRef = useRef<HTMLDivElement>(null);
  const heroHeadlineLayerRef = useRef<HTMLDivElement>(null);
  const heroMetaLeftRef = useRef<HTMLDivElement>(null);
  const heroMetaRightRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState('hero');
  const { isDarkMode, setIsDarkMode } = useThemePreference();
  const themeMode: 'alabaster' | 'noir' = isDarkMode ? 'noir' : 'alabaster';
  const [reducedMotion, setReducedMotion] = useState(false);

  // Hero Interactive Plate & Monograph States
  const [archPlateIdx, setArchPlateIdx] = useState(0);
  const [activeDossierCode, setActiveDossierCode] = useState<string | null>(null);

  // Gleam Editorial Essay Carousel State
  const [essayIndex, setEssayIndex] = useState(0);
  const [essayPhotoIdx, setEssayPhotoIdx] = useState(0);

  // MZIA Interactive Console States
  const [activeLabTab, setActiveLabTab] = useState<NormativeLabTabId>('esocial');
  const [selectedEvent, setSelectedEvent] = useState<EsocialEventCode>('S-2240');
  const [baseSalary, setBaseSalary] = useState(4200);
  const [insalGrade, setInsalGrade] = useState<10 | 20 | 40>(20);
  const [protocolCode, setProtocolCode] = useState<'200' | '401' | '162'>('200');
  const [activeFeatureTab, setActiveFeatureTab] = useState<'search' | 'zen' | 'collab'>('search');
  const [highlightActive, setHighlightActive] = useState(true);

  // Modals & Notifications
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Lead Capture Form
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactCompany, setContactCompany] = useState('');
  const [contactError, setContactError] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Catch-All 404 Routing State
  const [routeState, setRouteState] = useState({
    isNotFound: false,
    normalizedPath: '/',
    normalizedHash: '',
    attemptedTarget: '/',
  });

  const creatorsWalkPhoto = '/assets/aistudio/consultoria-auditoria-sst_fd37d9f7.webp';

  const handleCardSpotlightMove = useCardSpotlight(reducedMotion);
  const { copiedKey, copyText } = useClipboardCopy(2200);
  const copiedXml = copiedKey === 'xml';

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Synchronize Catch-All 404 Route Resolution on URL / Hash changes & Intercept Unmapped Links
  useEffect(() => {
    const syncRouteFromLocation = () => {
      const nextRoute = resolveInstitutionalRoute(
        window.location.pathname,
        window.location.hash
      );
      setRouteState(nextRoute);
    };
    syncRouteFromLocation();

    const handleDelegatedAnchorClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest('a');
      if (!anchor) return;
      const rawHref = anchor.getAttribute('href');
      if (!rawHref || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) return;

      try {
        const parsed = new URL(rawHref, window.location.origin);
        if (parsed.origin !== window.location.origin) return;
        // Permite navegacao natural para rotas da aplicacao fora da landing page
        if (parsed.pathname !== '/' && parsed.pathname !== '' && parsed.pathname !== '/index.html') {
          return;
        }
        const check = resolveInstitutionalRoute(parsed.pathname, parsed.hash);
        if (check.isNotFound) {
          e.preventDefault();
          window.history.pushState({}, '', `${parsed.pathname}${parsed.hash}`);
          setRouteState(check);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } catch {
        // Ignore malformed URLs
      }
    };

    window.addEventListener('popstate', syncRouteFromLocation);
    window.addEventListener('hashchange', syncRouteFromLocation);
    document.addEventListener('click', handleDelegatedAnchorClick);
    return () => {
      window.removeEventListener('popstate', syncRouteFromLocation);
      window.removeEventListener('hashchange', syncRouteFromLocation);
      document.removeEventListener('click', handleDelegatedAnchorClick);
    };
  }, []);

  const handleReturnHome = (targetHash?: string) => {
    const cleanHash =
      targetHash && targetHash.startsWith('#') ? targetHash : '';
    const nextUrl = cleanHash ? `/${cleanHash}` : '/';
    window.history.pushState({}, '', nextUrl);
    setRouteState(resolveInstitutionalRoute('/', cleanHash));
    window.requestAnimationFrame(() => {
      if (cleanHash && cleanHash !== '#hero') {
        const el = document.getElementById(cleanHash.slice(1));
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const activeSectionRef = useRef('hero');

  useEffect(() => {
    let rafId = 0;

    const checkActiveSection = () => {
      rafId = 0;
      const matchedSection = ACTIVE_SECTION_IDS.find((sectionId) => {
        const el = document.getElementById(sectionId);
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return rect.top <= 260 && rect.bottom >= 260;
      });

      if (matchedSection && activeSectionRef.current !== matchedSection) {
        activeSectionRef.current = matchedSection;
        setActiveSection(matchedSection);
      }
    };

    const handleScroll = () => {
      if (!rafId) {
        rafId = requestAnimationFrame(checkActiveSection);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // ===========================================================================
  // GSAP + SCROLLTRIGGER DISTINCT CHOREOGRAPHY PER SECTION (7 UNIQUE ARCHETYPES)
  // ===========================================================================
  useEffect(() => {
    if (reducedMotion) return;

    const ctx = gsap.context(() => {
      // -----------------------------------------------------------------------
      // 1. SEÇÃO I — HERO ("BANGRAIN SURYA" EDITORIAL TYPOGRAPHY & HORIZON BANNER):
      //    Archetype: Horizon Aperture Unfold + Full-Bleed Atmospheric Scrub
      // -----------------------------------------------------------------------
      const heroMetaCols = gsap.utils.toArray<HTMLElement>('.gsap-hero-meta-col');
      if (heroMetaCols.length > 0) {
        gsap.fromTo(
          heroMetaCols,
          { y: 14, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.05,
            stagger: 0.1,
            delay: 0.18,
            ease: 'power3.out',
          }
        );

        heroMetaCols.forEach((col, i) => {
          const vec = getHeroPlateDivergenceVector(i);
          gsap.fromTo(
            col,
            { x: 0 },
            {
              x: vec.x * 0.25,
              ease: 'none',
              scrollTrigger: {
                trigger: '#hero',
                start: 'top top',
                end: 'bottom top',
                scrub: 1.45,
              },
            }
          );
        });
      }

      gsap.fromTo(
        '.gsap-hero-horizon-wrap',
        { clipPath: 'inset(12% 0% 0% 0%)', opacity: 0.85 },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          opacity: 1,
          duration: 1.25,
          ease: 'expo.out',
        }
      );

      gsap.fromTo(
        '.gsap-hero-horizon-img',
        { scale: 1.1, yPercent: -3 },
        {
          scale: 1,
          yPercent: 4,
          ease: 'none',
          scrollTrigger: {
            trigger: '#hero',
            start: 'top top',
            end: 'bottom top',
            scrub: 1.5,
          },
        }
      );

      // -----------------------------------------------------------------------
      // 2. SEÇÃO II — A IDEIA ("QUIET REFINEMENT" & "SHAYE"):
      //    Archetype: Alternating Left/Right Hairline Draw + Orthogonal Curtain Clip-Path Wipe
      // -----------------------------------------------------------------------
      gsap.utils.toArray<HTMLElement>('.gsap-foundation-line').forEach((line, idx) => {
        gsap.fromTo(
          line,
          {
            scaleX: 0,
            transformOrigin: idx % 2 === 0 ? 'left center' : 'right center',
          },
          {
            scaleX: 1,
            duration: 1.3,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: line,
              start: 'top 90%',
            },
          }
        );
      });

      gsap.utils.toArray<HTMLElement>('.gsap-foundation-row').forEach((row, idx) => {
        gsap.fromTo(
          row,
          { x: idx % 2 === 0 ? -28 : 28, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 1.05,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: row,
              start: 'top 90%',
            },
          }
        );
      });

      // -----------------------------------------------------------------------
      // 3. SEÇÃO III — CADERNO EDITORIAL ABERTO ("GLEAM*"):
      //    Archetype: Open Editorial Counter-Glide + <ScrollExpand useWindowScroll />
      // -----------------------------------------------------------------------
      gsap.fromTo(
        '.gsap-gleam-bar',
        { scaleX: 0, transformOrigin: 'left center' },
        {
          scaleX: 1,
          duration: 1.25,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: '#ensaio',
            start: 'top 78%',
          },
        }
      );

      // -----------------------------------------------------------------------
      // 4. SEÇÃO IV — OS 4 DOMÍNIOS (<ScrollStack /> FULL-BLEED BANNERS):
      //    Handled via GPU-composited <ScrollStack useWindowScroll />
      // -----------------------------------------------------------------------

      // -----------------------------------------------------------------------
      // 5. SEÇÃO V — ENGENHARIA & MATRIZ:
      //    Archetype: 2D Center-Out Geometric Grid Wave
      // -----------------------------------------------------------------------
      gsap.fromTo(
        '.gsap-research-tile',
        { scale: 0.94, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.75,
          stagger: {
            amount: 0.5,
            grid: [3, 4],
            from: 'center',
          },
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.gsap-research-grid',
            start: 'top 84%',
          },
        }
      );

      // -----------------------------------------------------------------------
      // 6. SEÇÃO VI — SOBRE & OS CRIADORES (GUILHERME & VICTOR):
      //    Archetype: Panoramic Aperture Clip-Path Expansion + Strip Sweep
      // -----------------------------------------------------------------------
      gsap.fromTo(
        '.gsap-etienne-frame',
        { clipPath: 'inset(6% 4% 6% 4%)' },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          ease: 'none',
          scrollTrigger: {
            trigger: '#criadores',
            start: 'top 85%',
            end: 'center center',
            scrub: 1.45,
          },
        }
      );

      gsap.fromTo(
        '.gsap-etienne-photo',
        { scale: 1.1, yPercent: -3 },
        {
          scale: 1,
          yPercent: 3,
          ease: 'none',
          scrollTrigger: {
            trigger: '#criadores',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.45,
          },
        }
      );

      gsap.fromTo(
        '.gsap-etienne-col',
        { x: -24, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.95,
          stagger: 0.14,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.gsap-etienne-strip',
            start: 'top 88%',
          },
        }
      );

      // -----------------------------------------------------------------------
      // SEÇÃO PERGUNTAS FREQUENTES ("FAQ" CADERNO DE DÚVIDAS):
      //    Archetype: Editorial Column Glide + Cascading Accordion Row Stagger
      // -----------------------------------------------------------------------
      gsap.fromTo(
        '.gsap-faq-left',
        { y: 18 },
        {
          y: 0,
          duration: 0.95,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '#faq',
            start: 'top 92%',
          },
        }
      );

      gsap.fromTo(
        '.gsap-faq-row',
        { y: 14 },
        {
          y: 0,
          duration: 0.75,
          stagger: 0.06,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '#faq',
            start: 'top 92%',
          },
        }
      );

      // -----------------------------------------------------------------------
      // 7. SEÇÃO VII — CREDENCIAMENTO & DIÁLOGO ("SOBRE"):
      //    Archetype: Split-Axis Horizontal Convergence + Sequential Blueprint Line Draw
      // -----------------------------------------------------------------------
      gsap.fromTo(
        '.gsap-sobre-left',
        { x: -42, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '#sobre',
            start: 'top 82%',
          },
        }
      );

      gsap.fromTo(
        '.gsap-sobre-right',
        { x: 42, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '#sobre',
            start: 'top 82%',
          },
        }
      );

      gsap.utils.toArray<HTMLElement>('.gsap-blueprint-line').forEach((line, idx) => {
        gsap.fromTo(
          line,
          { scaleX: 0, transformOrigin: 'left center' },
          {
            scaleX: 1,
            duration: 1.05,
            delay: 0.15 + idx * 0.14,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: '#sobre',
              start: 'top 78%',
            },
          }
        );
      });
      const refreshTimer = window.setTimeout(() => {
        ScrollTrigger.refresh();
      }, 280);

      return () => {
        window.clearTimeout(refreshTimer);
      };
    }, pageRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  // Smooth GSAP Editorial Spread Transition when switching Cadernos (#ensaio)
  useEffect(() => {
    if (reducedMotion || !pageRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.gsap-gleam-essay-content',
        { opacity: 0.45 },
        { opacity: 1, duration: 0.55, ease: 'power3.out', overwrite: 'auto' }
      );
    }, pageRef);
    return () => ctx.revert();
  }, [essayIndex, reducedMotion]);

  // Smooth GSAP Laboratory Transition when switching Normative Lab tabs
  useEffect(() => {
    if (reducedMotion || !pageRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.gsap-lab-panel',
        { y: 10, opacity: 0.4 },
        { y: 0, opacity: 1, duration: 0.48, ease: 'power3.out', overwrite: 'auto' }
      );
    }, pageRef);
    return () => ctx.revert();
  }, [activeLabTab, selectedEvent, reducedMotion]);

  const heroRafRef = useRef<number | null>(null);
  const handleHeroMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (reducedMotion) return;
    if (heroRafRef.current) return;
    const el = e.currentTarget;
    const clientX = e.clientX;
    const clientY = e.clientY;
    heroRafRef.current = requestAnimationFrame(() => {
      heroRafRef.current = null;
      const rect = el.getBoundingClientRect();
      const normX = Number((((clientX - rect.left) / rect.width) * 2 - 1).toFixed(3));
      const normY = Number((((clientY - rect.top) / rect.height) * 2 - 1).toFixed(3));

      const headlineOffset = calculateParallaxOffset(normX, normY, 0.32, false);
      const p1Offset = calculateParallaxOffset(normX, normY, -0.85, false);
      const p2Offset = calculateParallaxOffset(normX, normY, 0.65, false);

      el.setAttribute('data-parallax-x', String(headlineOffset.x));
      el.setAttribute('data-parallax-y', String(headlineOffset.y));

      if (heroHeadlineLayerRef.current) {
        gsap.to(heroHeadlineLayerRef.current, {
          x: headlineOffset.x,
          y: headlineOffset.y,
          duration: 0.65,
          ease: 'power3.out',
          overwrite: 'auto',
        });
      }
      if (heroMetaLeftRef.current) {
        gsap.to(heroMetaLeftRef.current, {
          x: p1Offset.x * 0.25,
          y: p1Offset.y * 0.25,
          duration: 0.75,
          ease: 'power3.out',
          overwrite: 'auto',
        });
      }
      if (heroMetaRightRef.current) {
        gsap.to(heroMetaRightRef.current, {
          x: p2Offset.x * 0.25,
          y: p2Offset.y * 0.25,
          duration: 0.75,
          ease: 'power3.out',
          overwrite: 'auto',
        });
      }
    });
  };

  const handleHeroMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.setAttribute('data-parallax-x', '0');
    e.currentTarget.setAttribute('data-parallax-y', '0');
    if (heroHeadlineLayerRef.current) {
      gsap.to(heroHeadlineLayerRef.current, { x: 0, y: 0, duration: 0.65, ease: 'power3.out', overwrite: 'auto' });
    }
    if (heroMetaLeftRef.current) {
      gsap.to(heroMetaLeftRef.current, { x: 0, y: 0, duration: 0.75, ease: 'power3.out', overwrite: 'auto' });
    }
    if (heroMetaRightRef.current) {
      gsap.to(heroMetaRightRef.current, { x: 0, y: 0, duration: 0.75, ease: 'power3.out', overwrite: 'auto' });
    }
  };

  const additionCalc = calculateOccupationalAddition(baseSalary, insalGrade);
  const activeEvtData = ESOCIAL_EVENTS[selectedEvent];
  const currentEssay = GLEAM_ESSAYS[essayIndex];

  const handleOpenLogin = () => {
    router.push('/login');
  };

  const handleOpenRegister = () => {
    router.push('/cadastro');
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactError('');
    const sanitizedName = sanitizeTextInput(contactName, 120);
    const sanitizedEmail = sanitizeTextInput(contactEmail, 160);
    const sanitizedCompany = sanitizeTextInput(contactCompany, 140);

    if (!sanitizedName) {
      setContactError('Por favor, informe seu nome completo.');
      return;
    }
    if (!isValidCorporateEmail(sanitizedEmail)) {
      setContactError('Por favor, informe um e-mail corporativo válido.');
      return;
    }
    if (!sanitizedCompany) {
      setContactError('Por favor, informe a razão social ou instituição.');
      return;
    }
    setContactName(sanitizedName);
    setContactEmail(sanitizedEmail);
    setContactCompany(sanitizedCompany);
    setContactSubmitted(true);
    AnalyticsService.trackEvent('lead_submitted', {
      hasOrganization: Boolean(sanitizedCompany),
    });
  };

  const prefilledRegisterHref = `/cadastro?${new URLSearchParams({
    ...(contactName ? { name: contactName } : {}),
    ...(contactEmail ? { email: contactEmail } : {}),
    ...(contactCompany ? { org: contactCompany } : {}),
  }).toString()}`;

  return (
    <div
      ref={pageRef}
      data-theme-mode={themeMode}
      className="relative min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] editorial-grain"
    >
      {/* Smart Auto-Hiding Institutional Navbar */}
      <InstitutionalNavbar
        activeSection={activeSection}
        onOpenLogin={handleOpenLogin}
        isNotFoundView={routeState.isNotFound}
        onNavigateHome={handleReturnHome}
      />

      {routeState.isNotFound ? (
        <main className="relative z-10">
          <NotFoundPage
            attemptedPath={routeState.attemptedTarget}
            themeMode={themeMode}
            onReturnHome={() => handleReturnHome('#hero')}
            onOpenSearch={() => setCommandPaletteOpen(true)}
            onSelectDossierCode={(code) => setActiveDossierCode(code)}
          />
          <InstitutionalFooter
            onOpenLogin={handleOpenLogin}
            onOpenRegister={handleOpenRegister}
            onOpenSearch={() => setCommandPaletteOpen(true)}
            onSelectDossierCode={(code) => setActiveDossierCode(code)}
            isNotFoundView={true}
            onNavigateHome={handleReturnHome}
          />
        </main>
      ) : (
        <main className="relative z-10">
        {/* ===================================================================== */}
        {/* SEÇÃO I — HERO ("BANGRAIN SURYA" CLEAN TYPOGRAPHY + HORIZON BANNER)   */}
        {/* ===================================================================== */}
        <section
          id="hero"
          data-testid="hero-parallax-section"
          data-gsap-archetype={SECTION_GSAP_CHOREOGRAPHIES.hero.archetype}
          data-parallax-x={0}
          data-parallax-y={0}
          onMouseMove={handleHeroMouseMove}
          onMouseLeave={handleHeroMouseLeave}
          className="relative min-h-screen lg:h-screen lg:min-h-[640px] lg:max-h-[1120px] 2xl:min-h-[720px] 2xl:max-h-[1200px] 3xl:min-h-[820px] 3xl:max-h-[1360px] 4xl:min-h-[920px] 4xl:max-h-[1500px] flex flex-col justify-between border-b border-[var(--border-hairline)] mesh-gradient-hero overflow-hidden pt-20 sm:pt-24 2xl:pt-32 3xl:pt-40 4xl:pt-48"
        >
          {/* Ambient Chromatic Orbs for Frosted Glass Depth */}
          <div
            aria-hidden="true"
            className="ambient-glass-orb-sage absolute top-16 left-[12%] w-[320px] sm:w-[420px] h-[320px] sm:h-[420px] rounded-full"
          />
          <div
            aria-hidden="true"
            className="ambient-glass-orb-fjord absolute top-24 right-[12%] w-[320px] sm:w-[460px] h-[320px] sm:h-[460px] rounded-full"
          />

          {/* Upper Editorial Area: Centered 3-Line Pure Headline + Subtitle */}
          <div className="flex-1 flex flex-col justify-center w-full max-w-[1920px] 3xl:max-w-[2200px] 4xl:max-w-[2560px] mx-auto px-4 sm:px-8 lg:px-16 2xl:px-24 3xl:px-32 4xl:px-44 relative z-10 py-8 lg:py-12 2xl:py-16 3xl:py-20">
            {/* Centerpiece 3-Line Pure Typography */}
            <div
              ref={heroHeadlineLayerRef}
              data-testid="hero-typography-parallax"
              className="my-auto text-center max-w-5xl 2xl:max-w-6xl 3xl:max-w-7xl mx-auto py-5 sm:py-6 will-change-transform"
            >
              <h1
                aria-label="CONSTRUÍMOS BASES QUE VÃO MUITO ALÉM DA FORMA LEGAL"
                className="flex flex-col items-center justify-center gap-1.5 sm:gap-2 text-[clamp(1.75rem,5.2vw,4.5rem)] font-normal tracking-[-0.03em] uppercase text-[var(--text-primary)] leading-[1.08]"
              >
                {/* Line 1: CONSTRUÍMOS BASES */}
                <span className="block">
                  <SplitTextReveal
                    as="span"
                    charStagger={0.014}
                    text="CONSTRUÍMOS BASES"
                    className="inline-block"
                  />
                </span>

                {/* Line 2: QUE VÃO MUITO ALÉM */}
                <span className="block">
                  <SplitTextReveal
                    as="span"
                    delay={0.08}
                    charStagger={0.014}
                    text="QUE VÃO MUITO ALÉM"
                    className="inline-block"
                  />
                </span>

                {/* Line 3: DA FORMA LEGAL */}
                <span className="block">
                  <SplitTextReveal
                    as="span"
                    delay={0.16}
                    charStagger={0.014}
                    text="DA FORMA"
                    highlightText="LEGAL"
                    highlightClassName="font-normal"
                    className="inline-block"
                  />
                </span>
              </h1>

              {/* Centered 2-Line Subtitle directly below headline */}
              <p className="mt-4 sm:mt-5 2xl:mt-6 text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl mx-auto leading-[1.7] font-normal">
                Portal unificado de procedimentos operacionais, eventos de SST no eSocial (S-2210,
                S-2220, S-2221 e S-2240), Gestão de Riscos Ocupacionais (PGR, PCMSO, LTCAT) e
                padronização de atendimento técnico.
              </p>

              {/* Direct Navigation Action Row */}
              <div className="mt-6 sm:mt-7 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/artigos"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-xs sm:text-sm font-semibold bg-[var(--accent-editorial)] text-white hover:opacity-95 shadow-sm transition-all cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Explorar Catálogo de Artigos</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Full-Bleed Atmospheric Horizon Banner (Single SST image ready for video embedding) */}
          <div className="gsap-hero-horizon-wrap relative w-full h-[40vh] sm:h-[42vh] 2xl:h-[46vh] 3xl:h-[50vh] 4xl:h-[54vh] min-h-[260px] 2xl:min-h-[320px] 3xl:min-h-[380px] 4xl:min-h-[440px] max-h-[480px] 2xl:max-h-[580px] 3xl:max-h-[680px] 4xl:max-h-[780px] shrink-0 overflow-hidden border-t border-[var(--border-hairline)] bg-[#0B0F14] group">
            <img
              src="/assets/aistudio/canteiro-obras-engenharia_6dfcef7e.webp"
              alt="Ambiente Operacional e Engenharia de Segurança do Trabalho"
              width={1920}
              height={1080}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="gsap-hero-horizon-img w-full h-full object-cover object-center contrast-105 will-change-transform"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080C11]/85 via-[#080C11]/25 to-black/10"
            />

            {/* Clean Editorial Caption (No Switchers or Buttons) */}
            <div className="absolute inset-x-0 bottom-4 sm:bottom-5 z-20 w-full max-w-[1920px] 3xl:max-w-[2200px] 4xl:max-w-[2560px] mx-auto px-4 sm:px-8 lg:px-16 2xl:px-24 3xl:px-32 4xl:px-44">
              <div className="inline-flex items-center gap-2 text-xs text-white/90 bg-[#0B0D10]/65 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full">
                <span className="font-medium text-white">Ambiente Operacional</span>
                <span aria-hidden="true" className="text-white/40">·</span>
                <span className="text-white/75">Vigilância e conformidade em Saúde e Segurança do Trabalho</span>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* SEÇÃO II — ARQUITETURA DO PROJETO (SCROLL EXPAND + HOVER LEGEND)      */}
        {/* ===================================================================== */}
        <section
          id="ideia"
          data-gsap-archetype={SECTION_GSAP_CHOREOGRAPHIES.ideia.archetype}
          className="relative border-b border-[var(--border-hairline)] mesh-gradient-bento pt-24 lg:pt-36 2xl:pt-44 3xl:pt-56 4xl:pt-64"
        >
          {/* Ambient Chromatic Orbs for Frosted Glass Refraction */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="ambient-glass-orb-sage absolute top-28 right-[14%] w-[460px] h-[460px] rounded-full" />
            <div className="ambient-glass-orb-fjord absolute bottom-20 left-[10%] w-[520px] h-[520px] rounded-full" />
          </div>

          <div className="relative z-10 w-full max-w-[1920px] 3xl:max-w-[2200px] 4xl:max-w-[2560px] mx-auto px-6 sm:px-10 lg:px-16 2xl:px-24 3xl:px-32 4xl:px-44 pb-20 lg:pb-32 2xl:pb-40 3xl:pb-48 4xl:pb-56">
            {/* Open Editorial Layout: Generous Breathing Room, Elevated Typography & Borderless Flow */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-20 2xl:gap-28 items-start">
              {/* Left Column: Expanded Manifesto Statement */}
              <div className="lg:col-span-5 space-y-8">
                <div className="space-y-5">
                  <span className="text-xs font-mono uppercase tracking-[0.25em] text-[var(--accent-ochre)] block">
                    Origem Real &middot; Da Equipe para a Equipe
                  </span>

                  <SplitTextReveal
                    as="h2"
                    text="De processos dispersos a uma base"
                    highlightText="viva e auditável."
                    className="font-editorial text-4xl sm:text-5xl lg:text-[3.5rem] font-normal text-[var(--text-primary)] leading-[1.08] max-w-xl"
                  />
                </div>

                <div className="space-y-5 text-base sm:text-lg text-[var(--text-secondary)] leading-[1.75] max-w-prose">
                  <p>
                    A Base SST nasceu dentro de uma equipe operacional de Saúde e
                    Segurança do Trabalho e eSocial. Antes, fluxos de sistemas, tratativas de
                    protocolos e regras de eventos eram repassados apenas verbalmente, gerando ruído
                    de comunicação, respostas divergentes e demora no treinamento de novos colegas.
                  </p>
                  <p className="font-editorial italic text-xl sm:text-2xl text-[var(--text-primary)] leading-relaxed pt-2 border-l-2 border-[var(--accent-ochre)] pl-5 my-4">
                    &ldquo;Reunimos todo o conhecimento operacional da equipe em um portal único de
                    consulta rápida, com busca tolerante a erros, leitura focada e ciclo de revisão
                    a cada 12 meses.&rdquo;
                  </p>
                </div>
              </div>

              {/* Right Column: Borderless, Spacious Editorial Principles (1 to 5) */}
              <div className="lg:col-span-7 divide-y divide-[var(--border-hairline)] pt-2 lg:pt-0">
                {FOUNDATION_THESES.map((item) => {
                  return (
                    <div
                      key={item.num}
                      onClick={() => {
                        setActiveDossierCode(item.dossierCode);
                      }}
                      className="group py-6 sm:py-7 first:pt-0 last:pb-0 cursor-pointer transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 sm:gap-6">
                        <div className="flex items-baseline gap-4">
                          <span className="font-editorial text-2xl sm:text-3xl font-light text-[var(--accent-ochre)] shrink-0">
                            {item.num}
                          </span>
                          <div className="space-y-1.5">
                            <span className="text-xs font-mono tracking-widest uppercase text-[var(--text-muted)] block">
                              {item.domain}
                            </span>
                            <p className="font-editorial text-xl sm:text-2xl text-[var(--text-primary)] leading-snug group-hover:text-[var(--accent-ochre)] transition-colors">
                              {item.thesis}
                            </p>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] group-hover:text-[var(--text-primary)] shrink-0 self-end sm:self-auto transition-colors">
                          <span className="font-mono">{item.dossierCode}</span>
                          <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Part B: React Bits <ScrollExpand /> Full-Stage Architectural Media */}
          <div className="relative z-10 w-full">
            <ScrollExpand
              src={ARCHITECTURE_SCROLL_EXPAND_PLATES[archPlateIdx].src}
              alt={ARCHITECTURE_SCROLL_EXPAND_PLATES[archPlateIdx].alt}
              title={ARCHITECTURE_SCROLL_EXPAND_PLATES[archPlateIdx].title}
              scrollHint="Role para expandir"
              startWidth={42}
              startHeight={58}
              startRadius={24}
              endRadius={0}
              mediaZoom={1.35}
              scrollDistance={1.2}
              holdDistance={0.35}
              smoothing={0.1}
              overlayScrim={0.45}
              useWindowScroll
            >
              <div className="max-w-3xl mx-auto px-6 space-y-5">
                <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 font-tabular text-[11px] uppercase tracking-[0.2em] text-white/90">
                  <span>{ARCHITECTURE_SCROLL_EXPAND_PLATES[archPlateIdx].code}</span>
                  <span aria-hidden="true" className="text-[#68B2A0]">
                    ·
                  </span>
                  <span>{ARCHITECTURE_SCROLL_EXPAND_PLATES[archPlateIdx].normativeAnchor}</span>
                </span>

                <h2 className="font-editorial text-3xl sm:text-5xl 2xl:text-6xl font-normal text-white leading-[1.08] tracking-tight">
                  {ARCHITECTURE_SCROLL_EXPAND_PLATES[archPlateIdx].title}
                </h2>

                <p className="text-sm sm:text-base text-white/90 max-w-2xl mx-auto leading-relaxed">
                  {ARCHITECTURE_SCROLL_EXPAND_PLATES[archPlateIdx].subtitle}{' '}
                  {ARCHITECTURE_SCROLL_EXPAND_PLATES[archPlateIdx].footerLegendText}
                </p>

                {/* Interactive Plate Selector inside the Expanded Stage */}
                <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                  {ARCHITECTURE_SCROLL_EXPAND_PLATES.map((plate, idx) => {
                    const isSelected = archPlateIdx === idx;
                    return (
                      <button
                        key={plate.id}
                        type="button"
                        onClick={() => setArchPlateIdx(idx)}
                        className={`min-h-[44px] px-4 py-2 rounded-full text-xs font-tabular transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white text-[#11151A] font-medium shadow-md'
                            : 'bg-[#0B0F14]/65 hover:bg-[#0B0F14]/85 text-white/80 hover:text-white border border-white/15 backdrop-blur-md'
                        }`}
                      >
                        {plate.code} · {plate.title.split(' ')[0]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </ScrollExpand>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* SEÇÃO III — CADERNO EDITORIAL ABERTO (VIEWERBOX + <ScrollExpand />)   */}
        {/* ===================================================================== */}
        <section
          id="ensaio"
          data-gsap-archetype={SECTION_GSAP_CHOREOGRAPHIES.ensaio.archetype}
          className="relative border-b border-[var(--border-hairline)] mesh-gradient-tech pt-24 lg:pt-36 2xl:pt-44 3xl:pt-56 4xl:pt-64"
        >
          {/* Ambient Chromatic Orbs for Frosted Glass Depth */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="ambient-glass-orb-fjord absolute top-16 left-[18%] w-[440px] h-[440px] rounded-full" />
            <div className="ambient-glass-orb-sage absolute bottom-16 right-[12%] w-[480px] h-[480px] rounded-full" />
          </div>

          <div className="relative z-10 w-full max-w-[1920px] 3xl:max-w-[2200px] 4xl:max-w-[2560px] mx-auto px-6 sm:px-10 lg:px-16 2xl:px-24 3xl:px-32 4xl:px-44 pb-14 lg:pb-20 2xl:pb-28 3xl:pb-36 4xl:pb-44 space-y-12 lg:space-y-16 2xl:space-y-20">
            {/* Practical 4-Essay Direct Navigation Index (Frosted Glass Cards) */}
            <div
              role="tablist"
              aria-label="Cadernos Editoriais da Base SST"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 2xl:gap-6"
            >
              {GLEAM_ESSAYS.map((essay, idx) => {
                const isActive = essayIndex === idx;
                return (
                  <button
                    key={essay.index}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    data-glass-active={isActive}
                    onMouseMove={handleCardSpotlightMove}
                    onClick={() => {
                      setEssayIndex(idx);
                      setEssayPhotoIdx(0);
                    }}
                    className="glass-interactive-tile rounded-2xl group relative h-full flex flex-col justify-between text-left py-5 2xl:py-6 px-5 sm:px-6 2xl:px-7 transition-all"
                  >
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute bottom-0 left-4 right-4 h-[2.5px] rounded-full bg-gradient-to-r from-[#3D8B7D] via-[#68B2A0] to-[#4A7A96]"
                      />
                    )}
                    <div className="w-full flex items-center justify-between text-xs text-[var(--text-muted)] mb-3">
                      <span className={isActive ? 'text-[var(--text-primary)] font-medium' : ''}>
                        Ensaio {essay.index}
                      </span>
                      <span className="font-tabular">{essay.dossierCode}</span>
                    </div>
                    <div
                      className={`font-editorial text-xl sm:text-[1.35rem] 2xl:text-2xl leading-snug transition-colors my-auto ${
                        isActive
                          ? 'text-[var(--text-primary)] font-normal'
                          : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] font-light'
                      }`}
                    >
                      {essay.title}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-2 truncate w-full">
                      {essay.subtitle}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 12-Column Editorial Header & Viewerbox Control Panel */}
            <div className="gsap-gleam-essay-content grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 2xl:gap-20 items-stretch">
              {/* Left Column: Editorial Prose & Dossier Controls (6 Columns) */}
              <div
                onMouseMove={handleCardSpotlightMove}
                className="gsap-gleam-left-col mzia-frame p-7 sm:p-9 2xl:p-11 lg:col-span-6 flex flex-col justify-between space-y-6"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
                    <span>Por {currentEssay.curator}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-tabular text-[var(--text-secondary)]">
                      {currentEssay.dossierCode}
                    </span>
                  </div>

                  <h2 className="font-editorial text-4xl sm:text-5xl 2xl:text-6xl font-normal text-[var(--text-primary)] leading-[1.08]">
                    {currentEssay.title}
                  </h2>

                  <p className="text-xs text-[var(--text-muted)]">
                    {currentEssay.verticalNote}
                  </p>
                </div>

                <div className="gsap-gleam-bar w-16 h-[1px] bg-[var(--border-hairline)]" />

                <div className="space-y-4 max-w-prose">
                  <p className="text-sm text-[var(--text-secondary)] leading-[1.85]">
                    {currentEssay.excerpt}
                  </p>
                  <div className="py-3.5 border-y border-[var(--border-hairline)]">
                    <p className="font-editorial italic text-xl sm:text-2xl text-[var(--text-primary)] leading-relaxed">
                      &ldquo;{currentEssay.highlight}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Practical Action & Sequential Step Bar */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveDossierCode(currentEssay.dossierCode)}
                    className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-spectral-gradient text-xs font-medium transition-all whitespace-nowrap cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Ler dossiê {currentEssay.dossierCode}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Ensaio anterior"
                      onClick={() => {
                        setEssayIndex((prev) => (prev === 0 ? GLEAM_ESSAYS.length - 1 : prev - 1));
                        setEssayPhotoIdx(0);
                      }}
                      className="min-h-[44px] inline-flex items-center gap-1 px-3.5 py-2 rounded-xl glass-interactive-tile text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Anterior</span>
                    </button>
                    <button
                      type="button"
                      aria-label="Próximo ensaio"
                      onClick={() => {
                        setEssayIndex((prev) => (prev === GLEAM_ESSAYS.length - 1 ? 0 : prev + 1));
                        setEssayPhotoIdx(0);
                      }}
                      className="min-h-[44px] inline-flex items-center gap-1 px-3.5 py-2 rounded-xl glass-interactive-tile text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer"
                    >
                      <span>Próximo</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Viewerbox Gallery Index & 3-Plate Selector (6 Columns) */}
              <div
                onMouseMove={handleCardSpotlightMove}
                className="gsap-gleam-center-col mzia-frame p-6 sm:p-8 lg:col-span-6 flex flex-col justify-between space-y-5"
              >
                {(() => {
                  const essayPhotos = [
                    currentEssay.mainImg,
                    currentEssay.subImg1,
                    currentEssay.subImg2,
                  ];
                  const activePhotoCaption =
                    currentEssay.plateCaptions[essayPhotoIdx] ?? currentEssay.plateCaptions[0];
                  const romanNumerals = ['I', 'II', 'III'] as const;

                  return (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="space-y-1">
                          <span className="text-[11px] font-tabular uppercase tracking-[0.2em] text-[var(--accent-ochre)] block">
                            Viewerbox Documental · {currentEssay.dossierCode}
                          </span>
                          <h3 className="font-editorial text-2xl sm:text-3xl text-[var(--text-primary)] font-normal">
                            {activePhotoCaption}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-tabular text-[var(--text-muted)] px-2">
                            Figura {essayPhotoIdx + 1} de {essayPhotos.length}
                          </span>
                          <button
                            type="button"
                            aria-label="Imagem anterior no viewerbox"
                            onClick={() =>
                              setEssayPhotoIdx((prev) =>
                                prev === 0 ? essayPhotos.length - 1 : prev - 1,
                              )
                            }
                            className="w-9 h-9 rounded-xl inline-flex items-center justify-center bg-[#ECE9E2] dark:bg-white/[0.06] text-[var(--text-primary)] hover:bg-[#1C4E46] hover:text-white transition-colors cursor-pointer"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            aria-label="Próxima imagem no viewerbox"
                            onClick={() =>
                              setEssayPhotoIdx((prev) =>
                                prev === essayPhotos.length - 1 ? 0 : prev + 1,
                              )
                            }
                            className="w-9 h-9 rounded-xl inline-flex items-center justify-center bg-[#ECE9E2] dark:bg-white/[0.06] text-[var(--text-primary)] hover:bg-[#1C4E46] hover:text-white transition-colors cursor-pointer"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* 3-Plate Viewerbox Thumbnail Grid */}
                      <div
                        role="group"
                        aria-label="Galeria de lâminas do Viewerbox"
                        className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-auto"
                      >
                        {essayPhotos.map((photoSrc, pIdx) => {
                          const isSelected = essayPhotoIdx === pIdx;
                          return (
                            <button
                              key={photoSrc}
                              type="button"
                              data-glass-active={isSelected}
                              onClick={() => setEssayPhotoIdx(pIdx)}
                              aria-label={`Visualizar ${currentEssay.plateCaptions[pIdx]}`}
                              aria-pressed={isSelected}
                              className={`group rounded-2xl p-2.5 text-left space-y-2.5 transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#1C4E46] text-white shadow-md'
                                  : 'bg-[#ECE9E2]/80 dark:bg-white/[0.04] hover:bg-[#ECE9E2] dark:hover:bg-white/[0.08] text-[var(--text-primary)]'
                              }`}
                            >
                              <div className="aspect-[16/10] w-full overflow-hidden rounded-xl bg-[#141715]">
                                <img
                                  src={photoSrc}
                                  alt={currentEssay.plateCaptions[pIdx]}
                                  className="w-full h-full object-cover editorial-photo group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                              <div className="px-1 space-y-0.5">
                                <div
                                  className={`text-[10px] font-tabular uppercase tracking-wider ${
                                    isSelected ? 'text-[#8CD1BE]' : 'text-[var(--text-muted)]'
                                  }`}
                                >
                                  Lâmina {romanNumerals[pIdx]}
                                </div>
                                <div
                                  className={`text-xs font-medium line-clamp-2 leading-snug ${
                                    isSelected ? 'text-white' : 'text-[var(--text-primary)]'
                                  }`}
                                >
                                  {currentEssay.plateCaptions[pIdx]}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-1">
                        <span>
                          Selecione uma das 3 lâminas acima e role a página para expandir o palco
                        </span>
                        <span className="font-tabular text-[var(--text-secondary)]">
                          ScrollExpand · 100% Stage
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Part B: React Bits <ScrollExpand useWindowScroll /> Full-Stage Viewerbox */}
          {(() => {
            const essayPhotos = [
              currentEssay.mainImg,
              currentEssay.subImg1,
              currentEssay.subImg2,
            ];
            const activePhotoSrc = essayPhotos[essayPhotoIdx] ?? currentEssay.mainImg;
            const activePhotoCaption =
              currentEssay.plateCaptions[essayPhotoIdx] ?? currentEssay.plateCaptions[0];
            const romanNumerals = ['I', 'II', 'III'] as const;

            return (
              <div data-testid="ensaio-viewerbox" className="relative z-10 w-full">
                <ScrollExpand
                  src={activePhotoSrc}
                  alt={`${currentEssay.title} — ${activePhotoCaption}`}
                  title={activePhotoCaption}
                  scrollHint="Role para expandir"
                  startWidth={42}
                  startHeight={58}
                  startRadius={24}
                  endRadius={0}
                  mediaZoom={1.35}
                  scrollDistance={1.2}
                  holdDistance={0.35}
                  smoothing={0.1}
                  overlayScrim={0.45}
                  useWindowScroll
                >
                  <div className="max-w-3xl mx-auto px-6 space-y-5">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/10 backdrop-blur-md text-[11px] font-tabular uppercase tracking-[0.2em] text-white/90">
                      <span>{currentEssay.dossierCode}</span>
                      <span aria-hidden="true" className="text-[#68B2A0]">
                        ·
                      </span>
                      <span>
                        Figura {essayPhotoIdx + 1} de {essayPhotos.length}
                      </span>
                    </span>

                    <h2>{activePhotoCaption}</h2>

                    <p>{currentEssay.excerpt}</p>

                    {/* Interactive Viewerbox 3-Image Switcher inside the Expanded Stage */}
                    <div className="pt-3 flex flex-wrap items-center justify-center gap-2.5">
                      {essayPhotos.map((photoSrc, pIdx) => {
                        const isSelected = essayPhotoIdx === pIdx;
                        return (
                          <button
                            key={photoSrc}
                            type="button"
                            onClick={() => setEssayPhotoIdx(pIdx)}
                            className={`min-h-[44px] inline-flex items-center gap-2.5 pl-2 pr-4 py-1.5 rounded-lg text-xs font-tabular transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-white text-[#11151A] font-medium shadow-md'
                                : 'bg-[#0B0F14]/70 hover:bg-[#0B0F14]/90 text-white/85 hover:text-white backdrop-blur-md'
                            }`}
                          >
                            <img
                              src={photoSrc}
                              alt={currentEssay.plateCaptions[pIdx]}
                              className="w-7 h-7 rounded-md object-cover shrink-0"
                            />
                            <span>
                              {romanNumerals[pIdx]} · {currentEssay.plateCaptions[pIdx]}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </ScrollExpand>
              </div>
            );
          })()}
        </section>

        {/* ===================================================================== */}
        {/* SEÇÃO IV — OS 4 DOMÍNIOS (<ScrollStack /> FULL-BLEED STAGE BANNERS)   */}
        {/* ===================================================================== */}
        <section
          id="modulos"
          data-gsap-archetype={SECTION_GSAP_CHOREOGRAPHIES.modulos.archetype}
          className="relative border-b border-[var(--border-hairline)] mesh-gradient-bento pt-28 lg:pt-40 2xl:pt-48 3xl:pt-60 4xl:pt-72 pb-24 lg:pb-36 2xl:pb-48 3xl:pb-56 4xl:pb-64"
        >
          {/* Ambient Chromatic Orbs for Frosted Glass Refraction */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="ambient-glass-orb-sage absolute top-32 left-[8%] w-[520px] h-[520px] rounded-full" />
            <div className="ambient-glass-orb-fjord absolute top-[45%] right-[10%] w-[540px] h-[540px] rounded-full" />
          </div>

          {/* Centered Editorial Section Header */}
          <div className="relative z-10 w-full max-w-[1920px] 3xl:max-w-[2200px] 4xl:max-w-[2560px] mx-auto px-6 sm:px-10 lg:px-16 2xl:px-24 3xl:px-32 4xl:px-44">
            <div className="text-center max-w-3xl mx-auto mb-16 lg:mb-24 2xl:mb-28 space-y-4">
              <SplitTextReveal
                as="h2"
                text="Quatro domínios técnicos sob"
                highlightText="guarda institucional."
                className="font-editorial text-4xl sm:text-5xl lg:text-6xl 2xl:text-7xl font-light text-[var(--text-primary)] leading-[1.08]"
              />
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-[1.8] max-w-xl mx-auto">
                Ao autenticar na plataforma, sua operação acessa matrizes homologadas, schemas XSD e
                pareceres previdenciários estruturados em quatro pilares.
              </p>
            </div>
          </div>

          {/* React Bits <ScrollStack /> Full-Bleed Edge-to-Edge Domain Banners */}
          <div className="relative z-10 w-full mb-20 lg:mb-28">
            <ScrollStack
              useWindowScroll
              smoothScroll={false}
              stackPosition={0}
              itemDistance={0}
              itemStackDistance={0}
              itemScale={0}
              baseScale={1}
              dimAmount={0.35}
              holdDistance={0}
            >
              {MZIA_PILLARS.map((pilar, idx) => (
                <ScrollStackItem key={pilar.roman}>
                  <img
                    src={pilar.imgPrimary}
                    alt={`${pilar.title} — ${pilar.subtitle}`}
                    draggable={false}
                    className="scroll-stack-card__media absolute inset-0 w-full h-full object-cover object-center select-none"
                  />

                  {/* Full-Stage Editorial Scrim for High-Contrast Readability */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-[#080C11]/45 via-[#080C11]/62 to-[#080C11]/88"
                  />

                  {/* Centered Stage Legend (Matching the Architecture Section Style) */}
                  <div className="absolute inset-0 z-[2] flex flex-col items-center justify-center text-center px-6 sm:px-10">
                    <div className="max-w-3xl mx-auto space-y-5">
                      <span className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 font-tabular text-[11px] uppercase tracking-[0.2em] text-white/90">
                        <span className="text-[#68B2A0] font-semibold">
                          Domínio {pilar.roman}
                        </span>
                        <span aria-hidden="true" className="text-white/35">
                          ·
                        </span>
                        <span>{pilar.subtitle}</span>
                      </span>

                      <h3 className="font-editorial text-3xl sm:text-5xl lg:text-6xl 2xl:text-[4rem] font-normal text-white leading-[1.08] tracking-tight">
                        {pilar.title}
                      </h3>

                      <p className="text-sm sm:text-base text-white/85 max-w-2xl mx-auto leading-relaxed">
                        {pilar.description}
                      </p>

                      <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveLabTab(pilar.tabTarget);
                            document
                              .getElementById('laboratorio-normativo')
                              ?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="min-h-[48px] inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#11151A] hover:bg-[#F4F2ED] text-xs font-medium shadow-lg transition-all cursor-pointer"
                        >
                          <span>Explorar {pilar.title}</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Clean Bottom Section-End Bar (Seamless, No Top/Bottom Borders) */}
                  <div className="absolute inset-x-0 bottom-0 z-[2] bg-gradient-to-t from-[#080C11]/90 to-transparent px-4 sm:px-8 lg:px-16 2xl:px-24 py-4 sm:py-5">
                    <div className="max-w-[1920px] 3xl:max-w-[2200px] 4xl:max-w-[2560px] mx-auto flex flex-wrap items-center justify-between gap-2 text-[11px] font-tabular text-white/75">
                      <div className="flex items-center gap-2">
                        <span className="text-[#68B2A0]">0{idx + 1} / 04</span>
                        <span aria-hidden="true" className="text-white/30">
                          ·
                        </span>
                        <span className="font-editorial italic text-white/85 text-xs">
                          {pilar.memoryLabel}
                        </span>
                      </div>
                      <span className="uppercase tracking-[0.18em] text-white/70">
                        {pilar.subtitle}
                      </span>
                    </div>
                  </div>
                </ScrollStackItem>
              ))}
            </ScrollStack>
          </div>

          <div className="relative z-10 w-full max-w-[1920px] 3xl:max-w-[2200px] 4xl:max-w-[2560px] mx-auto px-6 sm:px-10 lg:px-16 2xl:px-24 3xl:px-32 4xl:px-44 py-16 lg:py-24 2xl:py-32 3xl:py-40 4xl:py-48">
            {/* CLEAN MODULAR NORMATIVE LABORATORY (No Nested Boxes, Borderless Elegance) */}
            <div id="laboratorio-normativo" className="space-y-10">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[var(--border-hairline)]">
                <div className="space-y-2 max-w-xl">
                  <span className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--accent-ochre)] block">
                    Ambiente de Simulação &middot; Código eSocial S-1.3
                  </span>
                  <h3 className="font-editorial text-3xl sm:text-4xl font-normal text-[var(--text-primary)]">
                    Laboratório de consulta e simulação normativa
                  </h3>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    Inspecione leiautes XML, compare adicionais de NR-15 e NR-16 ou consulte a jurisprudência pacificada do STF.
                  </p>
                </div>

                {/* Modular Pill Tab Switcher */}
                <div
                  role="tablist"
                  aria-label="Módulos do laboratório normativo"
                  className="flex flex-wrap gap-2 shrink-0"
                >
                  {[
                    { id: 'esocial', label: 'I. Schemas XML' },
                    { id: 'gro', label: 'II. Simulador NR-15 vs NR-16' },
                    { id: 'ti', label: 'III. Diagnóstico e-CAC' },
                    { id: 'juridico', label: 'IV. Tema 555 STF' },
                  ].map((tab) => {
                    const isTabActive = activeLabTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={isTabActive}
                        onClick={() => setActiveLabTab(tab.id as NormativeLabTabId)}
                        className={`min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                          isTabActive
                            ? 'bg-[var(--accent-ochre)] text-white font-medium shadow-sm'
                            : 'border border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-ochre)] bg-black/5 dark:bg-white/5'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="gsap-lab-panel pt-4">
                {activeLabTab === 'esocial' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
                    <div className="lg:col-span-5 space-y-6">
                      <div className="space-y-3">
                        <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent-ochre)] block">
                          {activeEvtData.tableRef}
                        </span>
                        <h4 className="font-editorial text-2xl sm:text-3xl text-[var(--text-primary)] leading-snug">
                          {activeEvtData.title}
                        </h4>
                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                          {activeEvtData.description}
                        </p>
                      </div>

                      {/* Event Selector as Soft Modular Buttons */}
                      <div className="space-y-2 pt-2">
                        <span className="text-xs text-[var(--text-muted)] block">Selecione o evento:</span>
                        <div
                          role="group"
                          aria-label="Selecionar leiaute de evento do eSocial"
                          className="flex flex-wrap gap-2"
                        >
                          {(['S-2210', 'S-2220', 'S-2221', 'S-2240'] as const).map((evt) => {
                            const isEvtActive = selectedEvent === evt;
                            return (
                              <button
                                key={evt}
                                type="button"
                                aria-pressed={isEvtActive}
                                onClick={() => setSelectedEvent(evt)}
                                className={`min-h-[44px] px-4 py-2 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                                  isEvtActive
                                    ? 'bg-[var(--text-primary)] text-[var(--bg-canvas)] font-semibold shadow-sm'
                                    : 'border border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)]'
                                }`}
                              >
                                {evt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Clean Code Viewer (No heavy square borders) */}
                    <div className="lg:col-span-7 min-w-0 rounded-2xl bg-[#11151A] dark:bg-black/70 border border-[var(--border-hairline)] p-5 sm:p-7 space-y-4 shadow-xl">
                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono border-b border-white/10 pb-3.5">
                        <span className="text-[var(--accent-ochre)] font-medium">
                          SCHEMA OFICIAL &middot; {activeEvtData.code}
                        </span>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-slate-400 text-[11px]">{activeEvtData.deadline}</span>
                          <button
                            type="button"
                            onClick={() => {
                              void copyText(activeEvtData.xmlPreview, 'xml');
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/15 hover:border-[var(--accent-ochre)] text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
                          >
                            {copiedXml ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-[var(--accent-ochre)]" />
                                <span className="text-[var(--accent-ochre)] font-medium">Copiado</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copiar XML</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      <pre className="text-xs font-mono text-[#D6DEE7] overflow-x-auto max-w-full leading-relaxed max-h-[320px]">
                        <code>{activeEvtData.xmlPreview}</code>
                      </pre>
                    </div>
                  </div>
                )}

                {activeLabTab === 'gro' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
                    <div className="lg:col-span-6 space-y-7">
                      <div className="space-y-3">
                        <div className="flex justify-between items-baseline text-sm">
                          <label htmlFor="salary-slider" className="text-[var(--text-secondary)]">
                            Salário Base do Colaborador:
                          </label>
                          <strong className="font-editorial text-2xl text-[var(--text-primary)]">
                            R$ {baseSalary.toLocaleString('pt-BR')}
                          </strong>
                        </div>
                        <input
                          id="salary-slider"
                          type="range"
                          min={1518}
                          max={10000}
                          step={100}
                          value={baseSalary}
                          onChange={(e) => setBaseSalary(Number(e.target.value))}
                          className="w-full accent-[var(--accent-ochre)] h-1.5 cursor-pointer"
                        />
                      </div>

                      <div className="space-y-2">
                        <span className="text-xs text-[var(--text-muted)] block">Grau de Insalubridade (NR-15):</span>
                        <div className="flex gap-2.5">
                          {([10, 20, 40] as const).map((grade) => (
                            <button
                              key={grade}
                              type="button"
                              onClick={() => setInsalGrade(grade)}
                              className={`min-h-[44px] px-5 py-2 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                                insalGrade === grade
                                  ? 'bg-[var(--accent-ochre)] text-white font-semibold shadow-sm'
                                  : 'border border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                              }`}
                            >
                              {grade}%
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Open Typography Comparison (No nested boxed card) */}
                    <div className="lg:col-span-6 space-y-6 pt-2">
                      <div className="grid grid-cols-2 gap-8 pb-6 border-b border-[var(--border-hairline)]">
                        <div className="space-y-1">
                          <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] block">
                            Insalubridade (NR-15)
                          </span>
                          <div className="font-editorial text-3xl sm:text-4xl text-[var(--text-primary)] font-light">
                            R$ {additionCalc.insalubrityAmount.toFixed(2)}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] block">
                            Periculosidade (NR-16)
                          </span>
                          <div className="font-editorial text-3xl sm:text-4xl text-[var(--accent-ochre)] font-light">
                            R$ {additionCalc.periculosityAmount.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                        Vedada a cumulatividade (CLT Art. 193 &sect; 2&ordm;). Opção legalmente recomendada:{' '}
                        <strong className="uppercase text-[var(--text-primary)] font-semibold">
                          {additionCalc.recommendedOption}
                        </strong>{' '}
                        (Diferença de R$ {additionCalc.legalDifference.toFixed(2)}/mês ao trabalhador).
                      </p>
                    </div>
                  </div>
                )}

                {activeLabTab === 'ti' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
                    <div className="lg:col-span-5 space-y-5">
                      <h4 className="font-editorial text-2xl sm:text-3xl text-[var(--text-primary)] leading-snug">
                        Diagnóstico de Retorno Webservice e-CAC
                      </h4>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                        Inspecione os protocolos de resposta SOAP/HTTPS e tratativas de assinatura
                        digital ICP-Brasil A1/A3.
                      </p>
                      <div className="flex gap-2.5 pt-2">
                        {(['200', '401', '162'] as const).map((code) => (
                          <button
                            key={code}
                            type="button"
                            onClick={() => setProtocolCode(code)}
                            className={`min-h-[44px] px-5 py-2 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                              protocolCode === code
                                ? 'bg-[var(--accent-ochre)] text-white font-semibold shadow-sm'
                                : 'border border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                            }`}
                          >
                            Código {code}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="lg:col-span-7 p-6 rounded-2xl bg-[#11151A] dark:bg-black/70 border border-[var(--border-hairline)] text-xs font-mono text-[#EEF2F5] leading-relaxed shadow-lg">
                      {protocolCode === '200' && (
                        <span className="text-[var(--accent-ochre)]">
                          [200 OK] Lote processado com sucesso. Protocolo de recepção:
                          1.2.202610.00948123-1
                        </span>
                      )}
                      {protocolCode === '401' && (
                        <span className="text-[#F26A36]">
                          [401 ALERTA] Certificado ICP-Brasil A1 expirado ou cadeia TLS ICP-Brasil v5
                          ausente no servidor SMTP/SOAP.
                        </span>
                      )}
                      {protocolCode === '162' && (
                        <span className="text-slate-300">
                          [162 CONFLITO] Evento duplicado na base nacional. Transmita com indRetif=2 e
                          nrRecibo original.
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {activeLabTab === 'juridico' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
                    <div className="lg:col-span-5 space-y-3">
                      <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent-ochre)] block">
                        STF &middot; Repercussão Geral (Tema 555)
                      </span>
                      <h4 className="font-editorial text-2xl sm:text-3xl text-[var(--text-primary)] leading-snug">
                        Exposição ao Ruído &amp; Aposentadoria Especial
                      </h4>
                    </div>
                    <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-[var(--bg-paper)] dark:bg-black/50 border border-[var(--border-hairline)] text-sm sm:text-base text-[var(--text-secondary)] leading-[1.8] font-editorial italic">
                      &ldquo;Para exposição ao agente físico ruído acima dos limites legais de tolerância
                      (85 dB(A) conforme NHO-01 da Fundacentro e NR-15), a simples declaração de
                      eficácia do EPI no PPP Eletrônico não descaracteriza o tempo especial para aposentadoria
                      nem isenta a alíquota adicional do SAT/RAT.&rdquo;
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recharts eSocial Compliance Analytics Observatory (Frosted Glassmorphism) */}
            <EsocialComplianceAnalytics />
          </div>
        </section>

        {/* ===================================================================== */}
        {/* SEÇÃO V — ENGENHARIA & MATRIZ DE PESQUISA ("PLURA PART TWO" REF)      */}
        {/* ===================================================================== */}
        <section
          id="tecnologia"
          data-gsap-archetype={SECTION_GSAP_CHOREOGRAPHIES.tecnologia.archetype}
          className="relative border-b border-[var(--border-hairline)] mesh-gradient-tech py-28 lg:py-40 2xl:py-48 3xl:py-60 4xl:py-72 overflow-hidden"
        >
          {/* Ambient Chromatic Orbs for Frosted Glass Refraction */}
          <div
            aria-hidden="true"
            className="ambient-glass-orb-fjord absolute top-20 right-[12%] w-[520px] h-[520px] rounded-full"
          />
          <div
            aria-hidden="true"
            className="ambient-glass-orb-sage absolute bottom-16 left-[12%] w-[500px] h-[500px] rounded-full"
          />

          <div className="relative z-10 w-full max-w-[1920px] 3xl:max-w-[2200px] 4xl:max-w-[2560px] mx-auto px-6 sm:px-10 lg:px-16 2xl:px-24 3xl:px-32 4xl:px-44">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 2xl:gap-24 items-start relative z-10">
              {/* Left Column: Engineering Thesis & Live Feature Switcher (5 Columns) */}
              <div className="lg:col-span-5 space-y-8">
                <div className="space-y-3 max-w-prose">
                  <SplitTextReveal
                    as="h2"
                    text="Recursos reais para a rotina"
                    highlightText="operacional de SST."
                    className="font-editorial text-4xl sm:text-5xl 2xl:text-6xl font-normal text-[var(--text-primary)] leading-[1.1]"
                  />
                  <p className="text-sm text-[var(--text-secondary)] leading-[1.85]">
                    Desenvolvida sobre Next.js e AuthService dedicado, a plataforma combina catálogo
                    editorial em Markdown com busca instantânea, ferramentas de estudo individual e
                    governança colaborativa por perfis de acesso.
                  </p>
                </div>

                {/* Frosted Glass Feature Selector Buttons */}
                <div className="flex flex-col gap-3">
                  {[
                    {
                      id: 'search',
                      title: '01. Busca instantânea MiniSearch (Ctrl+K)',
                      desc: 'Pesquisa tolerante a erros de digitação em todos os 6 módulos (GRO, eSocial, Eventos, Informações, Coletivo e Tecnologia).',
                    },
                    {
                      id: 'zen',
                      title: '02. Modo Foco, Fonte Lexend, Grifos & Glossário',
                      desc: 'Ajuste de tamanho/espaçamento, fonte acessível para dislexia, destaques salvos no navegador, diagramas Mermaid e termos explicados.',
                    },
                    {
                      id: 'collab',
                      title: '03. Minha Lista, Avaliações, Correções & RBAC',
                      desc: 'Fila pessoal de leitura, trilhas de onboarding, avaliação de utilidade, sugestão de correção e moderação por Editores e Administradores.',
                    },
                  ].map((tab) => {
                    const isActive = activeFeatureTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        data-glass-active={isActive}
                        onMouseMove={handleCardSpotlightMove}
                        onClick={() =>
                          setActiveFeatureTab(tab.id as 'search' | 'zen' | 'collab')
                        }
                        className="glass-interactive-tile text-left p-4.5 transition-all"
                      >
                        <div className="text-xs font-medium text-[var(--text-primary)]">
                          {tab.title}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)] mt-1 max-w-prose">
                          {tab.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Interactive Frosted Feature Preview Card */}
                <div className="p-5 rounded-xl atelier-glass space-y-3">
                  {activeFeatureTab === 'search' && (
                    <div className="space-y-3">
                      <div className="text-xs font-medium text-[var(--text-primary)]">
                        Consulta direta ao acervo técnico
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-prose">
                        Pressione <strong className="text-[var(--text-primary)]">Ctrl+K</strong> em
                        qualquer tela para localizar guias do S-2210, S-2220, S-2240, PGR, LTCAT,
                        e-CAC ou scripts de atendimento.
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => setCommandPaletteOpen(true)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium bg-spectral-gradient transition-all cursor-pointer"
                        >
                          <span>Abrir busca rápida (Ctrl+K)</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          href="/artigos"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium border border-[var(--border-hairline)] text-[var(--text-primary)] hover:border-[var(--accent-editorial)] transition-all"
                        >
                          <span>Ver todos os artigos</span>
                        </Link>
                      </div>
                    </div>
                  )}

                  {activeFeatureTab === 'zen' && (
                    <div className="space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-[var(--text-primary)]">
                          Leitura Orientada · Grifos Persistidos
                        </span>
                        <button
                          type="button"
                          onClick={() => setHighlightActive((prev) => !prev)}
                          className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline cursor-pointer"
                        >
                          <Highlighter className="w-3 h-3" />
                          <span>{highlightActive ? 'Remover grifo' : 'Aplicar grifo'}</span>
                        </button>
                      </div>
                      <p className="text-[var(--text-secondary)] leading-relaxed max-w-prose">
                        Em cada artigo você pode ativar o Modo Foco, alternar para a fonte Lexend e{' '}
                        <span
                          className={
                            highlightActive
                              ? 'bg-[#234F46]/20 dark:bg-[#68B2A0]/25 text-[var(--text-primary)] px-1 rounded border-b border-[var(--accent-editorial)]'
                              : ''
                          }
                        >
                          grifar trechos importantes que ficam salvos automaticamente no seu navegador
                        </span>
                        .
                      </p>
                    </div>
                  )}

                  {activeFeatureTab === 'collab' && (
                    <div className="space-y-2.5 text-xs">
                      <div className="font-medium text-[var(--text-primary)]">
                        Ciclo de Revisão de 12 Meses &amp; Interações Autenticadas
                      </div>
                      <p className="text-[var(--text-secondary)] leading-relaxed">
                        Leitores autenticados avaliam se o artigo ajudou, enviam sugestões de
                        correção e organizam trilhas em <strong>Minha Lista</strong> (`/minha-lista`),
                        enquanto Editores e Administradores moderam o acervo em `/admin`.
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Link
                          href="/minha-lista"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-spectral-gradient text-white"
                        >
                          <span>Acessar Minha Lista</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href="/sobre"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-hairline)] text-[var(--text-primary)]"
                        >
                          <span>Conhecer a Arquitetura</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: 12-Tile Frosted Glass Research Matrix */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center justify-between text-xs text-[var(--text-secondary)] border-b border-[var(--border-hairline)] pb-3">
                  <span>Índice de dossiês normativos (12 domínios)</span>
                  <span className="text-[var(--text-muted)]">Selecione um tema para leitura</span>
                </div>

                <div className="gsap-research-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 2xl:gap-5">
                  {RESEARCH_MATRIX_12.map((tile, idx) => (
                    <button
                      key={tile.code}
                      type="button"
                      data-testid={`matrix-tile-${tile.code}`}
                      aria-label={`Abrir dossiê normativo ${tile.code}: ${tile.label} (${tile.domain})`}
                      aria-haspopup="dialog"
                      onMouseMove={handleCardSpotlightMove}
                      onClick={() => {
                        AnalyticsService.trackEvent('dossier_opened', { code: tile.code });
                        setActiveDossierCode(tile.code);
                      }}
                      className="gsap-research-tile glass-interactive-tile group text-left aspect-square p-4 2xl:p-5 flex flex-col justify-between transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-editorial)]"
                    >
                      <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                        <span className="font-tabular">{String(idx + 1).padStart(2, '0')}</span>
                        <span>{tile.domain}</span>
                      </div>

                      <div className="my-auto py-2">
                        <div className="font-editorial text-2xl sm:text-3xl font-light text-[var(--text-primary)] group-hover:text-[var(--accent-editorial)] transition-colors">
                          {tile.code}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-1 text-xs text-[var(--text-secondary)] leading-snug">
                        <span>{tile.label}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* SEÇÃO VI — SOBRE & OS CRIADORES ("ETIENNE" PANORAMIC WALKING LAYOUT)  */}
        {/* ===================================================================== */}
        <section
          id="criadores"
          data-gsap-archetype={SECTION_GSAP_CHOREOGRAPHIES.criadores.archetype}
          className="relative border-b border-[var(--border-hairline)] mesh-gradient-authority py-24 lg:py-36 2xl:py-44 3xl:py-56 4xl:py-68 overflow-hidden"
        >
          {/* Ambient Chromatic Orbs for Frosted Glass Depth */}
          <div
            aria-hidden="true"
            className="ambient-glass-orb-sage absolute top-20 left-[15%] w-[460px] h-[460px] rounded-full"
          />
          <div
            aria-hidden="true"
            className="ambient-glass-orb-fjord absolute bottom-12 right-[15%] w-[480px] h-[480px] rounded-full"
          />

          <div className="relative z-10 w-full max-w-[1920px] 3xl:max-w-[2200px] 4xl:max-w-[2560px] mx-auto px-6 sm:px-10 lg:px-16 2xl:px-24 3xl:px-32 4xl:px-44 space-y-12 2xl:space-y-16 3xl:space-y-20">
            {/* Top Minimal Header Bar (Etienne Style) */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
              <div className="space-y-1.5">
                <span className="text-xs font-mono uppercase tracking-[0.22em] text-[var(--accent-ochre)] block">
                  Idealizadores &amp; Consultoria Técnica
                </span>
                <SplitTextReveal
                  as="h2"
                  text="As pessoas por trás da"
                  highlightText="Base SST."
                  className="font-editorial italic text-3xl sm:text-4xl 2xl:text-5xl font-normal text-[var(--text-primary)]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/sobre"
                  className="glass-interactive-tile rounded-xl inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium text-[var(--text-primary)] hover:text-[var(--accent-editorial)] transition-all"
                >
                  <span>Ler História Completa do Projeto (/sobre)</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[var(--accent-editorial)]" />
                </Link>
              </div>
            </div>

            {/* Pure Clean Panoramic Photo */}
            <div className="gsap-etienne-frame relative w-full aspect-[16/9] sm:aspect-[21/9] min-h-[300px] sm:min-h-[420px] 2xl:min-h-[500px] overflow-hidden rounded-2xl shadow-xl group">
              <img
                src={creatorsWalkPhoto}
                alt="Equipe e Arquitetura da Base SST"
                width={1920}
                height={820}
                loading="lazy"
                decoding="async"
                className="gsap-etienne-photo w-full h-full object-cover grayscale contrast-105 brightness-95"
              />

              {/* Subtle Bottom Vignette */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/75 via-black/20 to-transparent"
              />

              {/* Clean Editorial Caption in Bottom-Left */}
              <div className="absolute bottom-5 left-5 sm:left-7 rounded-xl bg-[#0B0D10]/70 backdrop-blur-xl border border-white/10 px-4 py-2 flex flex-wrap items-center gap-2 text-xs text-white/90">
                <span className="font-medium">Victor Cardoso &amp; Guilherme Cruz</span>
                <span aria-hidden="true" className="text-white/40">
                  ·
                </span>
                <span className="text-white/75">
                  Consultoria Técnica: Sabrina Fraguela &amp; João Sanchez
                </span>
              </div>
            </div>

            {/* 4-Column Frosted Glass Signature Cards Directly Below the Photo */}
            <div className="gsap-etienne-strip grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 2xl:gap-7">
              {/* Card 1: Victor Cardoso */}
              <div
                onMouseMove={handleCardSpotlightMove}
                className="gsap-etienne-col mzia-frame rounded-2xl p-7 2xl:p-8 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <h3 className="font-editorial text-2xl sm:text-3xl font-normal text-[var(--text-primary)]">
                    Victor Cardoso
                  </h3>
                  <p className="text-[11px] font-tabular uppercase tracking-[0.16em] text-[var(--accent-editorial)]">
                    Idealizador e Arquiteto
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] leading-[1.75] pt-1 max-w-prose">
                    Iniciou a documentação dos fluxos de trabalho da equipe que deu origem à base.
                    Responsável pela arquitetura front-end, pelo design da interface e pelos
                    recursos de leitura (catálogo, modo foco, ajustes tipográficos e grifos).
                  </p>
                </div>
                <a
                  href="https://victor-cardoso.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-tabular uppercase tracking-[0.16em] text-[var(--accent-editorial)] hover:underline pt-2"
                >
                  <span>Portfólio &amp; Contato</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Card 2: Guilherme Cruz */}
              <div
                onMouseMove={handleCardSpotlightMove}
                className="gsap-etienne-col mzia-frame rounded-2xl p-7 2xl:p-8 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <h3 className="font-editorial text-2xl sm:text-3xl font-normal text-[var(--text-primary)]">
                    Guilherme Cruz
                  </h3>
                  <p className="text-[11px] font-tabular uppercase tracking-[0.16em] text-[var(--accent-editorial)]">
                    Idealizador e Desenvolvedor
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] leading-[1.75] pt-1 max-w-prose">
                    Coidealizador do projeto, atua na concepção e engenharia de software da
                    plataforma. Desenvolveu o AuthService: autenticação, recuperação de senha,
                    login social, perfis RBAC, avaliações, correções e moderação.
                  </p>
                </div>
                <a
                  href="https://gcruz.dev.br/links"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-tabular uppercase tracking-[0.16em] text-[var(--accent-editorial)] hover:underline pt-2"
                >
                  <span>Links &amp; GitHub</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Card 3: Sabrina Fraguela */}
              <div
                onMouseMove={handleCardSpotlightMove}
                className="gsap-etienne-col mzia-frame rounded-2xl p-7 2xl:p-8 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <h3 className="font-editorial text-2xl sm:text-3xl font-normal text-[var(--text-primary)]">
                    Sabrina Fraguela
                  </h3>
                  <p className="text-[11px] font-tabular uppercase tracking-[0.16em] text-[var(--accent-ochre)]">
                    Consultoria Técnica
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] leading-[1.75] pt-1 max-w-prose">
                    Curadoria e revisão do conteúdo operacional publicado na plataforma, garantindo
                    aderência prática aos fluxos de Saúde e Segurança do Trabalho, eSocial e rotinas
                    de atendimento da equipe.
                  </p>
                </div>
                <Link
                  href="/sobre"
                  className="inline-flex items-center gap-1.5 text-[11px] font-tabular uppercase tracking-[0.16em] text-[var(--text-secondary)] hover:text-[var(--text-primary)] pt-2"
                >
                  <span>Ver governança editorial</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Card 4: João Sanchez */}
              <div
                onMouseMove={handleCardSpotlightMove}
                className="gsap-etienne-col mzia-frame rounded-2xl p-7 2xl:p-8 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <h3 className="font-editorial text-2xl sm:text-3xl font-normal text-[var(--text-primary)]">
                    João Sanchez
                  </h3>
                  <p className="text-[11px] font-tabular uppercase tracking-[0.16em] text-[var(--accent-ochre)]">
                    Consultoria Técnica
                  </p>
                  <p className="text-xs text-[var(--text-secondary)] leading-[1.75] pt-1 max-w-prose">
                    Revisão e organização do material técnico, apoiando na precisão dos fluxos
                    operacionais, conferência de prazos normativos, procedimentos de mensageria e
                    padronização documental.
                  </p>
                </div>
                <Link
                  href="/artigos"
                  className="inline-flex items-center gap-1.5 text-[11px] font-tabular uppercase tracking-[0.16em] text-[var(--text-secondary)] hover:text-[var(--text-primary)] pt-2"
                >
                  <span>Explorar artigos revisados</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* SEÇÃO PERGUNTAS FREQUENTES — ACORDEÃO EDITORIAL SST & ESOCIAL          */}
        {/* ===================================================================== */}
        <FaqAccordionSection
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onSelectLabTab={(tab) => setActiveLabTab(tab)}
        />

        {/* ===================================================================== */}
        {/* SEÇÃO VII — ACESSO, CONTAS & PARTICIPAÇÃO NA PLATAFORMA               */}
        {/* ===================================================================== */}
        <section
          id="sobre"
          data-gsap-archetype={SECTION_GSAP_CHOREOGRAPHIES.sobre.archetype}
          className="relative border-b border-[var(--border-hairline)] mesh-gradient-authority py-28 lg:py-36 2xl:py-44 3xl:py-56 4xl:py-68 overflow-hidden"
        >
          {/* Ambient Chromatic Orbs for Frosted Glass Depth */}
          <div
            aria-hidden="true"
            className="ambient-glass-orb-sage absolute top-24 left-[10%] w-[460px] h-[460px] rounded-full"
          />
          <div
            aria-hidden="true"
            className="ambient-glass-orb-fjord absolute bottom-16 right-[12%] w-[520px] h-[520px] rounded-full"
          />

          <div className="relative z-10 w-full max-w-[1920px] 3xl:max-w-[2200px] 4xl:max-w-[2560px] mx-auto px-6 sm:px-10 lg:px-16 2xl:px-24 3xl:px-32 4xl:px-44">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-14 lg:gap-20 2xl:gap-28 items-start">
              {/* Left Column */}
              <div className="gsap-sobre-left lg:col-span-5 space-y-6">
                <SplitTextReveal
                  as="h2"
                  text="Participe da evolução da"
                  highlightText="Base SST."
                  className="font-editorial text-4xl sm:text-5xl 2xl:text-6xl font-normal text-[var(--text-primary)] leading-[1.1]"
                />

                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-[1.85] max-w-prose">
                  O catálogo de artigos é aberto para consulta imediata da equipe. Ao criar sua
                  conta na plataforma, você desbloqueia interações técnicas, histórico de sessões e
                  pode solicitar perfil de Editor para colaborar na escrita e revisão dos guias.
                </p>

                <div
                  onMouseMove={handleCardSpotlightMove}
                  className="mzia-frame rounded-2xl p-6 space-y-3 text-xs text-[var(--text-secondary)] max-w-prose"
                >
                  <div>
                    <strong className="text-[var(--text-primary)] font-medium">
                      Perfil Leitor (/cadastro):
                    </strong>{' '}
                    Avalie se os artigos ajudaram, envie sugestões de correção e comente nos
                    procedimentos.
                  </div>
                  <div>
                    <strong className="text-[var(--text-primary)] font-medium">
                      Perfil Editor &amp; Administrador (/admin):
                    </strong>{' '}
                    Publique e atualize artigos em Markdown, revise sugestões da equipe e modere
                    comentários.
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    href="/cadastro"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-semibold bg-[var(--accent-editorial)] text-white hover:opacity-95 shadow-sm transition-all"
                  >
                    <span>Criar Conta Agora</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-medium glass-interactive-tile text-[var(--text-primary)]"
                  >
                    <span>Entrar na Plataforma</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Frosted Glass Contact / Editor Request Form Card */}
              <div
                onMouseMove={handleCardSpotlightMove}
                className="gsap-sobre-right lg:col-span-7 mzia-frame rounded-3xl p-8 sm:p-12 2xl:p-16"
              >
                <div className="mb-8 space-y-2">
                  <SplitTextReveal
                    as="h3"
                    charStagger={0.012}
                    text="Contato Técnico &"
                    highlightText="Credenciamento"
                    className="font-editorial text-3xl sm:text-4xl font-normal text-[var(--text-primary)]"
                  />
                  <p className="text-xs text-[var(--text-secondary)] max-w-prose">
                    Deseja implantar a Base SST na sua equipe de SST ou falar com os
                    idealizadores? Envie uma mensagem abaixo ou acesse diretamente a tela de cadastro.
                  </p>
                </div>

                {contactSubmitted ? (
                  <div
                    role="status"
                    aria-live="polite"
                    className="p-8 rounded-2xl atelier-glass space-y-4 text-center"
                  >
                    <CheckCircle2 className="w-8 h-8 text-[#68B2A0] mx-auto" />
                    <h4 className="font-editorial text-2xl text-[var(--text-primary)]">
                      Dados validados para credenciamento imediato
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
                      Registramos o contato de <strong>{contactName}</strong> (<strong>{contactEmail}</strong> · {contactCompany}). Finalize sua conta agora com seus dados já preenchidos:
                    </p>
                    <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                      <Link
                        href={prefilledRegisterHref}
                        onClick={() =>
                          AnalyticsService.trackEvent('cta_register_clicked', {
                            source: 'lead_form_prefill',
                          })
                        }
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-semibold bg-[var(--accent-editorial)] text-white hover:opacity-95 shadow-md transition-all"
                      >
                        <span>Concluir Cadastro com Dados Preenchidos</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setContactSubmitted(false)}
                        className="px-4 py-2.5 rounded-xl text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] underline underline-offset-4 cursor-pointer"
                      >
                        Editar dados informados
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} noValidate className="space-y-6">
                    {contactError && (
                      <div
                        role="alert"
                        aria-live="assertive"
                        className="p-3.5 rounded-xl text-xs text-[#7AA6C7] bg-[#4A7A96]/15 border border-[#4A7A96]/40"
                      >
                        {contactError}
                      </div>
                    )}

                    <div>
                      <label
                        htmlFor="lead-name"
                        className="block text-[10px] font-tabular uppercase tracking-[0.2em] text-[var(--text-muted)] mb-2"
                      >
                        Nome Completo
                      </label>
                      <input
                        id="lead-name"
                        type="text"
                        autoComplete="name"
                        maxLength={120}
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Eng. Roberto Almeida"
                        className="w-full min-h-[44px] py-3 text-base sm:text-sm text-[var(--text-primary)] bg-transparent focus:outline-none focus-visible:border-b focus-visible:border-[var(--accent-editorial)] transition-colors"
                      />
                      <div className="gsap-blueprint-line h-[1px] w-full bg-[var(--border-hairline)]" />
                    </div>

                    <div>
                      <label
                        htmlFor="lead-email"
                        className="block text-[10px] font-tabular uppercase tracking-[0.2em] text-[var(--text-muted)] mb-2"
                      >
                        E-mail Corporativo ou Acadêmico
                      </label>
                      <input
                        id="lead-email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        maxLength={160}
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="roberto.almeida@instituicao.com.br"
                        className="w-full min-h-[44px] py-3 text-base sm:text-sm text-[var(--text-primary)] bg-transparent focus:outline-none focus-visible:border-b focus-visible:border-[var(--accent-editorial)] transition-colors"
                      />
                      <div className="gsap-blueprint-line h-[1px] w-full bg-[var(--border-hairline)]" />
                    </div>

                    <div>
                      <label
                        htmlFor="lead-company"
                        className="block text-[10px] font-tabular uppercase tracking-[0.2em] text-[var(--text-muted)] mb-2"
                      >
                        Equipe, Consultoria ou Área de Atuação
                      </label>
                      <input
                        id="lead-company"
                        type="text"
                        autoComplete="organization"
                        maxLength={140}
                        value={contactCompany}
                        onChange={(e) => setContactCompany(e.target.value)}
                        placeholder="Operações SST & Mensageria eSocial"
                        className="w-full min-h-[44px] py-3 text-base sm:text-sm text-[var(--text-primary)] bg-transparent focus:outline-none focus-visible:border-b focus-visible:border-[var(--accent-editorial)] transition-colors"
                      />
                      <div className="gsap-blueprint-line h-[1px] w-full bg-[var(--border-hairline)]" />
                    </div>

                    <div className="pt-4 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-between gap-4">
                      <MagneticWrapper strength={0.2}>
                        <button
                          type="submit"
                          className="w-full sm:w-auto min-h-[48px] inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-xs uppercase tracking-[0.16em] font-medium text-white bg-spectral-gradient hover:opacity-95 shadow-lg transition-all cursor-pointer"
                        >
                          <span>Enviar Mensagem</span>
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </MagneticWrapper>

                      <Link
                        href={prefilledRegisterHref}
                        className="min-h-[44px] inline-flex items-center text-xs text-[var(--text-secondary)] hover:text-[var(--accent-editorial)] underline underline-offset-4 cursor-pointer"
                      >
                        Ou criar conta imediatamente (/cadastro)
                      </Link>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* RODAPÉ EDITORIAL MINIMALISTA E INSTITUCIONAL                          */}
        {/* ===================================================================== */}
        <InstitutionalFooter
          onOpenLogin={handleOpenLogin}
          onOpenRegister={handleOpenRegister}
          onOpenSearch={() => setCommandPaletteOpen(true)}
          onSelectDossierCode={(code) => setActiveDossierCode(code)}
          isNotFoundView={false}
          onNavigateHome={handleReturnHome}
        />
      </main>
      )}

      {/* Modals & Interactive Monograph Drawer */}
      <NormativeDossierDrawer
        dossierCode={activeDossierCode}
        onClose={() => setActiveDossierCode(null)}
        onSelectDossierCode={(code) => setActiveDossierCode(code)}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
      />

      <CommandPaletteModal
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onOpenRegister={handleOpenRegister}
      />
    </div>
  );
};

