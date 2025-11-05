# 📋 Instruções para Aplicar Migration 010: Fix de Registros Duplicados

## 🎯 Problema Identificado

**Sintoma**: Cada alteração em atendimentos gera **2 registros idênticos** no histórico.

**Causa Raiz**: Existem **2 triggers diferentes** executando na tabela `atendimentos`:

| Trigger                         | Migração                  | Função                              | Campos Rastreados     |
| ------------------------------- | ------------------------- | ----------------------------------- | --------------------- |
| `trigger_registrar_historico`   | 001_init.sql              | `registrar_historico()`             | **TODOS** (13 campos) |
| `trigger_historico_atendimento` | 002_historico_trigger.sql | `registrar_historico_atendimento()` | **5 importantes**     |

## ✅ Solução: Migration 010

**Arquivo**: `infra/supabase/migrations/010_fix_duplicate_triggers.sql`

## Como Aplicar no Supabase

### 📝 Passo 1: Abrir SQL Editor

1. Acesse: https://app.supabase.com
2. Selecione seu projeto
3. Menu lateral → **SQL Editor**
4. Clique em **New query**

### 📋 Passo 2: Executar Migration 010

Cole o conteúdo de `infra/supabase/migrations/010_fix_duplicate_triggers.sql`:

```sql
-- Migration: Remover triggers duplicados do histórico
DROP TRIGGER IF EXISTS trigger_registrar_historico ON atendimentos;
DROP TRIGGER IF EXISTS trigger_historico_atendimento ON atendimentos;

DROP FUNCTION IF EXISTS registrar_historico() CASCADE;

CREATE OR REPLACE FUNCTION registrar_historico_atendimento()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            INSERT INTO historico (id_atendimento, campo_alterado, valor_anterior, valor_novo, usuario)
            VALUES (NEW.id, 'status', OLD.status, NEW.status, auth.uid());
        END IF;
        -- (restante da função...)
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_historico_atendimento
    AFTER UPDATE ON atendimentos
    FOR EACH ROW
    EXECUTE FUNCTION registrar_historico_atendimento();
```

**OU copie todo o arquivo**: `010_fix_duplicate_triggers.sql`

Clique em **Run** (Ctrl/Cmd + Enter)

### ✅ Passo 3: Verificar Triggers Ativos

```sql
SELECT tgname FROM pg_trigger
WHERE tgrelid = 'atendimentos'::regclass
  AND tgisinternal = false;
```

**Esperado (3 triggers)**:

- ✅ `trigger_historico_atendimento`
- ✅ `trigger_notificar_urgente`
- ✅ `update_atendimentos_modtime`

**NÃO deve aparecer**:

- ❌ `trigger_registrar_historico` ← Se aparecer, a migration falhou

### 🗑️ Passo 4: Limpar Duplicatas Antigas (Opcional)

```sql
DELETE FROM historico a
USING historico b
WHERE a.id > b.id
  AND a.id_atendimento = b.id_atendimento
  AND a.campo_alterado = b.campo_alterado
  AND a.data_hora = b.data_hora;
```

### 🧪 Passo 5: Testar

1. Edite um atendimento (Status: Pendente → Concluído)
2. Consulte o histórico:
   ```sql
   SELECT * FROM historico
   ORDER BY data_hora DESC LIMIT 5;
   ```
3. ✅ **Deve existir apenas 1 registro** por alteração

## 📊 O Que a Migration Faz

### Ações:

1. ❌ Remove `trigger_registrar_historico` (migração 001 - verboso)
2. ❌ Remove `trigger_historico_atendimento` (para recriar limpo)
3. 🗑️ Deleta função `registrar_historico()` antiga
4. ✅ Recria função `registrar_historico_atendimento()` otimizada
5. ✅ Recria trigger único de histórico

### Campos Rastreados (Otimizado):

- **status** - Mudanças de estado
- **prazo_urgencia** - Mudanças de prioridade
- **encaminhamento** - Mudanças de responsável
- **secretaria** - Mudanças de destino
- **solicitacao** - Resumo (50 chars)

## 🐛 Troubleshooting

### ❌ Erro: "new row violates row-level security"

Primeiro aplique a **Migration 009** (RLS policy):

```sql
CREATE POLICY "Permitir inserção de histórico via trigger" ON historico
    FOR INSERT WITH CHECK (true);
```

Arquivo: `009_fix_historico_rls.sql`

### ❌ Erro: "function auth.uid() does not exist"

Seu banco não tem acesso ao schema `auth`. Verifique:

```sql
SELECT auth.uid(); -- Deve retornar o UUID do usuário logado
```

Se falhar, reconfigure permissões do Supabase Auth.

### ❌ Ainda gera duplicatas após migration 010

Execute novamente a verificação de triggers:

```sql
SELECT tgname FROM pg_trigger
WHERE tgrelid = 'atendimentos'::regclass
  AND tgisinternal = false;
```

Se `trigger_registrar_historico` ainda aparecer, remova manualmente:

```sql
DROP TRIGGER trigger_registrar_historico ON atendimentos CASCADE;
```

## 🎉 Resultado Final

✅ Apenas 1 trigger de histórico ativo  
✅ Sem registros duplicados  
✅ Histórico otimizado (apenas campos importantes)  
✅ UUID correto (`auth.uid()` sem `::text`)

## 📚 Migrations Relacionadas

1. **007_fix_historico_uuid.sql** - Corrige tipo UUID
2. **009_fix_historico_rls.sql** - Adiciona RLS policy
3. **010_fix_duplicate_triggers.sql** - Remove duplicatas ← **APLICAR AGORA**
