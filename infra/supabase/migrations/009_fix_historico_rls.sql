-- Migration: Adicionar política RLS para permitir inserção no histórico
-- Problema: "new row violates row-level security policy for table historico"
-- O trigger registrar_historico_atendimento() precisa de permissão para inserir

-- Criar política para permitir que o trigger insira no histórico
CREATE POLICY "Permitir inserção de histórico via trigger" ON historico
    FOR INSERT
    WITH CHECK (true);

-- Garantir que usuários autenticados possam ver o histórico (já existe, mas garantindo)
DROP POLICY IF EXISTS "Usuários autenticados podem ver histórico" ON historico;
CREATE POLICY "Usuários autenticados podem ver histórico" ON historico
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- Comentário
COMMENT ON POLICY "Permitir inserção de histórico via trigger" ON historico IS 
'Permite que triggers e funções SECURITY DEFINER insiram registros de histórico';
