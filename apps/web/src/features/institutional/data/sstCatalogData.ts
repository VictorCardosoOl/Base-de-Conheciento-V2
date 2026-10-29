/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EsocialEventCode = 'S-2210' | 'S-2220' | 'S-2221' | 'S-2240';

export interface EsocialEventSchemaSpec {
  code: EsocialEventCode;
  title: string;
  deadline: string;
  tableRef: string;
  description: string;
  xmlPreview: string;
}

export const ESOCIAL_EVENTS: Record<EsocialEventCode, EsocialEventSchemaSpec> = {
  'S-2210': {
    code: 'S-2210',
    title: 'Comunicação de Acidente de Trabalho (CAT)',
    deadline: 'Prazo: 1º dia útil seguinte (imediato em óbito)',
    tableRef: 'Tabelas 13, 14, 15 e 17 do eSocial · Guia Operacional CAT',
    description:
      'Registra acidentes típicos, de trajeto ou doenças ocupacionais com vinculação direta ao CNIS do segurado e conferência de CID, atestado médico e agente causador.',
    xmlPreview: `<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtCAT/v_S_01_03_00">
  <evtCAT Id="ID1123456780001902026102410420000001">
    <ideEvento><indRetif>1</indRetif><tpAmb>1</tpAmb></ideEvento>
    <cat>
      <dtAcid>2026-10-24</dtAcid>
      <tpAcid>1</tpAcid>
      <ultDiaTrab>2026-10-24</ultDiaTrab>
      <atestado><codCID>S62.6</codCID><qtdDiasAfast>15</qtdDiasAfast></atestado>
    </cat>
  </evtCAT>
</eSocial>`,
  },
  'S-2220': {
    code: 'S-2220',
    title: 'Monitoramento da Saúde do Trabalhador (ASO)',
    deadline: 'Prazo: Até o dia 15 do mês subsequente',
    tableRef: 'Tabela 27 (Procedimentos Diagnósticos) · NR-07 (PCMSO)',
    description:
      'Rastreia exames admissionais, periódicos, de retorno ao trabalho, de mudança de riscos ocupacionais e demissionais alinhados ao PCMSO.',
    xmlPreview: `<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtMonit/v_S_01_03_00">
  <evtMonit Id="ID1123456780001902026102410450000002">
    <exMedOcup>
      <tpExameOcup>0</tpExameOcup>
      <aso>
        <dtAso>2026-10-24</dtAso>
        <resAso>1</resAso>
        <exame><dtExm>2026-10-22</dtExm><procRealizado>0295</procRealizado></exame>
      </aso>
    </exMedOcup>
  </evtMonit>
</eSocial>`,
  },
  'S-2221': {
    code: 'S-2221',
    title: 'Exame Toxicológico do Motorista Profissional',
    deadline: 'Prazo: Até o dia 15 do mês subsequente ao exame',
    tableRef: 'Portaria MTE nº 612/2024 · Categorias C, D e E',
    description:
      'Escrituração obrigatória dos exames toxicológicos de larga janela de detecção (90 dias) para motoristas profissionais do transporte rodoviário.',
    xmlPreview: `<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtToxic/v_S_01_03_00">
  <evtToxic Id="ID1123456780001902026102410480000003">
    <toxicologico>
      <dtExame>2026-10-20</dtExame>
      <cnpjLab>04829102000140</cnpjLab>
      <codSeqExame>AA948102938</codSeqExame>
    </toxicologico>
  </evtToxic>
</eSocial>`,
  },
  'S-2240': {
    code: 'S-2240',
    title: 'Condições Ambientais do Trabalho — Fatores de Risco',
    deadline: 'Alimenta o PPP Eletrônico · Dia 15 do mês subsequente',
    tableRef: 'Tabela 24 (Agentes Nocivos e Limites NHO/NR-15)',
    description:
      'Integra o LTCAT e o inventário de riscos ao eSocial declarando exposição a agentes físicos, químicos e biológicos, eficácia de EPC/EPI e enquadramento previdenciário.',
    xmlPreview: `<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtExpRisco/v_S_01_03_00">
  <evtExpRisco Id="ID1123456780001902026102410500000004">
    <infoExpRisco>
      <dtIniCondicao>2026-01-01</dtIniCondicao>
      <agNoc>
        <codAgNoc>01.01.001</codAgNoc>
        <tpAval>1</tpAval>
        <intConc>87.4</intConc>
        <limTol>85.0</limTol>
      </agNoc>
    </infoExpRisco>
  </evtExpRisco>
</eSocial>`,
  },
} as const;

