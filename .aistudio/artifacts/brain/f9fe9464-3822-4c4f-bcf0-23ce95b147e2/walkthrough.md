# Relatório de Auditoria Estática & Code Review DevSecOps (`walkthrough.md`)

**Escopo da Auditoria:** Frontend da aplicação (`apps/web/src/**/*`, `apps/web/package.json`, `apps/web/next.config.ts` e `package.json` raiz).  
**Modo de Operação:** Somente Leitura (*Read-Only Static Analysis* — nenhuma alteração realizada em código de produção).  
**Metodologia:** SAST (*Static Application Security Testing*), análise de fluxo de controle/estado React 19 + Next.js 16, conformidade *12-Factor App* e higiene de dependências.

---

## Sumário Executivo

| Eixo de Análise | Crítica | Alta | Média | Baixa | Total |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **1. Erros de Lógica e Clean Code** | 0 | 2 | 5 | 3 | **10** |
| **2. Vulnerabilidades de Segurança e Autorização** | 3 | 4 | 2 | 0 | **9** |
| **3. Arquitetura e Infraestrutura** | 0 | 2 | 2 | 0 | **4** |
| **Total de Apontamentos** | **3** | **8** | **9** | **3** | **23** |

---

## 1. ERROS DE LÓGICA E CLEAN CODE

- [x] [Severidade: ALTA] - Falha de Simetria de Serialização em `safeStorage.setItem` vs `safeStorage.getItem` para Strings
  - Localização: `apps/web/src/lib/storage.ts:12` e `apps/web/src/lib/storage.ts:28`
  - Categoria: Lógica / Clean Code
  - Descrição: O método `safeStorage.setItem(key, value)` verifica `typeof value === 'string' ? value : JSON.stringify(value)` (linha 28), gravando strings puras **sem aspas JSON** no `localStorage`. Contudo, `safeStorage.getItem<T>(key, fallback)` executa incondicionalmente `JSON.parse(item) as T` (linha 12). Ao ler qualquer string gravada via `setItem` (ex.: um token, tema ou identificador textual), `JSON.parse` lança `SyntaxError`, cai no bloco `catch {}` silencioso (linha 13) e retorna sempre o `fallback`, descartando o valor persistido.
  - Solução Proposta:
    ```ts
    // apps/web/src/lib/storage.ts
    export const safeStorage = {
      getItem<T>(key: string, fallback: T): T {
        if (typeof window === 'undefined') return fallback;
        try {
          const item = window.localStorage.getItem(key);
          if (item === null) return fallback;
          return JSON.parse(item) as T;
        } catch (err) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn(`[safeStorage] Falha ao ler chave "${key}":`, err);
          }
          return fallback;
        }
      },

      setItem<T>(key: string, value: T): boolean {
        if (typeof window === 'undefined') return false;
        try {
          window.localStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch (err) {
          if (process.env.NODE_ENV !== 'production') {
            console.warn(`[safeStorage] Quota excedida ou falha ao gravar "${key}":`, err);
          }
          return false;
        }
      },
    };
    ```

- [x] [Severidade: ALTA] - Divergência de Regras de Negócio na Validação de Comprimento Mínimo de Senha (8 vs 12 Caracteres)
  - Localização: `apps/web/src/features/auth/security.ts:90` e `apps/web/src/features/auth/client.ts:107`
  - Categoria: Lógica / Consistência de Domínio
  - Descrição: Em `client.ts:107`, a constante `PASSWORD_MIN_LENGTH` é definida como `12` e exigida no submit de `use-register-form.ts:127`. Todavia, o avaliador de entropia `evaluatePasswordStrength` em `security.ts:90` e `security.ts:103` pontua senhas a partir de `8` caracteres (`if (password.length >= 8) score += 1`) e exibe feedback `"Use pelo menos 8 caracteres."`. Uma senha de 10 caracteres com letras maiúsculas, minúsculas, números e símbolos recebe `score = 3` (`"Forte"`, barra verde) no indicador visual do formulário de cadastro, mas é bloqueada ao clicar em criar conta.
  - Solução Proposta:
    ```ts
    // apps/web/src/features/auth/security.ts
    import { PASSWORD_MIN_LENGTH } from './client';

    // Linha 90: alinhar pontuação e feedback ao mínimo real do contrato (12 caracteres)
    if (password.length >= PASSWORD_MIN_LENGTH) score += 1;
    if (password.length >= PASSWORD_MIN_LENGTH + 4) score += 1;

    if (password.length < PASSWORD_MIN_LENGTH) {
      feedback.push(`Use pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`);
    }
    ```

