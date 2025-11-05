-- Migration: Adicionar coluna 'secretaria' à tabela contatos
-- Justificativa: contatos são organizados por secretaria na aplicação

ALTER TABLE contatos
  ADD COLUMN IF NOT EXISTS secretaria TEXT;

-- Índice para busca/ordenção por secretaria
CREATE INDEX IF NOT EXISTS idx_contatos_secretaria ON contatos(secretaria);

-- Comentário
COMMENT ON COLUMN contatos.secretaria IS 'Secretaria à qual o contato está associado';
