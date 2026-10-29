import { useState, useEffect } from 'react';
import { FAQItem } from './types';
import { reportContentError } from '@/features/analytics/telemetry';
import { sanitizeArticleHtml } from './sanitize-html';
import { renderMarkdownToSafeHtml } from './markdown';

export const useArticleContent = (article: FAQItem) => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadContent = async () => {
      try {
        let markdownContent = '';

        if (typeof article.content === 'function') {
          const loaded = await article.content();
          markdownContent = loaded.default.content;
        } else if (typeof article.content === 'string') {
          markdownContent = article.content;
        }

        if (mounted) {
          if (markdownContent) {
            const safeHtml = await renderMarkdownToSafeHtml(markdownContent);
            if (mounted) {
              setHtmlContent(safeHtml);
            }
          } else {
            // Fallback to basic answer if markdown doesn't exist
            setHtmlContent(sanitizeArticleHtml(article.answer || ''));
          }
          setError(null);
        }
      } catch (err) {
        reportContentError(err, {
          articleId: article.id,
          question: article.question,
        });
        if (mounted) {
          setError(
            err instanceof Error ? err : new Error('Failed to load content')
          );
          setHtmlContent(sanitizeArticleHtml(article.answer || ''));
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadContent();
    return () => {
      mounted = false;
    };
  }, [article]);

  return { htmlContent, isLoading, error };
};
