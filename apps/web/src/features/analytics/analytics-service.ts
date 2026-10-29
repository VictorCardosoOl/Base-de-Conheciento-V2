import { safeStorage } from '@/lib/storage';

const COMPLETED_ARTICLES_KEY = 'sst_completed_articles';
const FUNNEL_EVENTS_KEY = 'sst_funnel_events';
const MAX_STORED_EVENTS = 50;

export type ProductFunnelEventName =
  | 'dossier_opened'
  | 'search_opened'
  | 'lab_tab_selected'
  | 'lead_submitted'
  | 'cta_register_clicked'
  | 'article_completed';

export interface ProductFunnelEvent {
  name: ProductFunnelEventName;
  timestamp: string;
  metadata?: Record<string, string | number | boolean>;
}

export const AnalyticsService = {
  // Trilhas de Onboarding: Marcação de artigo lido/concluído
  getCompletedArticles(): string[] {
    return safeStorage.getItem<string[]>(COMPLETED_ARTICLES_KEY, []);
  },

  toggleArticleCompletion(articleId: string): boolean {
    if (!articleId) return false;
    const completed = this.getCompletedArticles();
    const exists = completed.includes(articleId);
    const updated = exists
      ? completed.filter((id) => id !== articleId)
      : [...completed, articleId];
    safeStorage.setItem(COMPLETED_ARTICLES_KEY, updated);
    this.trackEvent('article_completed', { articleId, completed: !exists });
    return !exists;
  },

  // Rastreamento não-bloqueante de eventos de funil e engajamento do produto
  trackEvent(
    name: ProductFunnelEventName,
    metadata?: Record<string, string | number | boolean>
  ): void {
    try {
      const existing = safeStorage.getItem<ProductFunnelEvent[]>(FUNNEL_EVENTS_KEY, []);
      const nextEvent: ProductFunnelEvent = {
        name,
        timestamp: new Date().toISOString(),
        ...(metadata ? { metadata } : {}),
      };
      const updated = [...existing.slice(-(MAX_STORED_EVENTS - 1)), nextEvent];
      safeStorage.setItem(FUNNEL_EVENTS_KEY, updated);
    } catch {
      // Falha silenciosa para jamais impactar a thread principal ou UX
    }
  },

  getTrackedEvents(): ProductFunnelEvent[] {
    return safeStorage.getItem<ProductFunnelEvent[]>(FUNNEL_EVENTS_KEY, []);
  },
};