- [x] [Severidade: MÉDIA] - Falso Positivo de Sucesso no Hook `useClipboardCopy` quando a API de Clipboard Falha
  - Localização: `apps/web/src/features/institutional/hooks/useInteractiveHooks.ts:71-80`
  - Categoria: Tratamento de Erros / Lógica de UI
  - Descrição: No método `copyText`, quando `navigator.clipboard.writeText(text)` lança exceção (ex.: contexto sem permissão `clipboard-write` ou documento sem foco), o bloco `catch` (linha 71) executa `setCopiedKey(key)` da mesma forma que o bloco `try`, exibindo o selo visual `"Copiado ✓"` para o usuário mesmo quando a área de transferência não foi alterada e a função retorna `false`.
  - Solução Proposta:
    ```ts
    // apps/web/src/features/institutional/hooks/useInteractiveHooks.ts
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[useClipboardCopy] Falha ao copiar para a área de transferência:', error);
      }
      setCopiedKey(null);
      return false;
    }
    ```

- [x] [Severidade: MÉDIA] - Código Morto: Componentes Inteiros (`DitherVeil` e `GradualBlur`) e Folhas de Estilo Órfãs
  - Localização: `apps/web/src/components/ui/DitherVeil.tsx:1`, `apps/web/src/components/ui/DitherVeil.css:1`, `apps/web/src/components/ui/GradualBlur.tsx:1` e `apps/web/src/components/ui/GradualBlur.css:1`
  - Categoria: Clean Code / Código Morto
  - Descrição: Os componentes `DitherVeil` (850 linhas de shaders WebGL2 com dependência `ogl` e URL externa hardcoded do Unsplash na linha 40) e `GradualBlur` (276 linhas) não são importados por nenhum arquivo de página, componente ou teste da aplicação. Além de inflarem a superfície de manutenção em mais de 1.100 linhas, `DitherVeil` mantém a dependência `ogl` ativa sem uso real.
  - Solução Proposta:
    ```bash
    # Remover os 4 arquivos órfãos e a dependência ogl caso não haja uso planejado:
    rm apps/web/src/components/ui/DitherVeil.tsx apps/web/src/components/ui/DitherVeil.css
    rm apps/web/src/components/ui/GradualBlur.tsx apps/web/src/components/ui/GradualBlur.css
    ```

- [x] [Severidade: MÉDIA] - Redundância Entre Utilitários de Sanitização, Validação e Armazenamento Local
  - Localização: `apps/web/src/features/auth/security.ts:32` vs `apps/web/src/features/institutional/utils/sstCalculations.ts:1369` e `apps/web/src/lib/storage.ts:8` vs `apps/web/src/features/reading/reading-experience-service.ts:47`
  - Categoria: Clean Code / Redundância (Violação DRY)
  - Descrição: Existem implementações duplicadas para as mesmas responsabilidades transversais:
    1. `sanitizeInput` (`features/auth/security.ts:32`) e `sanitizeTextInput` (`features/institutional/utils/sstCalculations.ts:1369`) executam exatamente a mesma limpeza de tags HTML e caracteres ASCII de controle, mas `sanitizeTextInput` não remove esquemas executáveis (`javascript:`, `data:`, `vbscript:`).
    2. `readJSON`/`writeJSON` (`features/reading/reading-experience-service.ts:47-74`) reimplementam o wrapper `safeStorage` (`lib/storage.ts:8-37`).
    3. `clamp` é declarado separadamente em `ScrollExpand.tsx:8`, `GradualBlur.tsx:44` e `sstCalculations.ts:9`.
  - Solução Proposta:
    ```ts
    // Centralizar sanitizeInput em src/lib/sanitize.ts e reutilizar em auth/security.ts e sstCalculations.ts
    export { sanitizeInput as sanitizeTextInput } from '@/features/auth/security';
    ```

