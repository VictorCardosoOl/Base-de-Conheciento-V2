import '@/assets/styles/global.css';
import { Metadata, Viewport } from 'next';
import { ClientLayout } from '@/features/shell/components/ClientLayout';
import { THEME_STORAGE_KEY } from '@/features/shell/theme-storage';
import { ConsentProvider } from '@/features/consent/ConsentContext';

import { Inter, Playfair_Display, Lexend } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});
const lexend = Lexend({
  subsets: ['latin'],
  variable: '--font-lexend',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F4F3EF' },
    { media: '(prefers-color-scheme: dark)', color: '#0B0D10' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Base SST | Padrão eSocial',
  description:
    'Guias oficiais, diretrizes e procedimentos consolidados de Saúde e Segurança do Trabalho. Pesquise fluxos, eventos do eSocial e regras de negócio.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  metadataBase: new URL('https://basesst.com.br'),
  openGraph: {
    title: 'Base SST',
    description:
      'Respostas diretas e auditadas sobre SST e eSocial: eventos S-2210, S-2220 e S-2240, PGR, PCMSO, LTCAT e prazos legais.',
    type: 'website',
    siteName: 'Base SST',
    locale: 'pt_BR',
    images: [
      {
        url: '/assets/aistudio/analise-metricas-indicadores_758a83f4.webp',
        width: 1200,
        height: 630,
        alt: 'Base SST',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Base SST',
    description:
      'Respostas diretas e auditadas sobre SST e eSocial, com procedimentos passo a passo.',
    images: ['/assets/aistudio/analise-metricas-indicadores_758a83f4.webp'],
  },
};

const structuredDataGraph = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://basesst.com.br/#website',
      url: 'https://basesst.com.br',
      name: 'Base SST | Padrão eSocial',
      description:
        'Portal técnico de Saúde e Segurança do Trabalho (SST), eventos do eSocial (S-2210, S-2220, S-2221, S-2240), PGR, PCMSO e LTCAT.',
      inLanguage: 'pt-BR',
    },
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://basesst.com.br/#application',
      name: 'Base SST',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description:
        'Plataforma SaaS de gestão do conhecimento técnico em Saúde e Segurança do Trabalho e mensageria eSocial.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'BRL',
      },
    },
    {
      '@type': 'FAQPage',
      '@id': 'https://basesst.com.br/#faq',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Qual a diferença prática entre o PGR (NR-01) e o LTCAT na alimentação do evento S-2240 do eSocial?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'O Programa de Gerenciamento de Riscos (PGR), regido pela NR-01, tem caráter trabalhista e preventivo. Já o LTCAT é estritamente previdenciário (Lei 8.213/91) e fundamenta a declaração no evento S-2240 sobre exposição a agentes nocivos da Tabela 24 para fins de Aposentadoria Especial.',
          },
        },
        {
          '@type': 'Question',
          name: 'Quais são os prazos de envio dos eventos S-2210, S-2220 e S-2240 no eSocial?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'O evento S-2210 (CAT) deve ser transmitido até o primeiro dia útil seguinte à ocorrência (ou imediatamente em caso de óbito). Os eventos S-2220 (ASO) e S-2240 (Condições Ambientais) devem ser enviados até o dia 15 do mês subsequente.',
          },
        },
        {
          '@type': 'Question',
          name: 'É permitido acumular os adicionais de Insalubridade (NR-15) e Periculosidade (NR-16)?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Não há acumulação conforme Art. 193 § 2º da CLT. Na presença simultânea de agentes insalubres e periculosos, o trabalhador deve optar pelo adicional financeiramente mais vantajoso.',
          },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable} ${lexend.variable}`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredDataGraph) }}
        />
        <script
          id="aistudio-fetch-guard"
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var nativeFetch = window.fetch.bind(window);
                  var origDefineProperty = Object.defineProperty;
                  Object.defineProperty = function (obj, prop, descriptor) {
                    if (
                      obj === window &&
                      prop === 'fetch' &&
                      descriptor &&
                      typeof descriptor.get === 'function'
                    ) {
                      var currentFetch = function (resource, options) {
                        try {
                          var urlStr =
                            typeof resource === 'string'
                              ? resource
                              : resource instanceof URL
                                ? resource.href
                                : resource && typeof resource.url === 'string'
                                  ? resource.url
                                  : '';
                          if (!urlStr || urlStr.indexOf('generativelanguage.googleapis.com') === -1) {
                            return nativeFetch(resource, options);
                          }
                        } catch (err) {
                          return nativeFetch(resource, options);
                        }
                        var shimFn = descriptor.get.call(window);
                        return shimFn.apply(window, arguments);
                      };
                      return origDefineProperty.call(Object, obj, prop, {
                        configurable: true,
                        enumerable: true,
                        get: function () {
                          return currentFetch;
                        },
                        set: function (fn) {
                          if (typeof fn === 'function') {
                            currentFetch = fn;
                          }
                        },
                      });
                    }
                    return origDefineProperty.apply(Object, arguments);
                  };
                  setTimeout(function () {
                    try {
                      var mc = new MessageChannel();
                      var evt = new MessageEvent('message', {
                        origin: 'https://aistudio.google.com',
                        data: {
                          type: 'bootstrap',
                          urlPatterns: ['generativelanguage\\\\.googleapis\\\\.com'],
                        },
                        ports: [mc.port2],
                      });
                      window.dispatchEvent(evt);
                    } catch (err) {}
                  }, 60);
                } catch (e) {}
              })();
            `,
          }}
        />
        <script
          id="theme-script"
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                var shouldBeDark = false;
                try {
                  var isDark = localStorage.getItem('${THEME_STORAGE_KEY}');
                  if (isDark === 'true') {
                    shouldBeDark = true;
                  } else if (isDark === 'false') {
                    shouldBeDark = false;
                  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    shouldBeDark = true;
                  }
                } catch (e) {
                  try {
                    shouldBeDark = Boolean(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  } catch (err) {}
                }
                function applyTheme(dark) {
                  window.__SST_THEME_DARK__ = dark;
                  var root = document.documentElement;
                  root.classList.toggle('dark', dark);
                  root.classList.toggle('theme-alabaster', !dark);
                  root.dataset.theme = dark ? 'dark' : 'light';
                  root.style.colorScheme = dark ? 'dark' : 'light';
                  if (document.body) {
                    document.body.classList.toggle('dark', dark);
                    document.body.classList.toggle('theme-alabaster', !dark);
                    document.body.dataset.theme = dark ? 'dark' : 'light';
                  }
                }
                applyTheme(shouldBeDark);
                document.addEventListener('click', function (e) {
                  if (window.__SST_REACT_THEME_READY__) return;
                  var target = e.target && e.target.closest ? e.target.closest('[data-testid="institutional-theme-toggle"], [data-testid="app-theme-toggle"], .nav-theme-toggle') : null;
                  if (!target) return;
                  var nextDark = !document.documentElement.classList.contains('dark');
                  applyTheme(nextDark);
                  try {
                    localStorage.setItem('${THEME_STORAGE_KEY}', String(nextDark));
                  } catch (err) {}
                  try {
                    window.dispatchEvent(new CustomEvent('sst-theme-change', { detail: { isDark: nextDark } }));
                  } catch (err) {}
                }, true);
              })();
            `,
          }}
        />
      </head>
      <body
        className="bg-bg-main text-text-main font-sans antialiased selection:bg-selection"
        suppressHydrationWarning
      >
        <ConsentProvider>
          <ClientLayout>{children}{modal}</ClientLayout>
        </ConsentProvider>
      </body>
    </html>
  );
}
