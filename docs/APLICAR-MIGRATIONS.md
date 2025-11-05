# Como Aplicar as Migrations no Supabase

Este documento explica como aplicar as migrations criadas no projeto.

## Pré-requisitos

- Acesso ao dashboard do Supabase
- Projeto Supabase configurado

## Migrations a Aplicar (em ordem)

### 1. **004_add_address_fields.sql**

Adiciona campos de CEP e endereço detalhado na tabela `atendimentos`.

**Como aplicar:**

1. Acesse https://supabase.com/dashboard
2. Vá em seu projeto
3. No menu lateral, clique em **SQL Editor**
4. Clique em **New Query**
5. Cole o conteúdo do arquivo `infra/supabase/migrations/004_add_address_fields.sql`
6. Clique em **Run** ou pressione `Ctrl+Enter`

### 2. **005_create_contatos_table.sql**

Cria a tabela `contatos` com RLS policies para agenda pessoal de contatos.

**Como aplicar:**

1. No **SQL Editor** do Supabase
2. **New Query**
3. Cole o conteúdo de `infra/supabase/migrations/005_create_contatos_table.sql`
4. **Run**

**Importante:** Esta migration usa `DROP TABLE IF EXISTS`, então é seguro executar múltiplas vezes.

### 3. **006_sync_auth_users.sql** ⚠️ CRÍTICO

Cria trigger para sincronizar automaticamente usuários do `auth.users` para a tabela `usuarios`.

**Como aplicar:**

1. No **SQL Editor** do Supabase
2. **New Query**
3. Cole o conteúdo de `infra/supabase/migrations/006_sync_auth_users.sql`
4. **Run**

**O que faz:**

- Cria função `sync_user_to_usuarios()`
- Cria trigger `on_auth_user_created` que executa após cada novo usuário autenticado
- Sincroniza usuários existentes em `auth.users` que não estão em `usuarios`
- **Resolve o erro:** `violates foreign key constraint "atendimentos_usuario_criacao_fkey"`

## Verificação

Após aplicar todas as migrations, execute para verificar:

```sql
-- Verificar estrutura da tabela atendimentos
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'atendimentos'
  AND column_name IN ('cep', 'rua', 'numero', 'bairro', 'cidade', 'uf');

-- Verificar se tabela contatos existe
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_name = 'contatos'
);

-- Verificar se trigger de sync existe
SELECT tgname
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- Verificar usuários sincronizados
SELECT u.email, usr.nome, usr.ativo
FROM auth.users u
LEFT JOIN usuarios usr ON u.id = usr.id;
```

## Solução Rápida para o Erro Atual

Se você já está logado e não consegue criar atendimentos, execute esta query no SQL Editor:

```sql
-- Inserir manualmente seu usuário na tabela usuarios
INSERT INTO usuarios (id, email, nome, ativo)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'name', SPLIT_PART(email, '@', 1)) as nome,
  true
FROM auth.users
WHERE email = 'SEU_EMAIL_AQUI@exemplo.com' -- Substitua pelo seu email
ON CONFLICT (email) DO UPDATE
SET id = EXCLUDED.id;
```

## Rollback (se necessário)

Para reverter as migrations:

```sql
-- Reverter 006
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS sync_user_to_usuarios();

-- Reverter 005
DROP TABLE IF EXISTS contatos CASCADE;

-- Reverter 004
ALTER TABLE atendimentos
  DROP COLUMN IF EXISTS cep,
  DROP COLUMN IF EXISTS rua,
  DROP COLUMN IF EXISTS numero,
  DROP COLUMN IF EXISTS complemento,
  DROP COLUMN IF EXISTS bairro,
  DROP COLUMN IF EXISTS cidade,
  DROP COLUMN IF EXISTS uf;
```

## Ordem de Execução Recomendada

1. ✅ **006_sync_auth_users.sql** (PRIMEIRO - resolve o erro atual)
2. ✅ **004_add_address_fields.sql**
3. ✅ **005_create_contatos_table.sql**

## Troubleshooting

### Erro: "relation usuarios does not exist"

A tabela `usuarios` deve ter sido criada pela migration `001_init.sql`. Verifique se ela existe:

```sql
SELECT * FROM usuarios LIMIT 1;
```

### Erro: "permission denied"

Execute as migrations com um usuário que tenha privilégios de administrador no Supabase (geralmente o owner do projeto).

### Erro: "violates foreign key constraint"

Significa que você precisa executar a migration **006_sync_auth_users.sql** primeiro.
