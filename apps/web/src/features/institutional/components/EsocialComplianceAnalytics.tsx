/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  EsocialCompliancePeriod,
  EsocialEventFilter,
  ESOCIAL_EVENT_BREAKDOWNS,
  getEsocialComplianceDataset,
  calculateEsocialComplianceSummary,
} from '../utils/sstCalculations';

type ChartVisualizationMode = 'area' | 'bars' | 'audit';

export const EsocialComplianceAnalytics: React.FC = () => {
  const [period, setPeriod] = useState<EsocialCompliancePeriod>('6m');
  const [eventFilter, setEventFilter] = useState<EsocialEventFilter>('ALL');
  const [chartMode, setChartMode] = useState<ChartVisualizationMode>('area');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const dataset = useMemo(() => getEsocialComplianceDataset(period), [period]);
  const summary = useMemo(
    () => calculateEsocialComplianceSummary(dataset, eventFilter),
    [dataset, eventFilter]
  );

  // SVG Chart Geometry Constants
  const svgWidth = 720;
  const svgHeight = 320;
  const padLeft = 48;
  const padRight = 24;
  const padTop = 20;
  const padBottom = 38;
  const chartW = svgWidth - padLeft - padRight;
  const chartH = svgHeight - padTop - padBottom;

  const count = dataset.length;
  const getX = (i: number) => padLeft + (count > 1 ? (i / (count - 1)) * chartW : chartW / 2);

  // Conformidade domain: 97% to 100%
  const getY = (val: number, min = 97, max = 100) => {
    const clamped = Math.max(min, Math.min(max, val));
    return padTop + chartH - ((clamped - min) / (max - min)) * chartH;
  };

  // Build SVG path for Area and Line
  const pointsConf = dataset.map((d, i) => ({ x: getX(i), y: getY(d.conformidadePct) }));
  const pointsSla = dataset.map((d, i) => ({ x: getX(i), y: getY(d.slaTempestividadePct) }));

  const buildSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i > 0 ? pts[i - 1] : pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = i < pts.length - 2 ? pts[i + 2] : p2;
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  const linePathConf = buildSmoothPath(pointsConf);
  const linePathSla = buildSmoothPath(pointsSla);

  const areaPathConf =
    pointsConf.length > 0
      ? `${linePathConf} L ${pointsConf[pointsConf.length - 1].x} ${padTop + chartH} L ${pointsConf[0].x} ${padTop + chartH} Z`
      : '';

  const areaPathSla =
    pointsSla.length > 0
      ? `${linePathSla} L ${pointsSla[pointsSla.length - 1].x} ${padTop + chartH} L ${pointsSla[0].x} ${padTop + chartH} Z`
      : '';

  // Max for bars mode
  const maxBarVolume = Math.max(
    ...dataset.map((d) => d.s2240Risco + d.s2220Aso + d.s2221Tox + d.s2210Cat),
    1000
  );

  const activeHoverData = hoverIndex !== null && dataset[hoverIndex] ? dataset[hoverIndex] : null;

  return (
    <div
      id="telemetria-esocial"
      data-testid="esocial-compliance-analytics"
      className="relative space-y-8 pt-4 pb-2"
    >
      {/* Top Editorial Header & Segmented Controls */}
      <div className="relative z-10 flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-[var(--border-hairline)] pb-6">
        <div className="space-y-2 max-w-2xl">
          <h3 className="font-editorial text-3xl sm:text-4xl 2xl:text-[42px] font-normal text-[var(--text-primary)] leading-[1.12]">
            Indicadores de conformidade no{' '}
            <span className="italic font-light text-[var(--accent-editorial)]">eSocial.</span>
          </h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-prose">
            Acompanhamento histórico dos lotes transmitidos ao ambiente nacional (S-2210, S-2220,
            S-2221 e S-2240), prazos regulamentares e consistência entre o PGR e o LTCAT.
          </p>
        </div>

        {/* Clean Segmented Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div
            role="group"
            aria-label="Período de análise"
            className="inline-flex flex-wrap items-center p-1 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--border-hairline)] gap-1 max-w-full"
          >
            {(
              [
                { id: '6m', label: '6 meses' },
                { id: 'ytd', label: 'Ano 2026' },
                { id: '12m', label: '12 meses' },
              ] as const
            ).map((item) => {
              const active = period === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={active}
                  data-testid={`esocial-period-${item.id}`}
                  onClick={() => setPeriod(item.id)}
                  className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-spectral-gradient text-white shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div
            role="group"
            aria-label="Modo de visualização do gráfico"
            className="inline-flex flex-wrap items-center p-1 rounded-xl bg-black/5 dark:bg-white/5 border border-[var(--border-hairline)] gap-1 max-w-full"
          >
            {(
              [
                { id: 'area', label: 'Taxa de aceite' },
                { id: 'bars', label: 'Volume por evento' },
                { id: 'audit', label: 'Revisão prévia' },
              ] as const
            ).map((mode) => {
              const active = chartMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  aria-pressed={active}
                  data-testid={`esocial-mode-${mode.id}`}
                  onClick={() => setChartMode(mode.id)}
                  className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-spectral-gradient text-white shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {mode.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Event Filter Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtro por evento do eSocial">
          {(
            [
              { id: 'ALL', label: 'Todos os eventos' },
              { id: 'S-2240', label: 'S-2240 · Fatores de Risco' },
              { id: 'S-2220', label: 'S-2220 · Saúde (ASO)' },
              { id: 'S-2221', label: 'S-2221 · Toxicológico' },
              { id: 'S-2210', label: 'S-2210 · CAT' },
            ] as const
          ).map((ev) => {
            const isSelected = eventFilter === ev.id;
            return (
              <button
                key={ev.id}
                type="button"
                aria-pressed={isSelected}
                data-testid={`esocial-filter-${ev.id}`}
                onClick={() => setEventFilter(ev.id)}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap shrink-0 cursor-pointer border ${
                  isSelected
                    ? 'bg-spectral-gradient text-white font-medium border-transparent shadow-sm'
                    : 'bg-black/[0.02] dark:bg-white/[0.02] border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)]'
                }`}
              >
                {ev.label}
              </button>
            );
          })}
        </div>

        <div className="text-xs text-[var(--text-muted)]">
          <span>Escopo selecionado</span>
          <span aria-hidden="true" className="mx-1.5">
            ·
          </span>
          <span className="text-[var(--text-primary)] font-medium">
            {summary.activeSeriesLabel}
          </span>
        </div>
      </div>

      {/* 4 Summary Metrics (Unboxed Editorial Presentation) */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 pt-2 pb-4 border-b border-[var(--border-hairline)]">
        <div className="flex flex-col justify-between space-y-2 py-1">
          <span className="text-xs text-[var(--text-muted)] font-medium">
            Aceite no webservice e-CAC
          </span>
          <div className="flex items-baseline justify-between gap-2">
            <strong
              data-testid="kpi-average-compliance"
              className="font-editorial text-4xl 2xl:text-[42px] font-normal text-[var(--text-primary)] font-tabular"
            >
              {summary.averageCompliancePct.toFixed(1)}%
            </strong>
            <span className="text-xs font-tabular font-medium text-[var(--accent-editorial)]">
              +{summary.complianceDeltaPct.toFixed(1)}% no período
            </span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Proporção de lotes validados na primeira transmissão sem erro de schema.
          </p>
        </div>

        <div className="flex flex-col justify-between space-y-2 py-1 sm:border-l sm:border-[var(--border-hairline)] sm:pl-6">
          <span className="text-xs text-[var(--text-muted)] font-medium">
            Cumprimento do prazo legal
          </span>
          <div className="flex items-baseline justify-between gap-2">
            <strong
              data-testid="kpi-average-sla"
              className="font-editorial text-4xl 2xl:text-[42px] font-normal text-[var(--text-primary)] font-tabular"
            >
              {summary.averageSlaPct.toFixed(1)}%
            </strong>
            <span className="text-xs text-[var(--text-muted)]">Dia 15 · 24h CAT</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Envios concluídos antes do fechamento mensal e dentro do prazo da CAT.
          </p>
        </div>

        <div className="flex flex-col justify-between space-y-2 py-1 lg:border-l lg:border-[var(--border-hairline)] lg:pl-6">
          <span className="text-xs text-[var(--text-muted)] font-medium">Eventos homologados</span>
          <div className="flex items-baseline justify-between gap-2">
            <strong
              data-testid="kpi-total-events"
              className="font-editorial text-4xl 2xl:text-[42px] font-normal text-[var(--text-primary)] font-tabular"
            >
              {summary.totalValidatedEvents.toLocaleString('pt-BR')}
            </strong>
            <span className="text-xs text-[var(--text-muted)]">ICP-Brasil A1</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Registros assinados digitalmente que compõem o histórico do PPP Eletrônico.
          </p>
        </div>

        <div className="flex flex-col justify-between space-y-2 py-1 sm:border-l sm:border-[var(--border-hairline)] sm:pl-6">
          <span className="text-xs text-[var(--text-muted)] font-medium">
            Inconsistências corrigidas
          </span>
          <div className="flex items-baseline justify-between gap-2">
            <strong
              data-testid="kpi-prevented-rejections"
              className="font-editorial text-4xl 2xl:text-[42px] font-normal text-[var(--text-primary)] font-tabular"
            >
              {summary.totalPreventedRejections.toLocaleString('pt-BR')}
            </strong>
            <span className="text-xs text-[var(--text-muted)]">Revisão prévia</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
            Divergências entre PGR, LTCAT e validade de CA ajustadas antes do envio.
          </p>
        </div>
      </div>

      {/* Main Grid: Left Primary Chart + Right Event Breakdown (Unboxed) */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 2xl:gap-12 items-start">
        {/* Left 8 Columns: Primary Interactive Canvas (Borderless) */}
        <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[var(--border-hairline)] pb-4">
            <div className="space-y-1">
              <h4 className="font-editorial text-2xl sm:text-3xl text-[var(--text-primary)]">
                {chartMode === 'area' && 'Evolução da conformidade e tempestividade'}
                {chartMode === 'bars' && 'Volume mensal de eventos transmitidos'}
                {chartMode === 'audit' && 'Inconsistências revisadas versus taxa de aceite'}
              </h4>
              <p className="text-xs text-[var(--text-muted)]">
                {chartMode === 'area' && 'Comparativo mensal entre validação técnica e envio no prazo'}
                {chartMode === 'bars' && 'Distribuição entre S-2240, S-2220, S-2221 e S-2210'}
                {chartMode === 'audit' && 'Impacto da revisão documental prévia na recepção do eSocial'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-secondary)]">
              {chartMode === 'area' && (
                <>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2E665A]" />
                    Conformidade (%)
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#4A728A]" />
                    Prazo legal (%)
                  </span>
                </>
              )}
              {chartMode === 'bars' && (
                <>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2E665A]" />
                    S-2240
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#4A728A]" />
                    S-2220
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#6E8A9C]" />
                    S-2221 / S-2210
                  </span>
                </>
              )}
              {chartMode === 'audit' && (
                <>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#2E665A]" />
                    Revisões
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#4A728A]" />
                    Conformidade (%)
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Guaranteed Direct SVG Chart (Zero Hydration Lag, Never Blank) */}
          <div
            className="w-full min-h-[340px] h-[340px] sm:h-[370px] relative select-none"
            data-testid="recharts-primary-canvas"
          >
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
              onMouseLeave={() => setHoverIndex(null)}
            >
              <defs>
                <linearGradient id="svgComplianceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2E665A" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#2E665A" stopOpacity="0.02" />
                </linearGradient>
                <linearGradient id="svgSlaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4A728A" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#4A728A" stopOpacity="0.02" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid Lines & Y-Axis Labels */}
              {[100, 99, 98, 97].map((val) => {
                const y = getY(val);
                return (
                  <g key={val}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={svgWidth - padRight}
                      y2={y}
                      stroke="currentColor"
                      strokeOpacity="0.12"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={padLeft - 8}
                      y={y + 3}
                      textAnchor="end"
                      className="text-[10px] fill-[var(--text-muted)] font-mono"
                    >
                      {val}%
                    </text>
                  </g>
                );
              })}

              {/* Chart Content based on mode */}
              {chartMode === 'area' ? (
                <>
                  {/* Fills */}
                  <path d={areaPathConf} fill="url(#svgComplianceGrad)" />
                  <path d={areaPathSla} fill="url(#svgSlaGrad)" />

                  {/* Lines */}
                  <path
                    d={linePathConf}
                    fill="none"
                    stroke="#2E665A"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d={linePathSla}
                    fill="none"
                    stroke="#4A728A"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />

                  {/* Data Dots */}
                  {pointsConf.map((pt, i) => (
                    <circle
                      key={`conf-dot-${i}`}
                      cx={pt.x}
                      cy={pt.y}
                      r={hoverIndex === i ? 6 : 4}
                      fill="#FAF9F6"
                      stroke="#2E665A"
                      strokeWidth={hoverIndex === i ? 2.5 : 1.5}
                      className="transition-all duration-150"
                    />
                  ))}
                  {pointsSla.map((pt, i) => (
                    <circle
                      key={`sla-dot-${i}`}
                      cx={pt.x}
                      cy={pt.y}
                      r={hoverIndex === i ? 5 : 3.5}
                      fill="#FAF9F6"
                      stroke="#4A728A"
                      strokeWidth={hoverIndex === i ? 2 : 1.5}
                      className="transition-all duration-150"
                    />
                  ))}
                </>
              ) : chartMode === 'bars' ? (
                <>
                  {dataset.map((d, i) => {
                    const cx = getX(i);
                    const barW = Math.max(16, Math.min(36, chartW / count - 12));
                    const totalH = chartH;
                    const h2240 = (d.s2240Risco / maxBarVolume) * totalH;
                    const h2220 = (d.s2220Aso / maxBarVolume) * totalH;
                    const h2221 = (d.s2221Tox / maxBarVolume) * totalH;
                    const h2210 = (d.s2210Cat / maxBarVolume) * totalH;
                    const baseX = cx - barW / 2;
                    const baseY = padTop + chartH;

                    return (
                      <g key={`bar-${i}`} className="transition-opacity hover:opacity-90">
                        {/* Stacked bars */}
                        <rect
                          x={baseX}
                          y={baseY - h2240}
                          width={barW}
                          height={h2240}
                          fill="#2E665A"
                          rx={3}
                        />
                        <rect
                          x={baseX}
                          y={baseY - h2240 - h2220}
                          width={barW}
                          height={h2220}
                          fill="#4A728A"
                          rx={3}
                        />
                        <rect
                          x={baseX}
                          y={baseY - h2240 - h2220 - h2221}
                          width={barW}
                          height={h2221}
                          fill="#6E8A9C"
                          rx={2}
                        />
                        <rect
                          x={baseX}
                          y={baseY - h2240 - h2220 - h2221 - h2210}
                          width={barW}
                          height={h2210}
                          fill="#94A3B8"
                          rx={2}
                        />
                      </g>
                    );
                  })}
                </>
              ) : (
                <>
                  {/* Audit Mode */}
                  {dataset.map((d, i) => {
                    const cx = getX(i);
                    const barW = Math.max(20, Math.min(42, chartW / count - 16));
                    const maxRev = Math.max(...dataset.map((item) => item.rejeicoesPrevenidas), 600);
                    const barH = (d.rejeicoesPrevenidas / maxRev) * chartH;
                    return (
                      <rect
                        key={`audit-bar-${i}`}
                        x={cx - barW / 2}
                        y={padTop + chartH - barH}
                        width={barW}
                        height={barH}
                        fill="#2E665A"
                        opacity={hoverIndex === i ? 0.95 : 0.75}
                        rx={4}
                      />
                    );
                  })}
                  <path
                    d={linePathConf}
                    fill="none"
                    stroke="#4A728A"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {pointsConf.map((pt, i) => (
                    <circle
                      key={`audit-dot-${i}`}
                      cx={pt.x}
                      cy={pt.y}
                      r={hoverIndex === i ? 6 : 4}
                      fill="#FAF9F6"
                      stroke="#4A728A"
                      strokeWidth={2}
                    />
                  ))}
                </>
              )}

              {/* X-Axis Labels & Hover Hitboxes */}
              {dataset.map((d, i) => {
                const x = getX(i);
                const colW = chartW / count;
                return (
                  <g key={`x-axis-${i}`}>
                    {/* Hover Guide line */}
                    {hoverIndex === i && (
                      <line
                        x1={x}
                        y1={padTop}
                        x2={x}
                        y2={padTop + chartH}
                        stroke="#B27E29"
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                        opacity="0.8"
                      />
                    )}
                    <text
                      x={x}
                      y={svgHeight - 12}
                      textAnchor="middle"
                      className={`text-[11px] font-mono transition-colors ${
                        hoverIndex === i
                          ? 'fill-[var(--text-primary)] font-bold'
                          : 'fill-[var(--text-muted)]'
                      }`}
                    >
                      {d.month}
                    </text>
                    {/* Invisible Hitbox for touch/hover */}
                    <rect
                      x={x - colW / 2}
                      y={padTop}
                      width={colW}
                      height={chartH + padBottom}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoverIndex(i)}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Interactive Floating Tooltip */}
            {activeHoverData && (
              <div
                className="absolute top-3 right-3 p-3 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-paper)]/95 dark:bg-zinc-900/95 shadow-lg text-xs space-y-1.5 min-w-[190px] pointer-events-none transition-all z-20 backdrop-blur-md"
              >
                <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-1 text-[var(--text-muted)]">
                  <span className="font-semibold text-[var(--text-primary)]">
                    {activeHoverData.month}
                  </span>
                  <span>eSocial S-1.3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#2E665A] font-medium">Conformidade:</span>
                  <strong className="font-mono text-[var(--text-primary)]">
                    {activeHoverData.conformidadePct.toFixed(1)}%
                  </strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#4A728A] font-medium">No prazo legal:</span>
                  <strong className="font-mono text-[var(--text-primary)]">
                    {activeHoverData.slaTempestividadePct.toFixed(1)}%
                  </strong>
                </div>
                <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] pt-0.5 border-t border-[var(--border-hairline)]">
                  <span>Total eventos:</span>
                  <span className="font-mono">
                    {(
                      activeHoverData.s2240Risco +
                      activeHoverData.s2220Aso +
                      activeHoverData.s2221Tox +
                      activeHoverData.s2210Cat
                    ).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
            <span>Referência normativa: Manual de Orientação do eSocial (versão S-1.3) · NR-01 e NR-07</span>
            <span>Dados consolidados por competência</span>
          </div>
        </div>

        {/* Right 4 Columns: Breakdown by eSocial Layout (Unboxed) */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-6 lg:border-l lg:border-[var(--border-hairline)] lg:pl-8">
          <div className="space-y-1 border-b border-[var(--border-hairline)] pb-4">
            <h4 className="font-editorial text-2xl text-[var(--text-primary)]">
              Desempenho por evento
            </h4>
            <p className="text-xs text-[var(--text-muted)]">
              Selecione um evento abaixo para isolar sua série histórica
            </p>
          </div>

          {/* Clean Horizontal Performance Bar Visualizer */}
          <div className="w-full space-y-3 py-1">
            {ESOCIAL_EVENT_BREAKDOWNS.map((entry, idx) => {
              const tones = ['#2E665A', '#4A728A', '#6E8A9C', '#94A3B8'];
              const color = tones[idx % tones.length];
              const pctWidth = Math.max(0, Math.min(100, (entry.compliancePct - 95) * 20));

              return (
                <div key={entry.code} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-medium text-[var(--text-primary)]">
                      {entry.code}
                    </span>
                    <span className="font-mono text-xs font-semibold text-[var(--text-primary)]">
                      {entry.compliancePct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pctWidth}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Event Breakdown Selection Rows (Borderless) */}
          <div className="divide-y divide-[var(--border-hairline)] border-t border-b border-[var(--border-hairline)]">
            {ESOCIAL_EVENT_BREAKDOWNS.map((item) => {
              const isSelected = eventFilter === item.code;
              return (
                <button
                  key={item.code}
                  type="button"
                  data-glass-active={isSelected}
                  onClick={() =>
                    setEventFilter((prev) => (prev === item.code ? 'ALL' : item.code))
                  }
                  className={`w-full text-left py-3 px-3 transition-all cursor-pointer flex flex-col justify-center rounded-lg ${
                    isSelected
                      ? 'bg-[#2E665A]/10 dark:bg-[#2E665A]/20 font-medium'
                      : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`font-tabular text-xs font-semibold ${isSelected ? 'text-[var(--accent-editorial)]' : 'text-[var(--text-primary)]'}`}>
                        {item.code}
                      </span>
                      <span aria-hidden="true" className="text-[var(--text-muted)]">
                        ·
                      </span>
                      <span className="text-xs text-[var(--text-secondary)] truncate">
                        {item.name}
                      </span>
                    </div>
                    <strong className="font-tabular text-xs text-[var(--text-primary)]">
                      {item.compliancePct.toFixed(1)}%
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] mt-1">
                    <span>{item.slaDeadline}</span>
                    <span>{item.preventedDivergences} revisões</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
