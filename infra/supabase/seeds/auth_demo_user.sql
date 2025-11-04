-- Script para criar usuário demo para login
-- Execute este SQL no Supabase SQL Editor

-- Inserir usuário na autenticação (via Supabase Auth)
-- IMPORTANTE: Execute via interface do Supabase ou use a função de sign up

-- Email: demo@parlamentar.com
-- Senha: demo123456

-- Após criar o usuário na autenticação, vincule com os dados da aplicação:
UPDATE usuarios 
SET email = 'demo@parlamentar.com'
WHERE id = '550e8400-e29b-41d4-a716-446655440000';

-- Ou insira um novo registro se não existir:
INSERT INTO usuarios (id, nome, email, role, ativo) 
VALUES (
    gen_random_uuid(),
    'Usuário Demo', 
    'demo@parlamentar.com', 
    'assessora', 
    true
) ON CONFLICT (email) DO NOTHING;