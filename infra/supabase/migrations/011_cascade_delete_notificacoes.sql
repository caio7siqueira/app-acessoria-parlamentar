-- Migration: Adicionar CASCADE DELETE para notificacoes
-- Problema: Ao excluir atendimento, erro "violates foreign key constraint notificacoes_atendimento_id_fkey"
-- Solução: Alterar constraint para ON DELETE CASCADE (notificações deletadas automaticamente)

-- 1. Remover constraint antiga
ALTER TABLE notificacoes 
DROP CONSTRAINT IF EXISTS notificacoes_atendimento_id_fkey;

-- 2. Adicionar constraint com CASCADE DELETE
ALTER TABLE notificacoes 
ADD CONSTRAINT notificacoes_atendimento_id_fkey 
    FOREIGN KEY (atendimento_id) 
    REFERENCES atendimentos(id) 
    ON DELETE CASCADE;

-- 3. Verificação: listar constraints de notificacoes
-- SELECT conname, confdeltype 
-- FROM pg_constraint 
-- WHERE conrelid = 'notificacoes'::regclass 
--   AND contype = 'f';
-- Resultado esperado: confdeltype = 'c' (CASCADE)

COMMENT ON CONSTRAINT notificacoes_atendimento_id_fkey ON notificacoes IS 
'Foreign key para atendimentos com CASCADE DELETE - notificações são deletadas quando atendimento é excluído';
