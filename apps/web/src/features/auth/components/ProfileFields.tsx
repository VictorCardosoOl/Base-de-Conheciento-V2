'use client';
import React from 'react';
import type { ProfessionalArea } from '@/features/auth/client';

export const ORGANIZATION_MAX_LENGTH = 120;

export const PROFESSIONAL_AREAS: ReadonlyArray<{
  value: ProfessionalArea;
  label: string;
}> = [
  { value: 'seguranca_trabalho', label: 'Segurança do trabalho' },
  { value: 'saude_ocupacional', label: 'Saúde ocupacional' },
  { value: 'rh_dp', label: 'RH / Departamento pessoal' },
  { value: 'contabil_financeiro', label: 'Contábil / Financeiro' },
  { value: 'juridico', label: 'Jurídico' },
  { value: 'ti', label: 'Tecnologia' },
  { value: 'gestao', label: 'Gestão' },
  { value: 'outra', label: 'Outra' },
];

/**
 * Perfil complementar em grade 2 colunas, todo opcional e sem bordas divisórias.
 */
export function ProfileFields({
  idPrefix,
  organization,
  professionalArea,
  onOrganizationChange,
  onProfessionalAreaChange,
  inputClass,
  labelClass,
}: {
  idPrefix: string;
  organization: string;
  professionalArea: ProfessionalArea | '';
  onOrganizationChange: (value: string) => void;
  onProfessionalAreaChange: (value: ProfessionalArea | '') => void;
  inputClass: string;
  labelClass: string;
}) {
  const hintId = `${idPrefix}-profile-hint`;
  return (
    <fieldset
      className="pt-2 space-y-3 border-0 p-0 m-0"
      aria-describedby={hintId}
    >
      <div className="flex items-center justify-between gap-2 px-1">
        <legend className="text-[11px] font-tabular uppercase tracking-[0.12em] text-[var(--accent-editorial)] font-semibold">
          Contexto Profissional · Opcional
        </legend>
        <span id={hintId} className="text-[11px] text-[var(--text-muted)]">
          Personaliza sua trilha SST
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="space-y-1.5">
          <label htmlFor={`${idPrefix}-organization`} className={labelClass}>
            Organização
          </label>
          <input
            id={`${idPrefix}-organization`}
            type="text"
            autoComplete="organization"
            value={organization}
            onChange={(event) => onOrganizationChange(event.target.value)}
            maxLength={ORGANIZATION_MAX_LENGTH}
            placeholder="Empresa ou consultoria"
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor={`${idPrefix}-area`} className={labelClass}>
            Área de atuação
          </label>
          <select
            id={`${idPrefix}-area`}
            value={professionalArea}
            onChange={(event) =>
              onProfessionalAreaChange(
                event.target.value as ProfessionalArea | ''
              )
            }
            className={inputClass}
          >
            <option value="">Prefiro não informar</option>
            {PROFESSIONAL_AREAS.map((area) => (
              <option key={area.value} value={area.value}>
                {area.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </fieldset>
  );
}
