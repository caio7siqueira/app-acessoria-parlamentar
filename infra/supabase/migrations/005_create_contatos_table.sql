-- Migration: Criar tabela de contatos pessoais
-- Sistema de Assessoria Parlamentar

-- Dropar políticas e tabela se existirem (para re-executar migration)
DROP POLICY IF EXISTS "Usuários podem ver seus próprios contatos" ON contatos;
DROP POLICY IF EXISTS "Usuários podem criar contatos" ON contatos;
DROP POLICY IF EXISTS "Usuários podem atualizar seus contatos" ON contatos;
DROP POLICY IF EXISTS "Usuários podem deletar seus contatos" ON contatos;
DROP TRIGGER IF EXISTS trigger_update_contatos_updated_at ON contatos;
DROP FUNCTION IF EXISTS update_contatos_updated_at();
DROP TABLE IF EXISTS contatos;

-- Criar tabela contatos
CREATE TABLE contatos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  nome TEXT NOT NULL,
  telefone VARCHAR(20),
  email VARCHAR(255),
  cep VARCHAR(9),
  rua TEXT,
  numero VARCHAR(10),
  complemento TEXT,
  bairro VARCHAR(100),
  cidade VARCHAR(100),
  uf CHAR(2),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Índices para performance
CREATE INDEX idx_contatos_user_id ON contatos(user_id);
CREATE INDEX idx_contatos_nome ON contatos(nome);
CREATE INDEX idx_contatos_telefone ON contatos(telefone);
CREATE INDEX idx_contatos_cidade ON contatos(cidade);

-- Habilitar RLS
ALTER TABLE contatos ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver apenas seus próprios contatos
CREATE POLICY "Usuários podem ver seus próprios contatos" 
  ON contatos FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy: Usuários podem criar seus próprios contatos (user_id será auth.uid())
CREATE POLICY "Usuários podem criar contatos" 
  ON contatos FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Usuários podem atualizar seus próprios contatos
CREATE POLICY "Usuários podem atualizar seus contatos" 
  ON contatos FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Usuários podem deletar seus próprios contatos
CREATE POLICY "Usuários podem deletar seus contatos" 
  ON contatos FOR DELETE 
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_contatos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_contatos_updated_at
  BEFORE UPDATE ON contatos
  FOR EACH ROW
  EXECUTE FUNCTION update_contatos_updated_at();

-- Comentários
COMMENT ON TABLE contatos IS 'Agenda pessoal de contatos dos usuários';
COMMENT ON COLUMN contatos.nome IS 'Nome completo do contato';
COMMENT ON COLUMN contatos.telefone IS 'Telefone no formato (##) #####-####';
COMMENT ON COLUMN contatos.email IS 'E-mail do contato';
COMMENT ON COLUMN contatos.cep IS 'CEP no formato #####-###';
COMMENT ON COLUMN contatos.observacoes IS 'Anotações adicionais sobre o contato';
