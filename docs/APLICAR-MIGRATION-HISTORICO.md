# Instruções para Aplicar Migração de Histórico Automático

## Contexto
Foi criada uma migração SQL que adiciona um trigger automático para registrar mudanças nos atendimentos na tabela `historico`.

## Como aplicar no Supabase

### Opção 1: Via Dashboard do Supabase (Recomendado)

1. Acesse o dashboard do Supabase: https://app.supabase.com
2. Selecione seu projeto
3. No menu lateral, clique em **SQL Editor**
4. Clique em **New query**
5. Cole o conteúdo do arquivo `/infra/supabase/migrations/002_historico_trigger.sql`
6. Clique em **Run** (ou pressione Ctrl/Cmd + Enter)
7. Verifique se a mensagem de sucesso apareceu

### Opção 2: Via CLI do Supabase

```bash
# Certifique-se de estar logado
supabase login

# Link com seu projeto
supabase link --project-ref SEU_PROJECT_REF

# Aplicar a migration
supabase db push
```

## O que essa migration faz

- Cria uma função PL/pgSQL chamada `registrar_historico_atendimento()`
- Cria um trigger que executa automaticamente após UPDATE em `atendimentos`
- Registra mudanças nos campos:
  - `status`
  - `prazo_urgencia`
  - `encaminhamento`
  - `secretaria`
  - `solicitacao` (resumida)

## Verificar se funcionou

Após aplicar a migration, você pode testar:

1. Edite um atendimento existente
2. Mude o status ou urgência
3. Salve
4. Vá para a página de detalhes do atendimento
5. Verifique se o histórico aparece no card lateral

## Troubleshooting

### Erro: function auth.uid() does not exist

Se você receber esse erro, significa que o schema `auth` não está acessível. Você pode:

1. Modificar a função para usar `current_user` ao invés de `auth.uid()`:

```sql
-- Substitua auth.uid()::text por current_user
VALUES (NEW.id, 'status', OLD.status, NEW.status, current_user);
```

2. Ou configurar as permissões do Supabase Auth adequadamente.

### Erro: permission denied for table historico

Certifique-se de que:
1. A tabela `historico` existe
2. As políticas RLS (Row Level Security) permitem INSERT

Você pode temporariamente desabilitar RLS para teste:
```sql
ALTER TABLE historico DISABLE ROW LEVEL SECURITY;
```

## Rollback

Se precisar desfazer a migration:

```sql
DROP TRIGGER IF EXISTS trigger_historico_atendimento ON atendimentos;
DROP FUNCTION IF EXISTS registrar_historico_atendimento();
```

---

**Nota:** Esta migration é segura para aplicar em produção e não afeta dados existentes.