- [x] [Severidade: MÉDIA] - Uso de `window.prompt` Bloqueante no Fallback de Compartilhamento (`useShare`)
  - Localização: `apps/web/src/hooks/use-share.ts:26`
  - Categoria: Clean Code / Compatibilidade de Runtime (iFrame)
  - Descrição: Quando `navigator.share` e `navigator.clipboard.writeText` falham ou estão bloqueados por política de permissões do iFrame, `useShare` invoca `window.prompt(...)` (linha 26). Diálogos nativos síncronos (`alert`, `confirm`, `prompt`) bloqueiam a thread principal do navegador e são suprimidos em ambientes de preview baseados em iFrame sandboxed.
  - Solução Proposta:
    ```ts
    // apps/web/src/hooks/use-share.ts
    const [manualShareUrl, setManualShareUrl] = useState<string | null>(null);
    // No bloco catch:
    setManualShareUrl(url); // Exibir em um componente <Dialog /> ou <Toast /> acessível da própria UI
    ```

- [x] [Severidade: MÉDIA] - Timers `setTimeout` Sem Cleanup no Desmontar de Componentes (`LoginForm` e `useShare`)
  - Localização: `apps/web/src/app/login/LoginForm.tsx:107` e `apps/web/src/hooks/use-share.ts:22`
  - Categoria: Concorrência e Estado / Memory Leak
  - Descrição: Em `LoginForm.tsx:107` (`setTimeout(() => setDemoFilled(false), 2500)`) e `use-share.ts:22` (`setTimeout(() => setShareFeedback(false), 2000)`), os identificadores dos timers não são armazenados em `useRef` nem cancelados no `useEffect` de desmontagem. Se o usuário preencher os dados de demonstração e submeter o login imediatamente, o componente desmonta antes de 2,5s com um callback pendente referenciando o escopo do componente.
  - Solução Proposta:
    ```tsx
    // apps/web/src/app/login/LoginForm.tsx
    const demoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
      return () => {
        if (demoTimerRef.current) clearTimeout(demoTimerRef.current);
      };
    }, []);

    const handleFillDemo = () => {
      setEmail('admin@sst.local');
      setPassword('admin123456');
      setError('');
      setDemoFilled(true);
      if (demoTimerRef.current) clearTimeout(demoTimerRef.current);
      demoTimerRef.current = setTimeout(() => setDemoFilled(false), 2500);
    };
    ```

- [x] [Severidade: BAIXA] - Código Morto e Props Ignoradas em `InstitutionalLandingPage`, `InstitutionalNavbar` e `AwwwardsMotion`
  - Localização: `apps/web/src/features/institutional/components/InstitutionalLandingPage.tsx:82-91`, `apps/web/src/features/institutional/components/InstitutionalNavbar.tsx:144` e `apps/web/src/features/institutional/components/AwwwardsMotion.tsx:10,33-34`
  - Categoria: Clean Code / Código Morto
  - Descrição:
    1. Em `InstitutionalLandingPage.tsx:82-91`, a função `setThemeMode` é declarada mas nunca invocada (o componente usa `setIsDarkMode` diretamente na linha 706).
    2. Em `InstitutionalNavbar.tsx:52,114,144`, o estado `isHidden` é calculado a cada evento de scroll, mas na linha 144 a constante `const effectiveHidden = false;` neutraliza o comportamento de auto-ocultação, tornando o estado `isHidden` inócuo.
    3. Em `AwwwardsMotion.tsx:10`, `EASE_AWWWARDS` não é utilizado em nenhum módulo, e as props `delay` e `charStagger` de `SplitTextReveal` (linhas 33–34) são recebidas na assinatura mas nunca aplicadas aos elementos renderizados.
  - Solução Proposta:
    ```tsx
    // Remover `setThemeMode` não utilizado em InstitutionalLandingPage.tsx
    // Aplicar `isHidden` em InstitutionalNavbar.tsx:144:
    const effectiveHidden = isHidden && !mobileMenuOpen;
    ```

- [x] [Severidade: BAIXA] - Seletores de `useFocusTrap` Incompletos para Inputs de Email, Senha e Busca
  - Localização: `apps/web/src/hooks/use-focus-trap.ts:10-12`
  - Categoria: Lógica de Acessibilidade / Clean Code
  - Descrição: A query CSS do `useFocusTrap` seleciona apenas `input[type="text"], input[type="radio"], input[type="checkbox"]`, omitindo `input[type="email"]`, `input[type="password"]`, `input[type="search"]` e elementos `input:not([type])`. Em modais que contenham campos de busca (`type="search"`) ou email, o ciclo de tecla `Tab` ignora esses inputs no cálculo de `firstElement` e `lastElement`.
  - Solução Proposta:
    ```ts
    // apps/web/src/hooks/use-focus-trap.ts
    const focusableElements = ref.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    ```

