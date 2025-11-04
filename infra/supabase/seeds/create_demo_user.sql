-- Script para criar usuário demo via SQL
-- ATENÇÃO: Execute apenas no Supabase SQL Editor

-- 1. Primeiro, crie o usuário via interface do Supabase (Authentication > Users)
-- Email: demo@parlamentar.com  
-- Password: demo123456

-- 2. Depois execute este SQL para vincular aos dados da aplicação:
INSERT INTO public.usuarios (id, nome, email, role, ativo) 
VALUES (
    (SELECT auth.uid() FROM auth.users WHERE email = 'demo@parlamentar.com' LIMIT 1),
    'Administrador Demo',
    'demo@parlamentar.com',
    'administrador',
    true
) ON CONFLICT (email) DO UPDATE SET 
    nome = EXCLUDED.nome,
    role = EXCLUDED.role,
    ativo = EXCLUDED.ativo;

-- Verificar se foi criado
SELECT * FROM public.usuarios WHERE email = 'demo@parlamentar.com';