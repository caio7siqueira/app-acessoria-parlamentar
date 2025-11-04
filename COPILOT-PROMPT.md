# Prompt para GitHub Copilot - Sistema de Assessoria Parlamentar

## 📋 Contexto do Projeto

**Sistema de Assessoria Parlamentar** - Aplicação Next.js 13+ completa para gerenciamento de atendimentos parlamentares.

### 🏗️ Arquitetura Atual
- **Frontend:** Next.js 13.5.6 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth + Realtime)
- **PWA:** Service Worker + Manifest + Push Notifications
- **State Management:** React Query (TanStack Query)
- **Authentication:** Supabase Auth com middleware de proteção

### 📂 Estrutura do Projeto
```
src/
├── app/                    # App Router do Next.js
│   ├── login/page.tsx     # 🔴 PROBLEMA: Redirecionamento
│   ├── layout.tsx         # Layout principal
│   ├── providers.tsx      # Context providers
│   └── (rotas protegidas)/
├── middleware.ts          # 🔴 PROBLEMA: Detecção de auth
├── components/
│   ├── auth/AuthGuard.tsx # Guard de autenticação
│   └── ui/                # Componentes shadcn/ui
├── hooks/
│   └── useAuth.tsx        # 🔴 NOVO: Hook de auth
└── services/
    └── supabaseClient.ts  # Cliente Supabase
```

## 🚨 PROBLEMA PRINCIPAL: Redirecionamento de Autenticação

### Sintomas
1. **Login bem-sucedido** mas não redireciona para dashboard
2. **Middleware bloqueia** acesso mesmo após autenticação
3. **Cookies do Supabase** não sendo detectados corretamente
4. Funciona **apenas com refresh manual** da página

### 🔍 Arquivos com Problemas

#### 1. `/src/middleware.ts` (CRÍTICO)
```typescript
// PROBLEMA: Middleware muito restritivo
// Não detecta cookies do Supabase corretamente
export function middleware(request: NextRequest) {
    // Lógica de detecção de cookies precisa ser melhorada
    // Cookies do Supabase têm nomes específicos que mudam
}
```

#### 2. `/src/app/login/page.tsx` (CRÍTICO)  
```typescript
// PROBLEMA: Redirecionamento não funciona consistentemente
const handleLogin = async (e: React.FormEvent) => {
    // Após login bem-sucedido:
    // router.push(redirectTo) - NÃO FUNCIONA
    // window.location.href = redirectTo - FUNCIONA parcialmente
}
```

#### 3. `/src/hooks/useAuth.tsx` (NOVO - IMPLEMENTAR)
Sistema de autenticação global com context.

## 🎯 SOLUÇÕES NECESSÁRIAS

### 1. Corrigir Middleware de Autenticação
**Problema:** Middleware não detecta cookies do Supabase corretamente.

**Solução necessária:**
```typescript
// middleware.ts - CORRIGIR
export function middleware(request: NextRequest) {
    // 1. Detectar cookies específicos do Supabase:
    //    - sb-<project-id>-auth-token
    //    - supabase-auth-token  
    //    - sb-access-token
    
    // 2. Verificar validade do token JWT
    
    // 3. Em desenvolvimento, ser mais permissivo
    
    // 4. Log detalhado para debug
}
```

### 2. Implementar Redirecionamento Robusto
**Problema:** Múltiplas tentativas de redirecionamento conflitando.

**Solução necessária:**
```typescript
// login/page.tsx - CORRIGIR
const handleLogin = async (e: React.FormEvent) => {
    // 1. Aguardar cookies serem definidos (await new Promise...)
    // 2. Usar window.location.replace() em vez de href
    // 3. Verificar se sessão foi criada antes de redirecionar
    // 4. Fallback para refresh completo se necessário
}
```

### 3. Sistema de Autenticação Global
**Implementar:** Context + Hook para gerenciar estado global de auth.

```typescript
// useAuth.tsx - IMPLEMENTAR CORRETAMENTE
export function AuthProvider({ children }) {
    // 1. Detectar mudanças de auth em tempo real
    // 2. Sincronizar com cookies/localStorage
    // 3. Prover métodos: login, logout, checkAuth
    // 4. Loading states globais
}
```

### 4. Verificação de Cookies do Supabase
**Investigar:** Nomes exatos dos cookies que o Supabase cria.

```bash
# Comandos para debug no browser:
console.log(document.cookie);
localStorage.getItem('supabase.auth.token');
```

## 📋 CREDENCIAIS DE TESTE
- **Email:** `demotest@parlamentar.com`
- **Senha:** `123456`
- **Database:** Dados de demonstração já inseridos

## 🔧 VARIÁVEIS DE AMBIENTE NECESSÁRIAS
```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_key_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_key_aqui
```

## 🚀 PARA TESTAR NO CODESPACES

### 1. Setup Inicial
```bash
npm install
npm run dev
```

### 2. Página de Debug
Acesse `/test-auth` para diagnosticar:
- Status da autenticação  
- Cookies disponíveis
- Informações de sessão

### 3. Fluxo de Teste
1. Acesse `http://localhost:3000`
2. Deve redirecionar para `/login`
3. Faça login com credenciais demo
4. **PROBLEMA:** Não redireciona para dashboard
5. **WORKAROUND:** Refresh manual funciona

## 🎯 OBJETIVOS DO COPILOT

### Prioridade 1 - CRÍTICA
- [ ] **Corrigir middleware.ts** - Detecção correta de cookies Supabase
- [ ] **Corrigir login/page.tsx** - Redirecionamento após autenticação
- [ ] **Testar fluxo completo** - Login → Dashboard sem refresh

### Prioridade 2 - IMPORTANTE  
- [ ] **Implementar AuthProvider** robusto com context global
- [ ] **Adicionar logs detalhados** para debug de produção
- [ ] **Fallbacks** para diferentes ambientes (dev/prod)

### Prioridade 3 - OPCIONAL
- [ ] **Otimizar performance** do middleware
- [ ] **Implementar refresh automático** de tokens
- [ ] **Melhorar UX** com loading states

## 🔍 DICAS ESPECÍFICAS PARA INVESTIGAÇÃO

1. **Inspecionar Cookies:** Console do browser após login bem-sucedido
2. **Network Tab:** Verificar requests de auth e responses
3. **Supabase Logs:** Verificar se sessão está sendo criada
4. **Middleware Logs:** Adicionar console.log para debug

## 📚 RECURSOS ÚTEIS
- **Documentação Supabase Auth:** https://supabase.com/docs/guides/auth
- **Next.js Middleware:** https://nextjs.org/docs/app/building-your-application/routing/middleware
- **Cookies em Next.js:** https://nextjs.org/docs/app/api-reference/functions/cookies

## ✅ STATUS ATUAL
- ✅ **Sistema 90% funcional** - Todas as páginas implementadas
- ✅ **Database funcionando** - Dados de demo inseridos  
- ✅ **PWA configurada** - Instalável e offline
- 🔴 **Autenticação** - Login funciona, redirecionamento não
- 🔴 **Middleware** - Muito restritivo, não detecta auth

**OBJETIVO:** Resolver problema de redirecionamento para ter sistema 100% funcional em produção.

---

**Este é um projeto QUASE COMPLETO que precisa apenas de ajustes finos na autenticação. O Copilot deve focar especificamente no fluxo de login → redirecionamento → middleware.**