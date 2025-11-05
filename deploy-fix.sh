#!/bin/bash
# Script para fazer deploy com as correções de URL

echo "🚀 Fazendo deploy das correções de URL..."

# 1. Adicionar arquivos ao git
git add .

# 2. Commit das alterações
git commit -m "fix: Corrigir URL de redirect para produção

- Atualizar environment.ts para detectar automaticamente produção
- Adicionar NEXTAUTH_URL_PRODUCTION no .env.local
- Corrigir redirecionamento de email de validação"

# 3. Push para o repositório
git push origin main

echo "✅ Deploy enviado!"
echo "🔗 Verifique: https://vercel.com/dashboard"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "1. Aguardar deploy do Vercel (2-3 minutos)"
echo "2. Atualizar URL no Supabase Dashboard:"
echo "   - Site URL: https://app-acessoria-parlamentar-4pb1l93dj-caios-projects-f19addf6.vercel.app"
echo "   - Redirect URLs: https://app-acessoria-parlamentar-4pb1l93dj-caios-projects-f19addf6.vercel.app/auth/callback"
echo "3. Testar novamente o email de validação"