- [x] [Severidade: BAIXA] - Blocos `catch {}` Vazios que Silenciam Exceções Críticas de Configuração e Renderização
  - Localização: `apps/web/src/lib/mock-auth-store.ts:29`, `apps/web/src/components/ui/DitherVeil.tsx:780` e `apps/web/src/features/articles/hooks/use-mermaid-renderer.ts:28`
  - Categoria: Tratamento de Erros
  - Descrição: Em `mock-auth-store.ts:29`, uma falha de `JSON.parse(process.env.MOCK_AUTH_PRIVATE_JWK)` é silenciada por um `catch {}` vazio, fazendo fallback silencioso para a chave privada estática de desenvolvimento sem alertar o operador sobre a variável de ambiente malformada.
  - Solução Proposta:
    ```ts
    // apps/web/src/lib/mock-auth-store.ts:29
    } catch (error) {
      console.error('[mock-auth-store] MOCK_AUTH_PRIVATE_JWK inválida; verifique o JSON configurado:', error);
    }
    ```

---

## 2. VULNERABILIDADES DE SEGURANÇA E AUTORIZAÇÃO

- [x] [Severidade: CRÍTICA] - Chave Privada Ed25519 (JWK), Senha de Administrador e Salt Estático Hardcoded no Código-Fonte
  - Localização: `apps/web/src/lib/mock-auth-store.ts:15-22` e `apps/web/src/lib/mock-auth-store.ts:97-105`
  - Categoria: Segurança / Gestão de Segredos (CWE-798 / CWE-321)
  - Descrição: O arquivo `mock-auth-store.ts` contém:
    1. O parâmetro privado `d: 'Q1reQYZcWpSF4yntdJK2rjo3ekiz52L4ZwxLjl1VLRw'` da chave criptográfica Ed25519 (`DEFAULT_DEV_PRIV_JWK`, linha 21) usada para assinar tokens JWT (`EdDSA`) aceitos por `session.ts` via `/.well-known/jwks.json`.
    2. A senha padrão do administrador `'admin123456'` (linha 97 e também exposta no bundle cliente em `apps/web/src/app/login/LoginForm.tsx:104`).
    3. Um salt estático hardcoded `'sst-admin-static-salt'` (linha 97) compartilhado na derivação `scryptSync`.
    Qualquer pessoa com acesso ao repositório pode forjar tokens JWT válidos para `role: 'admin'` caso o endpoint JWKS local esteja ativo.
  - Solução Proposta:
    ```ts
    // apps/web/src/lib/mock-auth-store.ts
    import { generateKeyPairSync, randomBytes, scryptSync } from 'node:crypto';

    // Gerar par de chaves efêmero por inicialização de processo em desenvolvimento (nunca hardcoded)
    const ephemeralKeyPair = generateKeyPairSync('ed25519');
    export const MOCK_PRIV_JWK = process.env.MOCK_AUTH_PRIVATE_JWK
      ? JSON.parse(process.env.MOCK_AUTH_PRIVATE_JWK)
      : ephemeralKeyPair.privateKey.export({ format: 'jwk' });
    export const MOCK_PUB_JWK = {
      ...ephemeralKeyPair.publicKey.export({ format: 'jwk' }),
      kid: 'mock-key-1',
      alg: 'EdDSA',
      use: 'sig',
    };
    ```

