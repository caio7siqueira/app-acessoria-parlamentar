# 🔧 Correção Rápida - Erro RLS no Histórico

## ❌ Erro Atual

```
Error: Erro ao atualizar atendimento: new row violates row-level security policy for table "historico"
```

## 🎯 Causa

A tabela `historico` tem RLS ativado mas **não tem policy para INSERT**. Quando o trigger `registrar_historico_atendimento()` tenta inserir um registro, a RLS bloqueia.

## ✅ Solução

### Execute esta migration no Supabase SQL Editor:

**Arquivo:** `infra/supabase/migrations/009_fix_historico_rls.sql`

```sql
-- Criar política para permitir que o trigger insira no histórico
CREATE POLICY "Permitir inserção de histórico via trigger" ON historico
    FOR INSERT
    WITH CHECK (true);

-- Garantir que usuários autenticados possam ver o histórico
DROP POLICY IF EXISTS "Usuários autenticados podem ver histórico" ON historico;
CREATE POLICY "Usuários autenticados podem ver histórico" ON historico
    FOR SELECT
    USING (auth.role() = 'authenticated');
```

### Como aplicar:

1. Acesse **Supabase Dashboard** → SQL Editor
2. Copie o conteúdo do arquivo `009_fix_historico_rls.sql`
3. Cole e clique em **Run**
4. Verifique se apareceu "Success"

### Teste:

1. Edite qualquer atendimento
2. Mude Status, Urgência ou qualquer campo
3. Clique em "Salvar alterações"
4. ✅ **Deve salvar sem erro!**

---

## 📝 Explicação Técnica

### Por que `WITH CHECK (true)`?

- O trigger roda com `SECURITY DEFINER` (privilégios do dono da função)
- Ele precisa inserir registros de auditoria independentemente de quem editou
- `WITH CHECK (true)` permite inserção sempre (seguro neste caso porque é trigger interno)

### Alternativa mais restritiva:

Se preferir limitar por usuário autenticado:

```sql
CREATE POLICY "Permitir inserção de histórico via trigger" ON historico
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');
```

Mas isso pode falhar se o trigger rodar em contexto sem usuário autenticado.

---

## ✅ Checklist Pós-Aplicação

- [ ] Migration 009 executada com sucesso
- [ ] Testei editar um atendimento → salvou sem erro
- [ ] Histórico registrou a mudança corretamente
- [ ] Posso ver o histórico na página de detalhes do atendimento

---

**Última atualização:** 05/11/2025  
**Status:** Pronto para aplicar
