# 🔧 Fix: Registros Duplicados no Histórico

## ❌ Problema

Ao editar um atendimento, o histórico gera **registros duplicados**:

```json
[
  {
    "id": 3,
    "campo_alterado": "prazo_urgencia",
    "valor_anterior": "Baixa",
    "valor_novo": "Urgente"
  },
  {
    "id": 4,
    "campo_alterado": "prazo_urgencia",
    "valor_anterior": "Baixa",
    "valor_novo": "Urgente"
  }
]
```

## 🔍 Causa Raiz

Existem **2 triggers diferentes** registrando histórico na tabela `atendimentos`:

1. **`trigger_registrar_historico`** (migração 001)

   - Função: `registrar_historico()`
   - Rastreia: **TODOS** os campos (nome, genero, endereco, idade, telefone, etc.)
   - Problema: Muito verboso, gera histórico desnecessário

2. **`trigger_historico_atendimento`** (migração 002)
   - Função: `registrar_historico_atendimento()`
   - Rastreia: Apenas campos importantes (status, prazo_urgencia, encaminhamento, secretaria, solicitacao)
   - Otimizado: Melhor performance e histórico mais limpo

**Resultado**: Cada UPDATE executa **ambas as funções**, gerando **2 registros idênticos** para os mesmos campos.

## ✅ Solução

### 1️⃣ Aplicar Migration 010

Execute no **Supabase SQL Editor**:

```sql
-- Migration 010: Remover triggers duplicados
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
        -- ... outros campos
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_historico_atendimento
    AFTER UPDATE ON atendimentos
    FOR EACH ROW
    EXECUTE FUNCTION registrar_historico_atendimento();
```

**Arquivo completo:** `infra/supabase/migrations/010_fix_duplicate_triggers.sql`

### 2️⃣ Verificar Triggers

Após aplicar, confirme que existem **3 triggers** (e NÃO 4):

```sql
SELECT tgname, tgenabled
FROM pg_trigger
WHERE tgrelid = 'atendimentos'::regclass
  AND tgisinternal = false;
```

**Resultado esperado:**

```
tgname                         | tgenabled
-------------------------------|----------
trigger_historico_atendimento  | O
trigger_notificar_urgente      | O
update_atendimentos_modtime    | O
```

✅ **NÃO deve aparecer** `trigger_registrar_historico`

### 3️⃣ Limpar Duplicatas Antigas (Opcional)

Remover registros duplicados existentes:

```sql
DELETE FROM historico a
USING historico b
WHERE a.id > b.id
  AND a.id_atendimento = b.id_atendimento
  AND a.campo_alterado = b.campo_alterado
  AND a.valor_anterior = b.valor_anterior
  AND a.valor_novo = b.valor_novo
  AND a.data_hora = b.data_hora;
```

### 4️⃣ Testar

1. Edite um atendimento (mude Status ou Urgência)
2. Consulte o histórico:
   ```sql
   SELECT * FROM historico ORDER BY data_hora DESC LIMIT 5;
   ```
3. ✅ Deve existir **apenas 1 registro** por alteração

## 📊 Resultado

- ✅ Apenas 1 trigger na tabela `atendimentos`
- ✅ Histórico sem duplicatas
- ✅ Tipo UUID correto (`auth.uid()` sem `::text`)

## 🚀 Próximos Passos

Após aplicar a migração 010, o sistema estará **100% funcional** sem duplicações.
