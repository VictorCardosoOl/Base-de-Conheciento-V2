# 📚 Base de Conhecimento SST

**Portal de alta performance para Saúde e Segurança do Trabalho e eSocial, construído em React e Next.js com catálogo normativo, calculadoras de conformidade, modo leitura e autenticação RBAC.**

---

## ✨ Principais Funcionalidades

- 🏛️ **Landing Page Institucional e Catálogo SST**
  - Métricas e dashboard interativo de conformidade eSocial (`EsocialComplianceAnalytics`) com gráficos de eventos (S-2210, S-2220, S-2240).
  - Calculadoras de risco e prazos regulatórios com fórmulas normativas de SST.
  - Gaveta de Dossiê Normativo (`NormativeDossierDrawer`) e emblemas interativos.
  - Seções em acordeão com perguntas frequentes auditadas.

- 📖 **Base de Conhecimento e Leitura Técnica**
  - Acervo completo de artigos em Markdown (GRO, PCMSO, PGR, LTCAT, NRs, eSocial, Comunicação CAT).
  - Renderização com Mermaid para diagramas de fluxos operacionais e sanitização de HTML.
  - Minha Lista (`/minha-lista`): fila de leitura personalizada, trilhas de aprendizagem e meta de tempo com progresso.
  - Controles de leitura: Realce de texto, modo Zen, estimativa de leitura e atalhos de navegação.

- 🔎 **Busca Ultrarrápida e Navegação**
  - Paleta de comandos global (`Ctrl+K` / `Cmd+K`) com busca indexada localmente via MiniSearch.
  - Navegação responsiva com Drawer lateral e cabeçalho fixo com temas Liquid Glass e alto contraste.

- 👤 **Identidade e Autenticação (RBAC)**
  - Autenticação com papéis granulares: Administrador, Editor e Leitor.
  - Criação de conta, recuperação de senha, login seguro e tokens EdDSA (Ed25519) com suporte a JWKS.
  - Fluxo de solicitação de papel de Editor e gestão de usuários para administradores.

- 🛠️ **Painel Administrativo (`/admin`)**
  - Gestão de artigos com editor de conteúdo e categorização.
  - Fila de moderação de comentários e sugestões de correção de leitores.
  - Aprovação/rejeição de pedidos de promoção para editor.

---

## 🚀 Como Executar

### Pré-requisitos

- Node.js 20+ ou 22
- npm

### Instalação e Execução

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento (porta 3000)
npm run dev

# Gerar build de produção
npm run build

# Iniciar em produção
npm run start
```

---

## 📂 Estrutura do Projeto

```
├── apps/
│   └── web/
│       ├── public/                # Assets estáticos, ícones e PWA manifest
│       ├── scripts/               # Gerador de catálogo estático
│       └── src/
│           ├── app/               # Rotas e páginas (App Router)
│           │   ├── admin/         # Painel administrativo e moderação
│           │   ├── artigo/        # Visualização de artigos e rotinas
│           │   ├── artigos/       # Catálogo geral
│           │   ├── conta/         # Perfil, preferências e segurança
│           │   ├── minha-lista/   # Fila de leitura e metas
│           │   ├── sobre/         # Apresentação institucional
│           │   └── ...            # Páginas de autenticação e legais
│           ├── components/        # Componentes UI reutilizáveis (Liquid Glass)
│           ├── content/artigos/   # Artigos em Markdown versionados
│           ├── features/          # Módulos de domínio (articles, auth, reading, etc.)
│           └── lib/               # Utilitários, storage e segurança
├── metadata.json                  # Configuração do applet
└── README.md                      # Documentação
```

---

## 📄 Licença

Distribuído sob licença MIT. Consulte `LICENSE` para detalhes.
