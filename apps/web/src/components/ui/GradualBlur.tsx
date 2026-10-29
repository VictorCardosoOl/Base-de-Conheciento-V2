'use client';

import React, { useEffect, useState, useMemo } from 'react';
import './GradualBlur.css';

export interface GradualBlurProps {
  position?: 'top' | 'bottom' | 'left' | 'right';
  strength?: number;
  height?: string;
  width?: string;
  divCount?: number;
  layers?: number;
  exponential?: boolean;
  zIndex?: number;
  animated?: boolean | 'scroll';
  duration?: string;
  easing?: string;
  opacity?: number;
  curve?: 'linear' | 'bezier' | 'ease-in' | 'ease-out' | 'ease-in-out';
  responsive?: boolean;
  target?: 'parent' | 'page';
  className?: string;
  style?: React.CSSProperties;
  hoverIntensity?: number;
  onAnimationComplete?: () => void;
  autoHide?: boolean;
}

const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

export const GradualBlur: React.FC<GradualBlurProps> = ({
  position = 'bottom',
  strength = 2,
  height = '6rem',
  width = '100%',
  divCount,
  layers = 6,
  exponential = false,
  zIndex = 40,
  opacity = 1,
  curve = 'linear',
  target = 'parent',
  className = '',
  style,
  autoHide = false,
}) => {
  const count = clamp(divCount ?? layers, 2, 16);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!autoHide || target !== 'page') return;
    const handleScroll = () => {
      const scrollBottom = window.innerHeight + window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      setVisible(scrollBottom < docHeight - 48);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [autoHide, target]);

  const blurLayers = useMemo(() => {
    return Array.from({ length: count }, (_, idx) => {
      const progress = (idx + 1) / count;
      const factor =
        curve === 'ease-in'
          ? progress * progress
          : curve === 'ease-out'
            ? 1 - Math.pow(1 - progress, 2)
            : progress;
      const blurPx = exponential
        ? Math.pow(2, factor * strength) - 1
        : factor * strength * 4;
      const startPct = (idx / count) * 100;
      const endPct = ((idx + 1) / count) * 100;

      return {
        key: idx,
        blurPx: Number(blurPx.toFixed(2)),
        startPct: Number(startPct.toFixed(2)),
        endPct: Number(endPct.toFixed(2)),
      };
    });
  }, [count, curve, exponential, strength]);

  const isVertical = position === 'top' || position === 'bottom';
  const gradientDir =
    position === 'bottom'
      ? 'to bottom'
      : position === 'top'
        ? 'to top'
        : position === 'right'
          ? 'to right'
          : 'to left';

  return (
    <div
      aria-hidden="true"
      className={`gradual-blur-root gradual-blur-${target} gradual-blur-${position} ${
        !visible ? 'gradual-blur-hidden' : ''
      } ${className}`}
      style={{
        zIndex,
        opacity: visible ? opacity : 0,
        height: isVertical ? height : '100%',
        width: isVertical ? width : height,
        ...style,
      }}
    >
      {blurLayers.map((layer) => {
        const mask = `linear-gradient(${gradientDir}, transparent ${layer.startPct}%, black ${layer.endPct}%)`;
        return (
          <div
            key={layer.key}
            className="gradual-blur-layer"
            style={{
              backdropFilter: `blur(${layer.blurPx}px)`,
              WebkitBackdropFilter: `blur(${layer.blurPx}px)`,
              maskImage: mask,
              WebkitMaskImage: mask,
            }}
          />
        );
      })}
    </div>
  );
};

export default GradualBlur;
