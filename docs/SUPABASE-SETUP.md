# Configuração do Supabase

Este guia mostra como configurar o Supabase para o Sistema de Assessoria Parlamentar.

## 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Escolha uma organização
5. Preencha os dados:
   - **Project name**: `assessoria-parlamentar`
   - **Database password**: Senha forte (anote ela!)
   - **Region**: Escolha a mais próxima (ex: South America)
6. Clique em "Create new project"

## 2. Executar Migrations

### Opção A: Via Interface Web

1. No painel do Supabase, vá para "SQL Editor"
2. Cole o conteúdo do arquivo `infra/supabase/migrations/001_init.sql`
3. Clique em "Run" para executar

### Opção B: Via CLI (Recomendado)

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login no Supabase
supabase login

# Linkar o projeto local com o remoto
supabase link --project-ref SEU_PROJECT_ID

# Executar migrations
supabase db push
```

## 3. Inserir Dados de Exemplo

1. No SQL Editor, cole o conteúdo do arquivo `infra/supabase/seeds/demo_data.sql`
2. Execute o script para inserir dados de exemplo

## 4. Configurar Autenticação

### Habilitar Providers

1. Vá para "Authentication" → "Providers"
2. Habilite "Email" (já deve estar habilitado)
3. Configure as opções:
   - **Enable email confirmations**: Desabilitado (para desenvolvimento)
   - **Enable email change confirmations**: Desabilitado
   - **Enable phone confirmations**: Desabilitado

### Configurar URLs

1. Vá para "Authentication" → "URL Configuration"
2. Configure as URLs:
   - **Site URL**: `http://localhost:3000` (desenvolvimento) / `https://seu-app.vercel.app` (produção)
   - **Redirect URLs**: Adicione as mesmas URLs

## 5. Configurar RLS (Row Level Security)

As políticas RLS já estão configuradas nas migrations, mas verifique se estão ativas:

1. Vá para "Authentication" → "Policies"
2. Verifique se as políticas estão listadas e habilitadas para todas as tabelas

## 6. Obter Chaves da API

1. Vá para "Settings" → "API"
2. Copie as informações:
   - **Project URL**: `https://SEU_PROJECT_ID.supabase.co`
   - **Project API keys**:
     - `anon public` (chave pública)
     - `service_role` (chave privada - **NÃO EXPOR NO FRONTEND!**)

## 7. Configurar Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```env
# Supabase - Informações do seu projeto
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_publica_anon
SUPABASE_SERVICE_ROLE_KEY=sua_chave_privada_service_role

# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=uma_string_aleatoria_secreta

# Opcional: Web Push (configurar depois)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
```

## 8. Testar Conexão

Execute o projeto e teste se a conexão está funcionando:

```bash
npm run dev
```

1. Acesse `http://localhost:3000`
2. O dashboard deve carregar as estatísticas (mesmo que zeradas inicialmente)
3. Teste criar um usuário (se implementado) ou inserir dados via SQL

## 9. Configurações Avançadas (Opcional)

### Realtime

1. Vá para "Settings" → "API"
2. Em "Realtime", habilite as tabelas que precisam de atualizações em tempo real:
   - `atendimentos`
   - `historico`

### Webhooks (Futuro)

Para notificações automáticas, configure webhooks:
1. Vá para "Database" → "Webhooks"
2. Configure para disparar em eventos específicos

### Backup Automático

1. Vá para "Settings" → "General"
2. Configure backups automáticos diários

## 10. Monitoramento

### Logs

1. Vá para "Logs" para monitorar:
   - Queries de API
   - Autenticação
   - Realtime
   - Postgres

### Usage

1. Vá para "Settings" → "Usage" para monitorar:
   - Requisições de API
   - Autenticações
   - Storage
   - Bandwidth

## 🔒 Segurança

### Políticas RLS Importantes

Verifique se estas políticas estão ativas:

1. **usuarios**: Apenas o próprio usuário pode ver/editar seus dados
2. **atendimentos**: Apenas usuários autenticados podem acessar
3. **historico**: Apenas leitura para usuários autenticados
4. **contatos**: CRUD completo para usuários autenticados

### Limites de Rate

Configure limites para evitar abuso:

1. Vá para "Settings" → "API"
2. Configure rate limiting se necessário

## 🚀 Deploy em Produção

Quando fazer deploy em produção:

1. **Criar novo projeto** para produção (recomendado)
2. **Executar migrations** no projeto de produção
3. **Atualizar URLs** de autenticação para o domínio de produção
4. **Configurar variáveis de ambiente** na Vercel/Netlify
5. **Testar thoroughly** antes de disponibilizar

## 📱 Configuração Mobile/PWA

Para funcionalidades PWA:

1. **Deep Links**: Configure redirect URLs para o app
2. **Push Notifications**: Configure VAPID keys
3. **Offline Mode**: Testar sincronização quando voltar online

## 🔧 Troubleshooting

### Problemas Comuns

**Erro de CORS:**
- Verifique se a URL está configurada corretamente em "Authentication" → "URL Configuration"

**RLS bloqueando consultas:**
- Verifique se o usuário está autenticado
- Confirme se as políticas RLS estão corretas

**Dados não aparecem:**
- Verifique se executou as migrations
- Confirme se inseriu dados de exemplo
- Teste as consultas no SQL Editor

**Autenticação não funciona:**
- Verifique as chaves da API
- Confirme se as variáveis de ambiente estão corretas
- Teste com um usuário novo

### Debug

Para debugar problemas:

1. **Console do navegador**: Erros de JavaScript
2. **Network tab**: Requisições HTTP
3. **Supabase Logs**: Erros do servidor
4. **Postgres Logs**: Queries e erros de banco

---

**Próximo passo**: [Configurar Deploy na Vercel](./DEPLOY.md)