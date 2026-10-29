# Plano de Auditoria DevSecOps & Revisão Estática do Frontend (Base de Conhecimento SST)

Este plano estabelece a estratégia metodológica em modo **Somente Leitura (Read-Only)** para a auditoria estática profunda e revisão de código do frontend da plataforma **Base de Conhecimento SST**, estruturando a ordem de inspeção determinística e a consolidação final de descobertas no relatório `walkthrough.md`.

## User Review & Critical Decisions

> [!IMPORTANT]
> **Modo Somente Leitura (Fase Inicial)**: Nenhum arquivo de código-fonte de produção será modificado durante a fase de mapeamento e inspeção. Após sua aprovação deste plano, executaremos a inspeção linha por linha (Chain-of-Thought) e geraremos o relatório detalhado `walkthrough.md` no formato estrito de Task List categorizada por severidade (`CRÍTICA`, `ALTA`, `MÉDIA`, `BAIXA`).

- **Escopo Primário Confirmado**: Foco integral na camada Frontend e BFF/Proxy Next.js App Router (rotas de interface, autenticação client/edge, estado de sessão, renderização de conteúdo Markdown/HTML, componentes interativos WebGL/Canvas/GSAP e hooks de ciclo de vida).
- **Entregável Pós-Aprovação**: Geração do relatório técnico `walkthrough.md` com localização exata (`arquivo:linha`), explicação da causa raiz, impacto e snippet de correção/mitigação recomendado para cada apontamento.

---

## 1. Overview & Core Concept

- **O Que Esta Auditoria Realiza**: Uma varredura estática determinística sobre toda a arquitetura frontend da aplicação Next.js 16 / React 19, cruzando análise sintática/semântica (`tsc`, `eslint`), fluxo de estado assíncrono, barreiras de autorização e superfície de ataque XSS/CSRF/IDOR.
- **Público-Alvo & Contexto**: Engenharia de Software Principal e DevSecOps, garantindo que a aplicação institucional e o portal autenticado de Saúde e Segurança do Trabalho (SST / eSocial) operem sem condições de corrida, vazamentos de memória, falhas lógicas ou brechas de segurança no cliente.
- **Valor Principal**: Identificação preventiva e catalogação acionável de dívidas técnicas, resíduos de código morto, vulnerabilidades de sanitização/autorização e acoplamentos de infraestrutura antes da aplicação de correções em produção.

---

## 2. Escopo de Inspeção & Estratégia Visual/Funcional

- **Fluxos Auditados Passo a Passo**:
  1. **Landing Page Institucional & Componentes Interativos (`institutional`, `ui`)**: Inspeção de animações GSAP/ScrollTrigger, componentes de scroll (`ScrollExpand`, `ScrollStack`), canvases WebGL (`DitherVeil`), calculadoras normativas (NR-15/NR-16/eSocial) e gerenciamento de listeners de janela/DOM.
  2. **Autenticação, Sessão & Guardas de Rota (`auth`, `login`, `cadastro`, `conta`, `admin`)**: Verificação do fluxo de formulários, validação de credenciais, proteção contra bypass de autorização client-side (`role`, `mustChangePassword`), prevenção de open-redirect (`returnTo`) e sincronização de estado de sessão.
  3. **Motor de Artigos, Busca & Renderização de Conteúdo (`articles`, `search`, `reading`, `content`)**: Auditoria do pipeline de parsing Markdown (`marked`), sanitização HTML (`sanitize-html`), renderização de diagramas (`mermaid`), hidratação de estado de leitura e indexação `minisearch`.
  4. **Shell Global, Tema, Consentimento & Telemetria (`shell`, `consent`, `analytics`, `hooks`, `lib`)**: Análise da sincronização de tema claro/escuro (`theme-alabaster` vs `dark`), armadilhas de foco (`use-focus-trap`), armazenamento local (`localStorage` / cookies) e scrubbing de dados sensíveis em telemetria.
- **Identidade Visual & Consistência de Design System**:
  - Verificação de aderência aos tokens semânticos (`--bg-canvas`, `--text-primary`, `--accent-editorial`, `--accent-ochre`) para evitar regressões de contraste entre o tema claro (`theme-alabaster`) e o tema escuro (`dark`).

---

## 3. Eixos Técnicos de Auditoria & Critérios de Avaliação

- **Eixo 1 — Erros de Lógica, Concorrência e Clean Code**:
  - *Abordagem*: Rastrear variáveis, imports, tipos e hooks órfãos; identificar blocos `try-catch` silenciosos; auditar `useEffect`, `ResizeObserver`, `requestAnimationFrame` e listeners de `scroll`/`keydown` quanto ao descarte correto no unmount; verificar condições de corrida em chamadas `fetch` sem `AbortController`.
  - *Por Quê*: Previne memory leaks em navegação SPA, estados inconsistentes na UI e falhas silenciosas difíceis de diagnosticar.
