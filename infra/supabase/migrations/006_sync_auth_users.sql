-- Migration: Trigger para criar automaticamente usuário na tabela usuarios quando autenticado
-- Sistema de Assessoria Parlamentar

-- Função para sincronizar usuário do auth.users com a tabela usuarios
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
  SET id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que executa após inserção na auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_user_to_usuarios();

-- Sincronizar usuários existentes (caso haja algum no auth.users que não está em usuarios)
INSERT INTO usuarios (id, email, nome, ativo)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'name', SPLIT_PART(u.email, '@', 1)) as nome,
  true
FROM auth.users u
LEFT JOIN usuarios usr ON u.id = usr.id
WHERE usr.id IS NULL
ON CONFLICT (email) DO UPDATE
SET id = EXCLUDED.id;

-- Comentários
COMMENT ON FUNCTION sync_user_to_usuarios() IS 'Sincroniza automaticamente usuários do auth.users para a tabela usuarios';
