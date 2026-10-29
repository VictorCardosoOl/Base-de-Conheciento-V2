import { useEffect, useRef, useState } from 'react';

export function useShare() {
  const [shareFeedback, setShareFeedback] = useState(false);
  const [manualShareUrl, setManualShareUrl] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const shareContent = async (title: string, text: string, url: string) => {
    const shareData = { title, text, url };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== 'AbortError' && process.env.NODE_ENV !== 'production') {
          console.warn('Erro ao compartilhar:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setManualShareUrl(null);
        setShareFeedback(true);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setShareFeedback(false), 2000);
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Clipboard indisponível:', err);
        }
        setManualShareUrl(url);
      }
    }
  };

  return { shareContent, shareFeedback, manualShareUrl, clearManualShareUrl: () => setManualShareUrl(null) };
}
