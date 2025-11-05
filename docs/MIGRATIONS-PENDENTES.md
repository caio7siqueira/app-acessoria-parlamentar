# Migrations Pendentes - Checklist de Aplicação

## ⚠️ IMPORTANTE

As seguintes migrations foram criadas mas **NÃO foram aplicadas** no banco de dados Supabase ainda. Execute-as na ordem indicada.

---

## 1️⃣ Migration 007: Corrigir Erro UUID no Histórico

**Arquivo:** `infra/supabase/migrations/007_fix_historico_uuid.sql`

### Problema que resolve

- Erro: `column "usuario" is of type uuid but expression is of type text`
- Ocorria ao editar atendimentos porque o trigger `registrar_historico_atendimento()` estava usando `auth.uid()::text` em vez de `auth.uid()` (UUID)

### Como aplicar

1. Acesse o **Supabase Dashboard** → seu projeto
2. Vá em **SQL Editor**
3. Copie e cole o conteúdo de `infra/supabase/migrations/007_fix_historico_uuid.sql`
4. Clique em **Run** (ou Ctrl+Enter)
5. Verifique se apareceu "Success"

### Como validar

- Edite qualquer atendimento (mude Status, Urgência, etc.)
- Clique em "Salvar alterações"
- **✅ Deve salvar sem erro de UUID**
- O histórico deve registrar a mudança corretamente

---

## 2️⃣ Migration 008: Adicionar Coluna Secretaria aos Contatos

**Arquivo:** `infra/supabase/migrations/008_add_secretaria_to_contatos.sql`

### Problema que resolve

- Erro 400: `column contatos.secretaria does not exist`
- A tabela `contatos` foi recriada na migration 005 mas perdeu a coluna `secretaria`
- Contatos precisam ser organizados por secretaria (requisito de negócio)

### Como aplicar

1. Acesse o **Supabase Dashboard** → seu projeto
2. Vá em **SQL Editor**
3. Copie e cole o conteúdo de `infra/supabase/migrations/008_add_secretaria_to_contatos.sql`
4. Clique em **Run** (ou Ctrl+Enter)
5. Verifique se apareceu "Success"

### Como validar

- Acesse a página de **Contatos**
- Use o filtro "Filtrar por secretaria" (não deve mais dar erro 400)
- Crie ou edite um contato e selecione uma secretaria
- **✅ Deve salvar com a secretaria associada**
- Filtre por secretaria e veja que retorna os contatos corretos

---

## 📋 Ordem de Execução Recomendada

```sql
-- 1. Primeiro, corrigir o trigger do histórico
-- Execute o conteúdo de: 007_fix_historico_uuid.sql

-- 2. Depois, adicionar coluna secretaria
-- Execute o conteúdo de: 008_add_secretaria_to_contatos.sql
```

---

## ✅ Checklist Pós-Aplicação

- [ ] Migration 007 aplicada com sucesso
  - [ ] Testei editar um atendimento → salvou sem erro UUID
  - [ ] Histórico registrou a mudança corretamente
- [ ] Migration 008 aplicada com sucesso
  - [ ] Filtro por secretaria funciona sem erro 400
  - [ ] Criei/editei contato com secretaria → salvou corretamente
  - [ ] Filtro retorna contatos da secretaria selecionada

---

## 🔧 Troubleshooting

### Erro: "function registrar_historico_atendimento already exists"

**Solução:** É normal, a migration usa `CREATE OR REPLACE FUNCTION`. Apenas continue.

### Erro: "column secretaria already exists"

**Solução:** A coluna já foi adicionada. Pode ignorar ou ajustar a migration para usar `ADD COLUMN IF NOT EXISTS`.

### Ainda vejo erro de UUID após aplicar 007

**Possíveis causas:**

1. A migration não foi executada corretamente (verifique no SQL Editor)
2. Cache do navegador (force refresh: Ctrl+Shift+R)
3. O servidor Next.js precisa ser reiniciado (`npm run dev`)

### Ainda vejo erro 400 em contatos após aplicar 008

**Possíveis causas:**

1. A migration não foi executada (verifique a estrutura da tabela no Table Editor)
2. Cache de queries do React Query (force refresh ou limpe localStorage)
3. Verifique se o índice foi criado: `SELECT * FROM pg_indexes WHERE tablename = 'contatos';`

---

## 📞 Suporte

Se encontrar problemas ao aplicar as migrations:

1. Verifique os logs no Supabase Dashboard → Logs
2. Confirme que você tem permissões de admin no projeto
3. Teste as queries manualmente no SQL Editor antes de aplicar

---

**Última atualização:** 05/11/2025
**Status:** Pendente de aplicação