- [x] [Severidade: CRÍTICA] - Ausência de Trava de Produção em `/auth/register`, `/auth/refresh` e `/auth/me` (Bypass Completo do Bloqueio de Mock Auth)
  - Localização: `apps/web/src/app/auth/register/route.ts:14`, `apps/web/src/app/auth/refresh/route.ts:8` e `apps/web/src/app/auth/me/route.ts:7`
  - Categoria: Segurança / Autenticação e Controle de Acesso (CWE-287)
  - Descrição: A rota `POST /auth/login` (`apps/web/src/app/auth/login/route.ts:12`) verifica `if (process.env.NODE_ENV === 'production' && process.env.ENABLE_MOCK_AUTH !== 'true') return 403`. No entanto, as rotas `POST /auth/register`, `POST /auth/refresh`, `GET /auth/me` e `GET /.well-known/jwks.json` **não possuem essa verificação**. Em um deploy de produção onde o rewrite externo não intercepte `/auth/*`, um atacante pode chamar `POST /auth/register`, criar uma conta no `mockUsers` e receber cookies `kb_at` e `kb_rt` assinados e perfeitamente aceitos pelo servidor.
  - Solução Proposta:
    ```ts
    // Extrair helper em apps/web/src/lib/mock-auth-store.ts e aplicar no topo de TODAS as rotas /app/auth/* e /.well-known/jwks.json:
    export function isMockAuthAllowed(): boolean {
      return process.env.NODE_ENV !== 'production' || process.env.ENABLE_MOCK_AUTH === 'true';
    }

    // No início de POST/GET em register, refresh, me, logout, username-available e jwks.json:
    if (!isMockAuthAllowed()) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'Mock auth desativado em produção' } },
        { status: 403 }
      );
    }
    ```

- [x] [Severidade: CRÍTICA] - Sessões Não Revogadas no Servidor no `POST /auth/logout` e Não Verificadas no `GET /auth/me`
  - Localização: `apps/web/src/app/auth/logout/route.ts:3-13` e `apps/web/src/app/auth/me/route.ts:21-38`
  - Categoria: Segurança / Gestão de Sessão (CWE-613)
  - Descrição: Duas falhas combinadas quebram a revogação de sessão documentada em `session.ts:17-19`:
    1. `POST /auth/logout` (`logout/route.ts:3-13`) apenas envia cabeçalhos `Set-Cookie` vazios para o navegador, **sem remover o `sessionId` (`kb_rt`) do `mockSessions` no servidor**.
    2. `GET /auth/me` (`me/route.ts:26-38`) valida a assinatura do JWT e busca o usuário por `payload.sub`, mas **não verifica se `payload.sid` consta como sessão ativa em `mockSessions`**.
    Como consequência, tokens `kb_at` ou `kb_rt` capturados antes do logout continuam 100% válidos após o usuário encerrar a sessão.
  - Solução Proposta:
    ```ts
    // apps/web/src/app/auth/logout/route.ts
    import { NextRequest, NextResponse } from 'next/server';
    import { mockSessions } from '@/lib/mock-auth-store';

    export async function POST(request: NextRequest) {
      const refreshToken = request.cookies.get('kb_rt')?.value;
      if (refreshToken) {
        mockSessions.delete(refreshToken);
      }
      // ... limpar cookies na resposta
    }

    // apps/web/src/app/auth/me/route.ts (após jwtVerify na linha 25):
    const sessionId = typeof payload.sid === 'string' ? payload.sid : null;
    if (!sessionId || !mockSessions.has(sessionId)) {
      return NextResponse.json({ error: { code: 'SESSION_REVOKED' } }, { status: 401 });
    }
    ```

- [x] [Severidade: ALTA] - Validação Insuficiente no Servidor em `POST /auth/register` (Bypass de Política de Senha e de Usernames Reservados)
  - Localização: `apps/web/src/app/auth/register/route.ts:55-93`
  - Categoria: Segurança / Validação de Entrada no Servidor (CWE-20)
  - Descrição: O endpoint `POST /auth/register` confia na validação do cliente (`use-register-form.ts`) e verifica apenas `if (!email || !password || typeof password !== 'string' || !username || !displayName)`. Uma requisição HTTP direta para `POST /auth/register` permite:
    1. Cadastrar senha de 1 caractere (ignorando `PASSWORD_MIN_LENGTH = 12`).
    2. Cadastrar nomes de usuário reservados como `root`, `admin`, `suporte`, `sistema` ou `security` (pois `RESERVED_USERNAMES` e `isValidUsername` de `features/auth/identity.ts` só são checados em `/auth/username-available`, não em `/auth/register`).
  - Solução Proposta:
    ```ts
    // apps/web/src/app/auth/register/route.ts
    import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '@/features/auth/client';
    import { displayNameProblem, isValidUsername, normalizeUsername } from '@/features/auth/identity';

    const normUser = normalizeUsername(String(username));
    if (
      !isValidUsername(normUser) ||
      displayNameProblem(displayName) !== null ||
      password.length < PASSWORD_MIN_LENGTH ||
      password.length > PASSWORD_MAX_LENGTH
    ) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Dados fora do padrão de segurança' } },
        { status: 400 }
      );
    }
    ```