export interface GleamEssayItem {
  index: string;
  total: string;
  dossierCode: string;
  curator: string;
  title: string;
  subtitle: string;
  excerpt: string;
  highlight: string;
  mainImg: string;
  subImg1: string;
  subImg2: string;
  plateCaptions: readonly [string, string, string];
  verticalNote: string;
}

export const GLEAM_ESSAYS: readonly GleamEssayItem[] = [
  {
    index: '01',
    total: '04',
    dossierCode: 'NR-01',
    curator: 'Victor Cardoso & Guilherme Cruz · Revisão Sabrina Fraguela & João Sanchez',
    title: 'Gestão de Riscos & Programas',
    subtitle: 'GRO, PGR, PCMSO, LTCAT & Prazos de Validade',
    excerpt:
      'O módulo de GRO reúne os manuais operacionais sobre PGR, PGRTR, PCMSO, LTCAT, diferenças práticas entre Laudo de Insalubridade (NR-15) e Periculosidade (NR-16), além da tabela consolidada de prazos de guarda e revisão documental.',
    highlight:
      'Documentar cada programa e fluxo técnico elimina o repasse informal e padroniza a orientação da equipe em segundos.',
    mainImg: '/assets/aistudio/trabalho-em-altura-ferramentas_20506a68.webp',
    subImg1: '/assets/aistudio/canteiro-obras-engenharia_6dfcef7e.webp',
    subImg2: '/assets/aistudio/profissional-saude-ocupacional_560cc41f.webp',
    plateCaptions: [
      'I · GRO, PGR e Prevenção em Campo',
      'II · LTCAT, Insalubridade e Periculosidade',
      'III · PCMSO e Monitoramento Clínico (NR-07)',
    ],
    verticalNote: 'MÓDULO GRO · PGR, PCMSO, LTCAT & NORMAS REGULAMENTADORAS',
  },
  {
    index: '02',
    total: '04',
    dossierCode: 'S-2240',
    curator: 'Victor Cardoso & Guilherme Cruz · Revisão Sabrina Fraguela & João Sanchez',
    title: 'Eventos de SST no eSocial',
    subtitle: 'Guias Operacionais S-2210, S-2220, S-2221 e S-2240',
    excerpt:
      'Guias passo a passo construídos a partir da operação diária nos sistemas Sigo Web (W-GSC) e portal do eSocial, detalhando regras de preenchimento, prazos legais, cruzamento com a Tabela 24 e conferência de recibos XML.',
    highlight:
      'Da emissão da CAT (S-2210) à carga inicial de fatores de risco (S-2240): procedimentos claros para evitar rejeições e malha fina.',
    mainImg: '/assets/aistudio/analise-metricas-indicadores_758a83f4.webp',
    subImg1: '/assets/aistudio/reuniao-corporativa-alinhamento_683dc86a.webp',
    subImg2: '/assets/aistudio/gestao-estoque-logistica_99a8db12.webp',
    plateCaptions: [
      'I · Conferência de Eventos e Lotes XML',
      'II · Parametrização de Ambientes e GHE',
      'III · Controle de Exames e Prazos Mensais',
    ],
    verticalNote: 'MÓDULOS ESOCIAL & EVENTOS · S-2210, S-2220, S-2221 E S-2240',
  },
  {
    index: '03',
    total: '04',
    dossierCode: 'e-CAC',
    curator: 'Victor Cardoso & Guilherme Cruz · Revisão Sabrina Fraguela & João Sanchez',
    title: 'Operação e-CAC & Tecnologia',
    subtitle: 'Procuração Eletrônica, Análise de XML, SMTP e VPN',
    excerpt:
      'Procedimentos técnicos para outorga e validação de procuração eletrônica no portal e-CAC da Receita Federal, leitura estruturada de arquivos XML de retorno, configuração de disparo de e-mails (SMTP) e acesso seguro via VPN.',
    highlight:
      'Quando a equipe compreende a estrutura do XML e as permissões do e-CAC, o diagnóstico de erros deixa de depender de tentativa e erro.',
    mainImg: '/assets/aistudio/treinamento-instrucao-equipe_04486f93.webp',
    subImg1: '/assets/aistudio/reuniao-corporativa-alinhamento_683dc86a.webp',
    subImg2: '/assets/aistudio/consultoria-auditoria-sst_fd37d9f7.webp',
    plateCaptions: [
      'I · Outorga de Procuração Eletrônica e-CAC',
      'II · Inspeção de Tags e Recibos XML',
      'III · Diagnóstico de Conectividade SMTP e VPN',
    ],
    verticalNote: 'MÓDULOS ESOCIAL & TECNOLOGIA · INFRAESTRUTURA OPERACIONAL',
  },
  {
    index: '04',
    total: '04',
    dossierCode: 'PPP',
    curator: 'Victor Cardoso & Guilherme Cruz · Revisão Sabrina Fraguela & João Sanchez',
    title: 'Atendimento, Coletivo & INSS',
    subtitle: 'Scripts, Feedback 24h, Protocolos e Aposentadoria Especial',
    excerpt:
      'Reúne os padrões de atendimento da equipe — script de comunicação, tratativa de protocolos, cultura de feedback em 24 horas — e os guias de orientação previdenciária sobre PPP, CAT, aposentadoria especial e por invalidez.',
    highlight:
      'Padronizar o atendimento e manter ciclo de revisão de 12 meses garante que toda a equipe responda com a mesma segurança técnica.',
    mainImg: '/assets/aistudio/trabalhador-epi-construcao_9cb54beb.webp',
    subImg1: '/assets/aistudio/equipamentos-protecao-individual_fa593814.webp',
    subImg2: '/assets/aistudio/operacao-industrial-maquinario_0f63c8ea.webp',
    plateCaptions: [
      'I · Orientação Previdenciária e PPP Eletrônico',
      'II · Padronização de Scripts e Protocolos',
      'III · Cultura de Feedback 24h e Revisão Anual',
    ],
    verticalNote: 'MÓDULOS COLETIVO & INFORMAÇÕES · ATENDIMENTO E PREVIDÊNCIA',
  },
] as const;

