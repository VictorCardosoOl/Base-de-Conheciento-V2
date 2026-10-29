import { marked } from 'marked';
import { sanitizeArticleHtml } from './sanitize-html';
import glossaryData from '@/data/glossary.json';

const glossaryEntries = Object.entries(glossaryData || {});
let combinedRegex: RegExp | null = null;
let termToDef: Record<string, string> = {};

if (glossaryEntries.length > 0) {
  const sortedTerms = glossaryEntries
    .map(([t]) => t)
    .sort((a, b) => b.length - a.length);
  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  combinedRegex = new RegExp(
    `(?![^<]*>)\\b(${sortedTerms.map(escapeRegExp).join('|')})\\b`,
    'gi'
  );

  const escapeHtml = (str: string) =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  termToDef = Object.fromEntries(
    glossaryEntries.map(([t, d]) => [t.toLowerCase(), escapeHtml(d as string)])
  );
}

/**
 * Converte Markdown para HTML sanitizado com injeção de glossário e padrão seguro de produção.
 * Ponto único da verdade (SSOT) para renderização de artigos no SSR e no cliente.
 */
export async function renderMarkdownToSafeHtml(markdown: string): Promise<string> {
  if (!markdown || !markdown.trim()) return '';
  let rawHtml = (await marked.parse(markdown)) as string;

  if (combinedRegex) {
    const htmlSegments = rawHtml.split(/(<pre[\s\S]*?<\/pre>|<code[\s\S]*?<\/code>)/gi);
    rawHtml = htmlSegments
      .map((segment) => {
        if (/^<(pre|code)/i.test(segment)) return segment;
        return segment.replace(combinedRegex!, (match) => {
          const safeDef = termToDef[match.toLowerCase()];
          return safeDef
            ? `<span class="glossary-term" data-tooltip="${safeDef}">${match}</span>`
            : match;
        });
      })
      .join('');
  }

  return sanitizeArticleHtml(rawHtml);
}