- [x] [Severidade: ALTA] - Campo Honeypot Anti-Bot (`website_url`) Nunca Enviado ao Servidor pelo Cliente de Registro
  - Localização: `apps/web/src/features/auth/use-register-form.ts:96-98` e `apps/web/src/features/auth/client.ts:258-268` vs `apps/web/src/app/auth/register/route.ts:41`
  - Categoria: Segurança / Automação e Anti-Bot
  - Descrição: O servidor em `app/auth/register/route.ts:41` implementa a verificação `if (body.website_url)` para detectar bots silenciosamente (retornando HTTP 200 falso). Porém, `use-register-form.ts:96` intercepta `if (honeypot) return;` no cliente e `client.ts:261` nunca inclui `website_url` no payload JSON enviado a `/auth/register`. Isso torna a defesa de honeypot de servidor código morto inalcançável pela UI.
  - Solução Proposta:
    ```ts
    // apps/web/src/features/auth/client.ts:261
    body: JSON.stringify({
      email: input.email,
      password: input.password,
      username: input.username,
      display_name: input.displayName,
      website_url: input.honeypot || undefined,
      ...termsAndProfileBody(input),
    }),
    ```

- [x] [Severidade: ALTA] - Bypass de Rate Limiting via Spoofing do Cabeçalho `X-Forwarded-For`
  - Localização: `apps/web/src/app/auth/login/route.ts:20-23` e `apps/web/src/app/auth/register/route.ts:16-19`
  - Categoria: Segurança / Rate Limiting e Controle de Força Bruta (CWE-307)
  - Descrição: O rate limiter de login e de cadastro extrai o IP do cliente lendo diretamente o primeiro elemento de `request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()`. Como qualquer cliente HTTP pode enviar um cabeçalho `X-Forwarded-For: <ip-aleatório>` a cada tentativa de força bruta, um atacante contorna trivialmente o limite de 10 tentativas por e-mail (`rateKey = ${ip}:${normEmail}`) e o limite de 5 cadastros por IP.
  - Solução Proposta:
    ```ts
    // No login, aplicar rate-limit também pela chave normalizada do e-mail independentemente do IP,
    // ou ler o IP confiável fornecido pela plataforma de borda:
    const emailRateCheck = checkLoginRateLimit(`acct:${normEmail}`);
    const ipRateCheck = checkLoginRateLimit(`ip:${ip}:${normEmail}`);
    if (!emailRateCheck.allowed || !ipRateCheck.allowed) {
      // retornar 429
    }
    ```

- [x] [Severidade: ALTA] - Cookie de Sessão Definido com `SameSite=None` em Conexões HTTPS Sem Necessidade Cross-Site (Risco de CSRF)
  - Localização: `apps/web/src/app/auth/login/route.ts:66`, `apps/web/src/app/auth/register/route.ts:119` e `apps/web/src/app/auth/refresh/route.ts:39`
  - Categoria: Segurança / Configuração de Cookies e CSRF (CWE-352)
  - Descrição: Nas três rotas que emitem os cookies `kb_at` e `kb_rt`, a política `sameSite` é definida como `const sameSite = isSecure ? ('none' as const) : ('lax' as const);`. Como todas as chamadas de autenticação e conteúdo ocorrem na **mesma origem** do Next.js (`/auth/*` e `/content/*` via rewrite server-side), `SameSite=None` em HTTPS expõe as rotas mutáveis (`POST /auth/logout`, `POST /auth/role-request`, etc.) ao envio automático de cookies em requisições cross-site de terceiros, a menos que o aplicativo esteja explicitamente rodando dentro de um iFrame cross-origin de preview.
  - Solução Proposta:
    ```ts
    // Usar SameSite=Lax por padrão em produção e permitir SameSite=None apenas quando ALLOW_IFRAME_COOKIES=true
    const sameSite =
      isSecure && process.env.ALLOW_IFRAME_COOKIES === 'true'
        ? ('none' as const)
        : ('lax' as const);
    ```

