-- Migration: Corrigir usuários com ativo = false para ativo = true
-- Problema: Migration 006 não estava atualizando o campo ativo em conflitos de email

-- Ativar todos os usuários existentes
UPDATE usuarios 
SET ativo = true 
WHERE ativo = false;

-- Recriar a função com correção
CREATE OR REPLACE FUNCTION sync_user_to_usuarios()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir na tabela usuarios se não existir
  INSERT INTO usuarios (id, email, nome, ativo)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
    true
  )
  ON CONFLICT (email) DO UPDATE
  SET 
    id = NEW.id,
    ativo = true,
    nome = COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION sync_user_to_usuarios() IS 'Sincroniza automaticamente usuários do auth.users para a tabela usuarios - CORRIGIDO: sempre define ativo=true';