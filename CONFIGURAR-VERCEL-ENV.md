# 🔧 CONFIGURAÇÃO DE VARIÁVEIS NO VERCEL

## ⚠️ PROBLEMA IDENTIFICADO:
O email de convite está redirecionando para localhost porque a variável `NEXT_PUBLIC_APP_URL` não está configurada no Vercel.

## 🚀 SOLUÇÃO IMEDIATA:

### Via Vercel Dashboard:
1. Acesse: https://vercel.com/dashboard
2. Vá para: Seu projeto > Settings > Environment Variables
3. Adicione a variável:

```
Name: NEXT_PUBLIC_APP_URL
Value: https://app-acessoria-parlamentar-4pb1l93dj-caios-projects-f19addf6.vercel.app
Environment: Production, Preview, Development
```

### Via Vercel CLI (alternativa):
```bash
vercel env add NEXT_PUBLIC_APP_URL production
# Quando solicitado, digite: https://app-acessoria-parlamentar-4pb1l93dj-caios-projects-f19addf6.vercel.app

vercel env add NEXT_PUBLIC_APP_URL preview  
# Digite a mesma URL

vercel env add NEXT_PUBLIC_APP_URL development
# Digite: http://localhost:3000
```

## 🔄 APÓS CONFIGURAR:

1. **Redeploy**: O Vercel fará automaticamente após configurar a variável
2. **Teste**: Envie um novo convite
3. **Verifique**: O email agora deve redirecionar para:
   ```
   https://ivoxmhxcssydnfgormwn.supabase.co/auth/v1/verify?token=...&type=invite&redirect_to=https://app-acessoria-parlamentar-4pb1l93dj-caios-projects-f19addf6.vercel.app/auth/callback?type=invite
   ```

## ✅ RESULTADO ESPERADO:

- ✅ Email aponta para URL de produção
- ✅ Callback funciona corretamente  
- ✅ Usuário é direcionado para `/definir-senha`
- ✅ Fluxo completo de convite funcionando