- [x] [Severidade: MÉDIA] - Content Security Policy (`security-headers.ts`) Permite `'unsafe-inline'` em `script-src` em Produção
  - Localização: `apps/web/src/lib/security-headers.ts:16-19`
  - Categoria: Segurança / Hardening de Cabeçalhos HTTP
  - Descrição: A diretiva `script-src` da Content Security Policy inclui `'unsafe-inline'` mesmo quando `isDev === false` (`"script-src 'self' 'unsafe-inline'"`). Na presença de `'unsafe-inline'`, a proteção da CSP contra execução de scripts injetados (XSS refletido ou armazenado) é substancialmente reduzida.
  - Solução Proposta:
    ```ts
    // Migrar para CSP baseada em nonce por requisição no proxy.ts (Next.js Middleware/Proxy)
    // ou hash estrito dos scripts de bootstrap do Next.js em produção.
    ```

- [x] [Severidade: MÉDIA] - Risco de ReDoS (*Regular Expression Denial of Service*) ou Degradação no DOM Walk de `useTextHighlighter`
  - Localização: `apps/web/src/features/articles/hooks/use-text-highlighter.ts:42-68`
  - Categoria: Segurança / Disponibilidade no Cliente (CWE-400)
  - Descrição: `useTextHighlighter` lê a lista de grifos do `localStorage` (`sst_article_highlights`) sem limite máximo de itens nem limite de tamanho por `h.text`, e para cada nó de texto do artigo executa `frag.split(new RegExp(\`(${escaped})\`, 'gi'))` multiplicando o array `fragments` a cada destaque. Se houver dezenas de destaques curtos (ex.: letras individuais salvas no `localStorage`), o número de fragmentos cresce exponencialmente e trava a thread principal ao abrir o artigo.
  - Solução Proposta:
    ```ts
    // apps/web/src/features/articles/hooks/use-text-highlighter.ts
    const MAX_HIGHLIGHTS_PER_ARTICLE = 50;
    const MIN_HIGHLIGHT_LENGTH = 2;
    const safeHighlights = highlights
      .filter((h) => typeof h.text === 'string' && h.text.trim().length >= MIN_HIGHLIGHT_LENGTH)
      .slice(0, MAX_HIGHLIGHTS_PER_ARTICLE);
    ```

---

## 3. ARQUITETURA E INFRAESTRUTURA

- [x] [Severidade: ALTA] - Persistência de Estado em Memória (`Map` Global e de Módulo) Violando Arquitetura Stateless (*12-Factor App*) e Causando Vazamento de Memória
  - Localização: `apps/web/src/lib/mock-auth-store.ts:89-121` e `apps/web/src/app/auth/register/route.ts:12`
  - Categoria: Arquitetura / Escalabilidade & 12-Factor App (VI - Processes)
  - Descrição:
    1. `mockUsers`, `mockSessions` e `mockLoginRateLimits` (`mock-auth-store.ts:89-121`) e `ipRateLimits` (`register/route.ts:12`) armazenam estado crítico de autenticação e rate-limiting na memória RAM do processo Node.js. Em ambientes serverless ou com múltiplas réplicas horizontais (containers), um usuário que faz login na instância A recebe `401 Unauthorized` quando sua requisição seguinte cai na instância B.
    2. **Vazamento de Memória (Unbounded Map Growth):** `mockSessions`, `mockLoginRateLimits` e `ipRateLimits` nunca expurgam chaves expiradas proativamente (uma chave só é deletada se o mesmo IP/usuário fizer nova requisição após o vencimento). Um ataque de flood com IPs ou sessões distintas esgota o heap do processo Node.js.
  - Solução Proposta:
    ```ts
    // 1. Em produção, delegar 100% do estado ao serviço externo stateless (PostgreSQL/Redis via AuthService).
    // 2. Para o store de desenvolvimento, impor teto máximo (LRU/TTL Eviction) nos Maps em memória:
    const MAX_MAP_ENTRIES = 1000;
    function pruneRateLimits(map: Map<string, { resetAt: number }>, now: number) {
      if (map.size < MAX_MAP_ENTRIES) return;
      for (const [k, v] of map.entries()) {
        if (now >= v.resetAt) map.delete(k);
      }
      if (map.size >= MAX_MAP_ENTRIES) {
        const oldestKey = map.keys().next().value;
        if (oldestKey) map.delete(oldestKey);
      }
    }
    ```

