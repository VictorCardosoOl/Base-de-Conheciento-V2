'use client';
import React, { useEffect, useState } from 'react';
import { Highlighter, Check } from 'lucide-react';
import {
  ReadingExperienceService,
  HighlightItem,
} from '@/features/reading/reading-experience-service';

interface ArticleHighlightsToolbarProps {
  articleId: string;
  containerRef: React.RefObject<HTMLElement | null>;
}

export const ArticleHighlightsToolbar: React.FC<
  ArticleHighlightsToolbarProps
> = ({ articleId, containerRef }) => {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null
  );
  const [selectedText, setSelectedText] = useState<string>('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setPosition(null);
        setSelectedText('');
        return;
      }

      const text = selection.toString().trim();
      if (text.length < 3) {
        setPosition(null);
        setSelectedText('');
        return;
      }

      // Certificar que a seleção está dentro do contêiner do artigo
      const container = containerRef.current;
      if (!container || !container.contains(selection.anchorNode)) {
        setPosition(null);
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
      setSelectedText(text);
    };

    document.addEventListener('selectionchange', handleSelection);
    return () =>
      document.removeEventListener('selectionchange', handleSelection);
  }, [containerRef]);

  const applyHighlight = (color: HighlightItem['color']) => {
    if (!selectedText) return;

    ReadingExperienceService.addHighlight(articleId, selectedText, color);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      setPosition(null);
      window.getSelection()?.removeAllRanges();
    }, 400);
  };

  if (!position || !selectedText) return null;

  return (
    <div
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -100%)',
      }}
      className="fixed z-50 flex items-center gap-2 px-3 py-1.5 rounded-md border border-[var(--border-hairline)] bg-[var(--bg-island)] shadow-[0_8px_24px_rgba(0,0,0,0.14)] animate-fade-in-up"
      onMouseDown={(e) => e.preventDefault()} // Impede perder a seleção ao clicar
    >
      {savedSuccess ? (
        <div className="flex items-center gap-1.5 px-2 py-0.5 text-xs text-[var(--accent-editorial)] font-medium">
          <Check size={14} />
          <span>Trecho destacado</span>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-1.5 pr-2 border-r border-[var(--border-hairline)] text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
            <Highlighter size={12} />
            <span>Destacar</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => applyHighlight('yellow')}
              title="Marca-texto Âmbar"
              className="w-4 h-4 rounded-sm bg-amber-300/90 hover:scale-110 transition-transform border border-amber-500/50"
            />
            <button
              type="button"
              onClick={() => applyHighlight('green')}
              title="Marca-texto Salva"
              className="w-4 h-4 rounded-sm bg-emerald-300/90 hover:scale-110 transition-transform border border-emerald-500/50"
            />
            <button
              type="button"
              onClick={() => applyHighlight('blue')}
              title="Marca-texto Azul"
              className="w-4 h-4 rounded-sm bg-sky-300/90 hover:scale-110 transition-transform border border-sky-500/50"
            />
            <button
              type="button"
              onClick={() => applyHighlight('pink')}
              title="Marca-texto Terracota"
              className="w-4 h-4 rounded-sm bg-rose-300/90 hover:scale-110 transition-transform border border-rose-500/50"
            />
          </div>
        </>
      )}
    </div>
  );
};

