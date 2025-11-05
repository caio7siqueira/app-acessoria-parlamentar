-- Migration: Enforce 3-user limit per account
-- Sistema de Assessoria Parlamentar

-- Adicionar coluna conta_id se não existir (para multi-tenancy futuro)
-- Por enquanto, vamos limitar globalmente
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS conta_id UUID DEFAULT '00000000-0000-0000-0000-000000000000';

-- Função para enforçar limite de 3 usuários por conta
CREATE OR REPLACE FUNCTION enforce_user_limit()
RETURNS TRIGGER AS $$
BEGIN
  -- Contar usuários ativos na mesma conta
  IF (SELECT COUNT(*) FROM usuarios WHERE conta_id = COALESCE(NEW.conta_id, '00000000-0000-0000-0000-000000000000') AND ativo = true) >= 3 THEN
    RAISE EXCEPTION 'Limite de 3 usuários atingido para esta conta.';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para validar limite antes de inserir novo usuário
DROP TRIGGER IF EXISTS user_limit_trigger ON usuarios;
CREATE TRIGGER user_limit_trigger
BEFORE INSERT ON usuarios
FOR EACH ROW
WHEN (NEW.ativo = true)
EXECUTE FUNCTION enforce_user_limit();

-- Trigger para validar limite ao ativar usuário existente
DROP TRIGGER IF EXISTS user_limit_update_trigger ON usuarios;
CREATE TRIGGER user_limit_update_trigger
BEFORE UPDATE ON usuarios
FOR EACH ROW
WHEN (OLD.ativo = false AND NEW.ativo = true)
EXECUTE FUNCTION enforce_user_limit();

-- Comentário da migration
COMMENT ON FUNCTION enforce_user_limit() IS 'Valida que não existem mais de 3 usuários ativos por conta';