- [x] [Severidade: ALTA] - Dependências de Produção e Desenvolvimento Não Pinadas (`^`) em `package.json`
  - Localização: `apps/web/package.json:36-87` e `package.json:25-28`
  - Categoria: Infraestrutura / Governança de Supply Chain & Builds Determinísticos
  - Descrição: No arquivo `apps/web/package.json`, 16 dependências de produção (`@gsap/react`, `@sentry/react`, `gsap`, `jose`, `lenis`, `lucide-react`, `marked`, `mermaid`, `minisearch`, `motion`, `next`, `ogl`, `react`, `react-dom`, `recharts`, `sanitize-html`) e 9 dependências de desenvolvimento utilizam o operador caret (`^`), além de `concurrently` e `typescript` no `package.json` raiz. Isso permite atualizações automáticas de versões *minor* e *patch* caso o lockfile seja regenerado, introduzindo risco de regressões silenciosas ou comprometimento da cadeia de suprimentos (*Supply Chain*).
  - Solução Proposta:
    ```json
    // apps/web/package.json — Pinar versões exatas (sem ^ ou ~)
    "dependencies": {
      "@gsap/react": "2.1.2",
      "@sentry/react": "10.49.0",
      "gsap": "3.14.2",
      "jose": "6.2.2",
      "lenis": "1.3.17",
      "lucide-react": "1.16.0",
      "marked": "17.0.6",
      "mermaid": "11.14.0",
      "minisearch": "7.2.0",
      "motion": "12.23.24",
      "next": "16.2.4",
      "react": "19.2.5",
      "react-dom": "19.2.5",
      "recharts": "3.8.1",
      "sanitize-html": "2.17.2",
      "server-only": "0.0.1"
    }
    ```

- [x] [Severidade: MÉDIA] - URLs e Portas de Infraestrutura (`http://localhost:3000`) Hardcoded no Código-Fonte
  - Localização: `apps/web/src/lib/mock-auth-store.ts:161`, `apps/web/src/app/auth/me/route.ts:17,22` e `apps/web/next.config.ts:33`
  - Categoria: Arquitetura / Configuração 12-Factor (III - Config)
  - Descrição: O endereço `http://localhost:3000` está hardcoded como fallback de `AUTH_ISSUER` e URL de busca do JWKS (`new URL(\`${issuer}/.well-known/jwks.json\`)`) em `mock-auth-store.ts:161` e `app/auth/me/route.ts:17,22`, além da comparação literal em `next.config.ts:33`. Se o servidor Next.js for iniciado em outra porta (ex.: `PORT=4000` ou container reverso) sem `AUTH_ISSUER` explícito, a chamada interna de verificação de token (`createRemoteJWKSet`) tentará conectar na porta `3000` errada e falhará com `ECONNREFUSED`.
  - Solução Proposta:
    ```ts
    // apps/web/src/app/auth/me/route.ts
    // Validar diretamente contra a chave pública em memória (importJWK(MOCK_PUB_JWK, 'EdDSA'))
    // ou derivar a origem a partir de request.nextUrl.origin quando AUTH_ISSUER não estiver definida:
    const issuer = process.env.AUTH_ISSUER || request.nextUrl.origin;
    ```

- [x] [Severidade: MÉDIA] - Duplicação de Renderização e Sanitização de Markdown Entre SSR (`markdown.ts`) e Cliente (`use-article-content.ts`)
  - Localização: `apps/web/src/features/articles/markdown.ts:8-12` vs `apps/web/src/features/articles/use-article-content.ts:57-78`
  - Categoria: Arquitetura / Ponto Único de Verdade (SSOT)
  - Descrição: O módulo `markdown.ts` documenta ser o *"Ponto único da verdade (SSOT) para renderização de artigos no SSR e no cliente"*, porém `use-article-content.ts:57-78` não utiliza `renderMarkdownToSafeHtml`: ele chama `marked.parse` diretamente, injeta spans de glossário (`<span class="glossary-term" data-tooltip="...">`) via regex e chama `sanitizeArticleHtml(rawHtml)`. Como resultado, um artigo renderizado via `markdown.ts` não possui tooltips de glossário, enquanto um artigo renderizado via `use-article-content.ts` possui.
  - Solução Proposta:
    ```ts
    // Unificar a injeção de glossário dentro de `renderMarkdownToSafeHtml` em `apps/web/src/features/articles/markdown.ts`
    // e reutilizar `renderMarkdownToSafeHtml` dentro de `use-article-content.ts`.
    ```