export type NormativeLabTabId = 'esocial' | 'gro' | 'ti' | 'juridico';

export interface MziaPillarItem {
  roman: string;
  memoryLabel: string;
  title: string;
  subtitle: string;
  description: string;
  imgPrimary: string;
  imgSecondary: string;
  tabTarget: NormativeLabTabId;
}

export const MZIA_PILLARS: readonly MziaPillarItem[] = [
  {
    roman: 'I',
    memoryLabel: '( módulos eSocial & Eventos · operação e-CAC e Sigo Web )',
    title: 'Mensageria eSocial & Eventos SST',
    subtitle: 'S-2210 · S-2220 · S-2221 · S-2240 · e-CAC',
    description:
      'Guias completos sobre procuração eletrônica no e-CAC, envio de eventos de SST no eSocial, prazos mensais e conferência de recibos e lotes XML.',
    imgPrimary: '/assets/aistudio/analise-metricas-indicadores_758a83f4.webp',
    imgSecondary: '/assets/aistudio/reuniao-corporativa-alinhamento_683dc86a.webp',
    tabTarget: 'esocial',
  },
  {
    roman: 'II',
    memoryLabel: '( módulo GRO · engenharia e medicina ocupacional )',
    title: 'Gestão de Riscos (GRO) & Normas',
    subtitle: 'PGR · PGRTR · PCMSO · LTCAT · LI vs LP',
    description:
      'Documentação prática sobre PGR, PGRTR, PCMSO, LTCAT, diferenças entre Insalubridade (NR-15) e Periculosidade (NR-16), NRs, PPP e tabela de prazos de validade.',
    imgPrimary: '/assets/aistudio/equipamentos-protecao-individual_fa593814.webp',
    imgSecondary: '/assets/aistudio/trabalhador-epi-construcao_9cb54beb.webp',
    tabTarget: 'gro',
  },
  {
    roman: 'III',
    memoryLabel: '( módulos Coletivo & Tecnologia · rotina da equipe )',
    title: 'Atendimento, Processos & Tecnologia',
    subtitle: 'Scripts · Protocolos · Feedback 24h · XML · SMTP · VPN',
    description:
      'Padronização da rotina operacional da equipe com scripts de atendimento, tratativa de protocolos, cultura de feedback 24h, leitura de XML, configuração de SMTP e VPN.',
    imgPrimary: '/assets/aistudio/gestao-estoque-logistica_99a8db12.webp',
    imgSecondary: '/assets/aistudio/treinamento-instrucao-equipe_04486f93.webp',
    tabTarget: 'ti',
  },
  {
    roman: 'IV',
    memoryLabel: '( módulo Informações · orientação previdenciária e legal )',
    title: 'Previdenciário, CAT & Benefícios',
    subtitle: 'Aposentadoria Especial · Invalidez · CAT · Tema 555 STF',
    description:
      'Artigos técnicos sobre emissão e prazos da CAT, aposentadoria especial (15, 20 e 25 anos), aposentadoria por invalidez, PPP eletrônico e jurisprudência do STF.',
    imgPrimary: '/assets/aistudio/operacao-industrial-maquinario_0f63c8ea.webp',
    imgSecondary: '/assets/aistudio/inspecao-seguranca-trabalho_dd5a1bfb.webp',
    tabTarget: 'juridico',
  },
] as const;