- **Eixo 2 — Vulnerabilidades de Segurança e Autorização (DevSecOps)**:
  - *Abordagem*: Auditar exposição de segredos ou variáveis de ambiente no bundle cliente; inspecionar guardas de rota e flags de permissão (`admin` / `user`) no frontend e rotas proxy; validar proteção contra IDOR/BOLA em endpoints de usuário/sessão; auditar todos os pontos de uso de `dangerouslySetInnerHTML`, URI schemes e sanitização de inputs.
  - *Por Quê*: Garante defesa em profundidade contra XSS, escalação de privilégio no cliente e vazamento de credenciais/tokens.
- **Eixo 3 — Arquitetura, Dependências e Conformidade 12-Factor**:
  - *Abordagem*: Inspecionar `package.json` quanto ao uso de intervalos semânticos abertos (`^`) em dependências críticas; mapear persistência em memória/filesystem local vs. arquitetura stateless; levantar URLs, portas (`localhost:3000`) e parâmetros de infraestrutura engessados no código.
  - *Por Quê*: Assegura builds determinísticos e portabilidade para ambientes conteinerizados de produção.

---

## 4. Technical Architecture & Audit Execution Order *(Technical Reference)*

### Diagrama de Escopo e Fluxo da Auditoria

```
┌────────────────────────────────────────────────────────────────────────────┐
│                   CAMADA 1: RECONHECIMENTO & COMPILAÇÃO                    │
│   [TypeScript AST / tsc] ──► [ESLint Static Rules] ──► [Dependency Audit]  │
└───────────────────────────────────────┬────────────────────────────────────┘
                                        │
                                        ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                CAMADA 2: INSPEÇÃO DETERMINÍSTICA POR DOMÍNIO               │
│                                                                            │
│  ┌──────────────────────────┐  ┌──────────────────────────┐                │
│  │  Bloco A: Auth & Proxy   │  │ Bloco B: Institucional   │                │
│  │  • Guardas de Rota/RBAC  │  │ • GSAP / ScrollTrigger   │                │
│  │  • Cookies / CSRF / JWT  │  │ • ScrollExpand / Stack   │                │
│  │  • Redirect & Sanitização│  │ • WebGL / Event Cleanup  │                │
│  └────────────┬─────────────┘  └────────────┬─────────────┘                │
│               │                             │                              │
│  ┌────────────▼─────────────┐  ┌────────────▼─────────────┐                │
│  │ Bloco C: Artigos & Busca │  │ Bloco D: Shell, Hooks    │                │
│  │  • Markdown / XSS / DOM  │  │  & Infraestrutura        │                │
│  │  • Mermaid / Async State │  │ • Theme / Storage / PII  │                │
│  │  • Catálogo & Hydration  │  │ • 12-Factor & Hardcoding │                │
│  └────────────┬─────────────┘  └────────────┬─────────────┘                │
└───────────────┼─────────────────────────────┼──────────────────────────────┘
                └──────────────┬──────────────┘
                               ▼
┌────────────────────────────────────────────────────────────────────────────┐
│               CAMADA 3: CONSOLIDAÇÃO DO RELATÓRIO (walkthrough.md)         │
│   Task List Estrita: [CRÍTICA | ALTA | MÉDIA | BAIXA] + Localização:Linha  │
│   + Categoria + Descrição Técnica de Impacto + Snippet de Mitigação        │
└────────────────────────────────────────────────────────────────────────────┘
```

### Ordem Sequencial de Execução (Pós-Aprovação)

1. **Fase A — Núcleo de Autenticação, Autorização e Rotas App Router**:
   - Inspeção de fluxos de login, cadastro, recuperação de senha, verificação de e-mail, painel administrativo (`/admin`), conta (`/conta`) e rotas de autenticação (`/auth/*`, `/api/*`, `proxy.ts`).
2. **Fase B — Experiência Institucional, Animações e Componentes UI**:
   - Inspeção detalhada da landing page institucional, componentes de scroll (`ScrollExpand`, `ScrollStack`), efeitos visuais (`DitherVeil`, `GradualBlur`, `SplitTextReveal`), modais e calculadoras técnicas SST.
3. **Fase C — Leitura de Artigos, Sanitização HTML/Markdown e Busca**:
   - Inspeção do renderizador de artigos, sanitização contra XSS, integração Mermaid, busca `minisearch` e listas salvas (`minha-lista`).
4. **Fase D — Shell Global, Hooks, Telemetria, Dependências e 12-Factor**:
   - Inspeção do gerenciador de temas, cookies/consentimento LGPD, telemetria/scrubbing, hooks utilitários, `package.json` e variáveis de ambiente.
5. **Fase E — Emissão do Relatório `walkthrough.md`**:
   - Compilação de todas as descobertas classificadas por severidade no formato de Task List exigido, com snippets de código prontos para remediação.
