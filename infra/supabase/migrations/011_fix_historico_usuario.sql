-- Migration: Corrigir trigger de histórico para usar usuarios.id em vez de auth.uid()
-- Problema: historico.usuario referencia usuarios(id), mas trigger usa auth.uid() (auth.users.id)
-- Solução: Buscar usuarios.id baseado no email do usuário autenticado

CREATE OR REPLACE FUNCTION registrar_historico_atendimento()
RETURNS TRIGGER AS $$
DECLARE
    usuario_id UUID;
    user_email TEXT;
BEGIN
    -- Apenas para UPDATE
    IF TG_OP = 'UPDATE' THEN
        -- Buscar email do usuário autenticado
        SELECT email INTO user_email 
        FROM auth.users 
        WHERE id = auth.uid();

        -- Buscar ID do usuário na tabela usuarios
        SELECT id INTO usuario_id 
        FROM usuarios 
        WHERE email = user_email;

        -- Se não encontrar usuário, criar um registro
        IF usuario_id IS NULL AND user_email IS NOT NULL THEN
            INSERT INTO usuarios (email, nome, ativo) 
            VALUES (
                user_email, 
                COALESCE(split_part(user_email, '@', 1), 'Usuário'), 
                true
            ) 
            RETURNING id INTO usuario_id;
        END IF;

        -- Registrar mudanças no histórico
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            INSERT INTO historico (id_atendimento, campo_alterado, valor_anterior, valor_novo, usuario)
            VALUES (NEW.id, 'status', OLD.status, NEW.status, usuario_id);
        END IF;

        IF OLD.prazo_urgencia IS DISTINCT FROM NEW.prazo_urgencia THEN
            INSERT INTO historico (id_atendimento, campo_alterado, valor_anterior, valor_novo, usuario)
            VALUES (NEW.id, 'prazo_urgencia', OLD.prazo_urgencia, NEW.prazo_urgencia, usuario_id);
        END IF;

        IF OLD.encaminhamento IS DISTINCT FROM NEW.encaminhamento THEN
            INSERT INTO historico (id_atendimento, campo_alterado, valor_anterior, valor_novo, usuario)
            VALUES (NEW.id, 'encaminhamento', OLD.encaminhamento, NEW.encaminhamento, usuario_id);
        END IF;

        IF OLD.secretaria IS DISTINCT FROM NEW.secretaria THEN
            INSERT INTO historico (id_atendimento, campo_alterado, valor_anterior, valor_novo, usuario)
            VALUES (NEW.id, 'secretaria', COALESCE(OLD.secretaria, 'N/A'), COALESCE(NEW.secretaria, 'N/A'), usuario_id);
        END IF;

        IF OLD.solicitacao IS DISTINCT FROM NEW.solicitacao THEN
            INSERT INTO historico (id_atendimento, campo_alterado, valor_anterior, valor_novo, usuario)
            VALUES (NEW.id, 'solicitacao', LEFT(OLD.solicitacao, 50) || '...', LEFT(NEW.solicitacao, 50) || '...', usuario_id);
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION registrar_historico_atendimento() 
IS 'Registra mudanças em atendimentos usando usuarios.id correto baseado no email do usuário autenticado';

-- Também corrigir a função registrar_historico() original
CREATE OR REPLACE FUNCTION registrar_historico()
RETURNS TRIGGER AS $$
DECLARE
    usuario_id UUID;
    user_email TEXT;
    campo text;
    valor_antigo text;
    valor_novo text;
BEGIN
    -- Verificar se é uma inserção (não gerar histórico)
    IF TG_OP = 'INSERT' THEN
        RETURN NEW;
    END IF;

    -- Buscar email do usuário autenticado
    SELECT email INTO user_email 
    FROM auth.users 
    WHERE id = auth.uid();

    -- Buscar ID do usuário na tabela usuarios
    SELECT id INTO usuario_id 
    FROM usuarios 
    WHERE email = user_email;

    -- Se não encontrar usuário, criar um registro
    IF usuario_id IS NULL AND user_email IS NOT NULL THEN
        INSERT INTO usuarios (email, nome, ativo) 
        VALUES (
            user_email, 
            COALESCE(split_part(user_email, '@', 1), 'Usuário'), 
            true
        ) 
        RETURNING id INTO usuario_id;
    END IF;

    -- Verificar cada campo alterado
    IF OLD.nome != NEW.nome THEN
        INSERT INTO historico (id_atendimento, usuario, campo_alterado, valor_anterior, valor_novo)
        VALUES (NEW.id, usuario_id, 'nome', OLD.nome, NEW.nome);
    END IF;

    IF OLD.genero != NEW.genero THEN
        INSERT INTO historico (id_atendimento, usuario, campo_alterado, valor_anterior, valor_novo)
        VALUES (NEW.id, usuario_id, 'genero', OLD.genero, NEW.genero);
    END IF;

    IF OLD.endereco != NEW.endereco THEN
        INSERT INTO historico (id_atendimento, usuario, campo_alterado, valor_anterior, valor_novo)
        VALUES (NEW.id, usuario_id, 'endereco', OLD.endereco, NEW.endereco);
    END IF;

    IF OLD.idade != NEW.idade THEN
        INSERT INTO historico (id_atendimento, usuario, campo_alterado, valor_anterior, valor_novo)
        VALUES (NEW.id, usuario_id, 'idade', OLD.idade::text, NEW.idade::text);
    END IF;

    IF OLD.telefone != NEW.telefone THEN
        INSERT INTO historico (id_atendimento, usuario, campo_alterado, valor_anterior, valor_novo)
        VALUES (NEW.id, usuario_id, 'telefone', OLD.telefone, NEW.telefone);
    END IF;

    IF OLD.solicitacao != NEW.solicitacao THEN
        INSERT INTO historico (id_atendimento, usuario, campo_alterado, valor_anterior, valor_novo)
        VALUES (NEW.id, usuario_id, 'solicitacao', OLD.solicitacao, NEW.solicitacao);
    END IF;

    IF OLD.prazo_data != NEW.prazo_data THEN
        INSERT INTO historico (id_atendimento, usuario, campo_alterado, valor_anterior, valor_novo)
        VALUES (NEW.id, usuario_id, 'prazo_data', OLD.prazo_data::text, NEW.prazo_data::text);
    END IF;

    IF OLD.status != NEW.status THEN
        INSERT INTO historico (id_atendimento, usuario, campo_alterado, valor_anterior, valor_novo)
        VALUES (NEW.id, usuario_id, 'status', OLD.status, NEW.status);
    END IF;

    IF OLD.prazo_urgencia != NEW.prazo_urgencia THEN
        INSERT INTO historico (id_atendimento, usuario, campo_alterado, valor_anterior, valor_novo)
        VALUES (NEW.id, usuario_id, 'prazo_urgencia', OLD.prazo_urgencia, NEW.prazo_urgencia);
    END IF;

    IF OLD.encaminhamento != NEW.encaminhamento THEN
        INSERT INTO historico (id_atendimento, usuario, campo_alterado, valor_anterior, valor_novo)
        VALUES (NEW.id, usuario_id, 'encaminhamento', OLD.encaminhamento, NEW.encaminhamento);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION registrar_historico() 
IS 'Registra mudanças em atendimentos (versão original) usando usuarios.id correto baseado no email do usuário autenticado';