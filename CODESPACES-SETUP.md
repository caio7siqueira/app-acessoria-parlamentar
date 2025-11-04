# 🚀 Setup GitHub Codespaces - Sistema Assessoria Parlamentar

## 📦 Deploy Automático no Codespaces

### 1. Configuração Inicial
```bash
# Clone ou abra o repositório no Codespaces
# As dependências serão instaladas automaticamente

# Verificar Node.js
node --version  # Deve ser 18+

# Instalar dependências (se necessário)
npm install
```

### 2. Variáveis de Ambiente
Crie arquivo `.env.local`:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Next.js Configuration
NODE_ENV=production
NEXTAUTH_URL=https://your-codespace-url.github.dev
```

### 3. Iniciar Aplicação
```bash
# Desenvolvimento
npm run dev

# Ou produção
npm run build
npm start
```

### 4. Acessar Aplicação
- URL será exibida no terminal
- Formato: `https://[workspace-name]-3000.app.github.dev`
- Porta 3000 será exposta automaticamente

## 🔧 Correções Específicas para Codespaces

### 1. URL de Produção
O Codespaces usa URLs HTTPS por padrão, o que resolve muitos problemas de cookies:

```typescript
// middleware.ts - Funcionará melhor em HTTPS
// Cookies seguros serão definidos corretamente
```

### 2. Configuração do Supabase
Adicionar URL do Codespace nas configurações do Supabase:

1. Acesse painel do Supabase
2. Settings → Auth → Site URL
3. Adicionar: `https://your-codespace-url.github.dev`
4. Redirect URLs: adicionar mesma URL + `/auth/callback`

### 3. Variáveis Específicas
```env
# Para Codespaces
NEXT_PUBLIC_BASE_URL=https://your-codespace-url.github.dev
NEXT_PUBLIC_ENVIRONMENT=codespaces
```

## 🐛 Debug no Codespaces

### 1. Logs Detalhados
```bash
# Terminal 1: Aplicação com logs
npm run dev

# Terminal 2: Monitorar logs
tail -f .next/trace
```

### 2. Browser DevTools
- F12 → Network → Verificar cookies após login
- Console → Verificar logs de autenticação
- Application → Storage → Ver cookies/localStorage

### 3. Teste de Autenticação
```bash
# Acessar página de debug
https://your-codespace-url.github.dev/test-auth
```

## 🎯 Checklist de Funcionamento

### Após Deploy no Codespaces:
- [ ] ✅ Aplicação carrega sem erros
- [ ] ✅ Redirecionamento para `/login` funciona
- [ ] ✅ Login com credenciais demo funciona
- [ ] 🔴 **TESTAR:** Redirecionamento após login
- [ ] ✅ Dashboard acessível após autenticação
- [ ] ✅ Logout funciona corretamente

## 🚨 Problemas Esperados e Soluções

### 1. Cookies não sendo definidos
**Solução:** HTTPS do Codespaces deve resolver automaticamente

### 2. CORS/Redirect errors  
**Solução:** Configurar URLs do Codespace no Supabase

### 3. Environment variables
**Solução:** Criar `.env.local` com URLs do Codespace

## 📋 Comando Rápido para Teste
```bash
# Setup completo em um comando
npm install && npm run build && npm start
```

## 🔍 URLs Importantes no Codespaces
- **App:** `https://[workspace]-3000.app.github.dev`
- **Debug Auth:** `https://[workspace]-3000.app.github.dev/test-auth`
- **Login:** `https://[workspace]-3000.app.github.dev/login`

## 💡 Vantagens do Codespaces para Este Projeto

1. **HTTPS nativo** - Resolve problemas de cookies seguros
2. **Ambiente isolado** - Não há conflitos de configuração local
3. **Node.js atualizado** - Versão compatível garantida
4. **Logs limpos** - Sem interferência do sistema local
5. **URL pública** - Pode ser compartilhada para testes

---

**O redirecionamento de autenticação deve funcionar PERFEITAMENTE no Codespaces devido ao ambiente HTTPS controlado.**