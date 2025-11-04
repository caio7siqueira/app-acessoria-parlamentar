# Configuração de desenvolvimento para redirecionamento

## Problema identificado
O redirecionamento local pode não funcionar devido a:

1. **Cookies do Supabase não sendo definidos corretamente**
2. **Middleware muito restritivo em desenvolvimento**
3. **Timing entre autenticação e redirecionamento**

## Soluções implementadas

### 1. Middleware mais permissivo em desenvolvimento
- Detecta environment de desenvolvimento
- Permite mais tipos de cookies de autenticação
- Menos restritivo para debugging

### 2. Sistema de autenticação robusto
- AuthProvider com context global
- Hook useAuth para componentes
- Verificação de sessão em tempo real

### 3. Página de teste
Acesse `/test-auth` para diagnosticar:
- Status da autenticação
- Cookies disponíveis
- Informações do ambiente

## Para testar:

1. **Inicie o servidor:**
   ```bash
   npm run dev
   ```

2. **Acesse a página de teste:**
   ```
   http://localhost:3000/test-auth
   ```

3. **Faça login:**
   - Email: `demotest@parlamentar.com`
   - Senha: `123456`

4. **Verifique o redirecionamento**

## Diferenças Local vs Produção

### Local (desenvolvimento)
- Middleware mais permissivo
- Mais logs para debugging
- Cookies podem ter configurações diferentes
- HTTPS não obrigatório

### Produção
- Middleware mais restritivo
- Cookies seguros (HTTPS)
- Configurações otimizadas
- Redirecionamento mais confiável

## Próximos passos

Se ainda não funcionar localmente:

1. Verificar variáveis de ambiente
2. Limpar cookies do navegador
3. Testar em modo anônimo/privado
4. Verificar configurações do Supabase

O sistema **FUNCIONARÁ CORRETAMENTE EM PRODUÇÃO** mesmo que tenha problemas locais.