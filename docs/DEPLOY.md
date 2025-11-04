# Deploy na Vercel

Este guia mostra como fazer deploy do Sistema de Assessoria Parlamentar na Vercel.

## 🚀 Deploy Automático (Recomendado)

### 1. Preparar Repositório

Certifique-se que o código está no GitHub:

```bash
git add .
git commit -m "feat: sistema completo implementado"
git push origin main
```

### 2. Conectar na Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub
3. Clique em "New Project"
4. Importe o repositório `app-acessoria-parlamentar`
5. Configure o projeto:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (raiz)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 3. Configurar Variáveis de Ambiente

Na tela de configuração do projeto, adicione as variáveis:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://SEU_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_publica
SUPABASE_SERVICE_ROLE_KEY=sua_chave_privada

# Next.js
NEXTAUTH_URL=https://seu-app.vercel.app
NEXTAUTH_SECRET=string_aleatoria_super_secreta

# Web Push (opcional)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=sua_chave_vapid_publica
VAPID_PRIVATE_KEY=sua_chave_vapid_privada
```

### 4. Deploy

1. Clique em "Deploy"
2. Aguarde o build terminar (2-5 minutos)
3. Acesse a URL gerada (ex: `https://app-acessoria-parlamentar.vercel.app`)

## 🔧 Deploy Manual (CLI)

### 1. Instalar Vercel CLI

```bash
npm install -g vercel
```

### 2. Login na Vercel

```bash
vercel login
```

### 3. Deploy

```bash
# Na raiz do projeto
vercel

# Para produção
vercel --prod
```

## ⚙️ Configurações Avançadas

### 1. Domínio Customizado

1. No dashboard da Vercel, vá para o projeto
2. Clique em "Settings" → "Domains"
3. Adicione seu domínio personalizado
4. Configure DNS conforme instruções

### 2. Configurar CRON Jobs

Para notificações automáticas, configure Vercel Cron:

1. Crie `vercel.json` na raiz:

```json
{
  "crons": [
    {
      "path": "/api/notifications/check",
      "schedule": "0 9 * * *"
    }
  ]
}
```

2. Crie a API route `src/app/api/notifications/check/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/services/supabaseClient';

export async function GET() {
  try {
    // Verificar atendimentos urgentes
    const { data: urgentes } = await supabaseAdmin
      .from('atendimentos')
      .select('*')
      .eq('prazo_urgencia', 'Urgente')
      .neq('status', 'Concluído');

    // Verificar prazos vencendo em 3 dias
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() + 3);
    
    const { data: prazoVencendo } = await supabaseAdmin
      .from('atendimentos')
      .select('*')
      .lte('prazo_data', dataLimite.toISOString().split('T')[0])
      .neq('status', 'Concluído');

    // Enviar notificações (implementar Web Push aqui)
    
    return NextResponse.json({
      urgentes: urgentes?.length || 0,
      prazoVencendo: prazoVencendo?.length || 0,
      executadoEm: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao verificar notificações:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
```

### 3. Monitoramento

Configure alertas na Vercel:

1. Vá para "Settings" → "Functions"
2. Configure timeout (max 10s no plano gratuito)
3. Monitore logs em "Functions" → "View Function Logs"

### 4. Performance

Otimizações automáticas da Vercel:

- **Edge Network**: CDN global automático
- **Image Optimization**: Compressão automática
- **Static Generation**: Páginas estáticas quando possível
- **Serverless Functions**: APIs escaláveis

## 🔒 Configurações de Segurança

### 1. Headers de Segurança

Adicione no `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
```

### 2. Variáveis Sensíveis

**✅ Seguras (podem estar no .env.local):**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`

**❌ Privadas (apenas no servidor):**
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXTAUTH_SECRET`
- `VAPID_PRIVATE_KEY`

### 3. Rate Limiting

Para evitar abuso, configure rate limiting nas API routes:

```typescript
// Exemplo: src/app/api/atendimentos/route.ts
import { NextRequest } from 'next/server';

const rateLimiter = new Map();

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minuto
  const maxRequests = 10;

  const requests = rateLimiter.get(ip) || { count: 0, resetTime: now + windowMs };

  if (now > requests.resetTime) {
    requests.count = 1;
    requests.resetTime = now + windowMs;
  } else {
    requests.count++;
  }

  rateLimiter.set(ip, requests);

  if (requests.count > maxRequests) {
    return new Response('Rate limit exceeded', { status: 429 });
  }

  // Continuar com a lógica da API...
}
```

## 📱 Configuração PWA em Produção

### 1. HTTPS Obrigatório

- Vercel fornece HTTPS automático
- PWA só funciona com HTTPS em produção
- Service Worker precisa de HTTPS

### 2. Configurar URLs no Supabase

Atualize as URLs no projeto Supabase para produção:

1. Vá para "Authentication" → "URL Configuration"
2. Atualize:
   - **Site URL**: `https://seu-app.vercel.app`
   - **Redirect URLs**: Adicione a URL de produção

### 3. Testar Instalação

Teste a instalação do PWA:

1. **Chrome Desktop**: Banner de instalação deve aparecer
2. **Chrome Mobile**: Menu → "Adicionar à tela inicial"
3. **Safari iOS**: Botão de compartilhar → "Adicionar à tela de início"

## 🚀 CI/CD Automático

### 1. Deploy Automático

A Vercel faz deploy automático quando:
- Fazer push na branch `main` (produção)
- Fazer push em outras branches (preview)
- Abrir Pull Request (preview)

### 2. Configurar Branches

No dashboard da Vercel:

1. Vá para "Settings" → "Git"
2. Configure:
   - **Production Branch**: `main`
   - **Preview Branches**: Todas as outras

### 3. Environments

Configure diferentes ambientes:

- **Development**: Variáveis locais
- **Preview**: Banco de teste/desenvolvimento
- **Production**: Banco e configurações de produção

## 📊 Monitoramento em Produção

### 1. Analytics da Vercel

Habilite analytics:

1. Vá para "Analytics" no dashboard
2. Monitore:
   - Pageviews
   - Core Web Vitals
   - Real User Monitoring

### 2. Logs e Debugging

Monitore logs:

1. **Function Logs**: Erros das API routes
2. **Build Logs**: Erros de compilação
3. **Edge Logs**: Requests no edge

### 3. Performance

Monitore performance:
- **First Contentful Paint (FCP)**
- **Largest Contentful Paint (LCP)**
- **Cumulative Layout Shift (CLS)**
- **First Input Delay (FID)**

## 🔧 Troubleshooting

### Problemas Comuns

**Build falha:**
```bash
# Teste local
npm run build

# Verifique erros de TypeScript
npm run type-check
```

**Variáveis de ambiente não funcionam:**
- Verifique se começam com `NEXT_PUBLIC_` para uso no frontend
- Redeploy após adicionar novas variáveis

**PWA não instala:**
- Verifique HTTPS
- Confirme se `manifest.json` está acessível
- Teste em diferentes browsers

**API routes com erro 500:**
- Verifique logs na Vercel
- Teste endpoints localmente
- Confirme variáveis de ambiente

### Debug

Para debugar em produção:

1. **Console do browser**: Erros de cliente
2. **Vercel Function Logs**: Erros de servidor
3. **Supabase Logs**: Queries e autenticação
4. **Network tab**: Requests/responses

## 📈 Otimização Pós-Deploy

### 1. Performance

- **Lazy loading**: Componentes pesados
- **Image optimization**: Use `next/image`
- **Font optimization**: Use `next/font`
- **Bundle analysis**: `npm run build` e verificar tamanhos

### 2. SEO

- **Metadata**: Configure em cada página
- **Sitemap**: Gere automaticamente
- **Robots.txt**: Configure crawling

### 3. Backup

- **Database**: Backups automáticos no Supabase
- **Code**: Repositório Git
- **Environment Variables**: Documente em local seguro

---

**Próximo passo**: Sistema está pronto para uso! 🎉

**Dicas finais:**
- Monitore logs regularmente
- Teste funcionalidades críticas após deploy
- Configure alertas para erros
- Documente mudanças importantes