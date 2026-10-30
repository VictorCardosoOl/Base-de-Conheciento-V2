import { FAQItem, Category } from './types';
import catalog from '@/data/catalog.json';
import { ARTICLE_CONTENT_MAP } from '@/data/mapping';

const mapCategory = (cat?: string): Category => {
  if (!cat) return Category.SOBRE;
  const normalized = cat
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  switch (normalized) {
    case 'esocial':
      return Category.ESOCIAL;
    case 'eventos':
      return Category.EVENTOS;
    case 'informacoes':
      return Category.INFORMACOES;
    case 'gro':
      return Category.GRO;
    case 'introducao':
      return Category.SOBRE;
    case 'sobre':
      return Category.SOBRE;
    case 'coletivo':
      return Category.COLETIVO;
    case 'tecnologia':
    case 'ti':
      return Category.TI;
    default:
      return cat as Category; // Fallback
  }
};

export interface CatalogRawItem {
  id: string;
  category?: string;
  question: string;
  answer: string;
  excerpt?: string;
  date: string;
  searchText?: string;
  tags?: string[];
  validityMonths?: number;
  lastReviewed?: string;
  verifiedBy?: string;
  author?: string;
}

const AUTO_IMPORT_PLACEHOLDER = 'artigo importado automaticamente';

function formatEditorialTitle(rawQuestion: string): string {
  if (!rawQuestion) return rawQuestion;
  if (rawQuestion.includes('_')) {
    return rawQuestion.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
  }
  return rawQuestion;
}

function deriveCleanSummary(item: CatalogRawItem, cleanTitle: string): string {
  const rawAnswer = (item.answer || '').trim();
  if (
    rawAnswer &&
    !rawAnswer.toLowerCase().includes(AUTO_IMPORT_PLACEHOLDER)
  ) {
    return rawAnswer;
  }

  const source = (item.searchText || item.excerpt || '').trim();
  if (!source) return rawAnswer;

  let cleaned = source
    .replace(/^[#=*-\s]+/, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Remove repeated title at the start of the text
  for (const prefix of [item.question, cleanTitle]) {
    if (prefix && cleaned.toLowerCase().startsWith(prefix.toLowerCase())) {
      cleaned = cleaned.slice(prefix.length).replace(/^[\s:=\-–—]+/, '').trim();
    }
  }

  // Strip a second repeated heading if present (e.g. "PGR O que é o PGR...")
  cleaned = cleaned.replace(/^[A-Za-zÀ-ÿ0-9\s()/,-]{3,70}==+\s*/, '').trim();

  if (!cleaned) return rawAnswer;
  if (cleaned.length <= 165) return cleaned;
  const cut = cleaned.slice(0, 162);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 100 ? cut.slice(0, lastSpace) : cut).replace(/[.,;:\s]+$/, '')}...`;
}

// Converts the JSON catalog + Lazy Load Map into the application's FAQItem format
export const FAQ_DATA: FAQItem[] = catalog.map((item: CatalogRawItem) => {
  const question = formatEditorialTitle(item.question);
  return {
    id: item.id,
    question,
    answer: deriveCleanSummary(item, question),
    category: mapCategory(item.category),
    date: item.date,
    searchText: item.searchText,
    tags: (item.tags || []).filter((t) => t.toLowerCase() !== 'importado'),
    content: ARTICLE_CONTENT_MAP[item.id],
    validityMonths:
      item.validityMonths ??
      (item.category === 'GRO' || item.category === 'eSocial' ? 12 : undefined),
    // Só o que o artigo declara: sem revisor nem data de revisão inventados.
    lastReviewed: item.lastReviewed,
    verifiedBy: item.verifiedBy,
    author: item.author,
  };
}) as FAQItem[];

