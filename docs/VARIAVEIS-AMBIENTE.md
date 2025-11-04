# Variáveis de ambiente sensíveis e instruções

Algumas rotas server-side (API) exigem a chave _service role_ do Supabase para realizar operações administrativas, como convidar usuários ou listar usuários. Essa chave deve permanecer apenas no servidor.

Variáveis necessárias (exemplo em `.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_public_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Avisos importantes:
- Nunca exponha `SUPABASE_SERVICE_ROLE_KEY` no cliente (browser) ou em repositórios públicos.
- Armazene-a somente em variáveis de ambiente do servidor ou secret manager do provider.
- Reinicie o servidor após adicionar as variáveis.

Resumo dos endpoints que usam a service role nesta release:
- `POST /api/invite-user` — envia convite e cria registro na tabela `usuarios`.
- `GET /api/list-users` — lista usuários usando credenciais administrativas.
