-- Migration: Adicionar campos de CEP e endereço detalhado
-- Sistema de Assessoria Parlamentar

-- Adicionar campos de endereço na tabela atendimentos
ALTER TABLE atendimentos 
  ADD COLUMN IF NOT EXISTS cep VARCHAR(9),
  ADD COLUMN IF NOT EXISTS rua TEXT,
  ADD COLUMN IF NOT EXISTS numero VARCHAR(10),
  ADD COLUMN IF NOT EXISTS complemento TEXT,
  ADD COLUMN IF NOT EXISTS bairro VARCHAR(100),
  ADD COLUMN IF NOT EXISTS cidade VARCHAR(100),
  ADD COLUMN IF NOT EXISTS uf CHAR(2);

-- Índice para busca por CEP
CREATE INDEX IF NOT EXISTS idx_atendimentos_cep ON atendimentos(cep);

-- Índice para busca por cidade
CREATE INDEX IF NOT EXISTS idx_atendimentos_cidade ON atendimentos(cidade);

-- Comentários das colunas
COMMENT ON COLUMN atendimentos.cep IS 'CEP no formato #####-###';
COMMENT ON COLUMN atendimentos.rua IS 'Logradouro/Rua do endereço';
COMMENT ON COLUMN atendimentos.numero IS 'Número do endereço';
COMMENT ON COLUMN atendimentos.complemento IS 'Complemento do endereço';
COMMENT ON COLUMN atendimentos.bairro IS 'Bairro';
COMMENT ON COLUMN atendimentos.cidade IS 'Cidade/Município';
COMMENT ON COLUMN atendimentos.uf IS 'Unidade Federativa (Estado)';