export interface ResearchMatrixTile {
  code: string;
  label: string;
  domain: string;
}

export const RESEARCH_MATRIX_12: readonly ResearchMatrixTile[] = [
  { code: 'S-2210', label: 'CAT & Acidentes', domain: 'Eventos' },
  { code: 'S-2220', label: 'Monitoramento ASO', domain: 'Eventos' },
  { code: 'S-2221', label: 'Exame Toxicológico', domain: 'Eventos' },
  { code: 'S-2240', label: 'Fatores de Risco', domain: 'Eventos' },
  { code: 'NR-01', label: 'GRO, PGR & PGRTR', domain: 'GRO' },
  { code: 'NR-07', label: 'PCMSO & Exames', domain: 'GRO' },
  { code: 'NR-15', label: 'Insalubridade (LI)', domain: 'GRO' },
  { code: 'NR-16', label: 'Periculosidade (LP)', domain: 'GRO' },
  { code: 'LTCAT', label: 'Laudo Técnico INSS', domain: 'GRO' },
  { code: 'PPP', label: 'PPP & Validades', domain: 'GRO' },
  { code: 'e-CAC', label: 'Procuração & XML', domain: 'eSocial / TI' },
  { code: 'STF 555', label: 'Aposentadoria Especial', domain: 'Informações' },
] as const;

export interface FoundationThesisItem {
  num: string;
  domain: string;
  dossierCode: string;
  thesis: string;
}

export const FOUNDATION_THESES: readonly FoundationThesisItem[] = [
  {
    num: '01.',
    domain: 'ORIGEM REAL NA OPERAÇÃO',
    dossierCode: 'NR-01',
    thesis:
      'Substituir o repasse informal ("boca a boca") por procedimentos documentados, revisados e acessíveis a toda a equipe.',
  },
  {
    num: '02.',
    domain: 'BUSCA INSTANTÂNEA (CTRL+K)',
    dossierCode: 'S-2240',
    thesis:
      'Localizar eventos do eSocial, códigos de erro, scripts de atendimento e normas em milissegundos com busca tolerante a erros.',
  },
  {
    num: '03.',
    domain: 'LEITURA ORIENTADA & ACESSÍVEL',
    dossierCode: 'NR-07',
    thesis:
      'Modo foco, ajustes tipográficos (incluindo fonte Lexend para dislexia), grifos persistidos no navegador e glossário interativo.',
  },
  {
    num: '04.',
    domain: 'MINHA LISTA & TRILHAS DE ESTUDO',
    dossierCode: 'PPP',
    thesis:
      'Organizar artigos em fila pessoal de leitura, acompanhar trilhas de onboarding de novos membros e definir metas semanais.',
  },
  {
    num: '05.',
    domain: 'GOVERNANÇA, RBAC & REVISÃO ANUAL',
    dossierCode: 'e-CAC',
    thesis:
      'Ciclo de revisão de 12 meses com controle de acesso (Leitor, Editor e Administrador), avaliações de utilidade e sugestões de correção.',
  },
] as const;
