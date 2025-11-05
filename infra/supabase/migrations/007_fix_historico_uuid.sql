-- Migration: Corrigir tipo do campo usuario no trigger de histórico
-- Problema: a função registrar_historico_atendimento estava inserindo auth.uid()::text
-- mas a coluna historico.usuario é do tipo UUID, causando erro de tipo.

CREATE OR REPLACE FUNCTION registrar_historico_atendimento()
RETURNS TRIGGER AS $$
BEGIN
    -- Apenas para UPDATE
    IF TG_OP = 'UPDATE' THEN
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            INSERT INTO historico (id_atendimento, campo_alterado, valor_anterior, valor_novo, usuario)
            VALUES (NEW.id, 'status', OLD.status, NEW.status, auth.uid());
        END IF;

        IF OLD.prazo_urgencia IS DISTINCT FROM NEW.prazo_urgencia THEN
            INSERT INTO historico (id_atendimento, campo_alterado, valor_anterior, valor_novo, usuario)
            VALUES (NEW.id, 'prazo_urgencia', OLD.prazo_urgencia, NEW.prazo_urgencia, auth.uid());
        END IF;

        IF OLD.encaminhamento IS DISTINCT FROM NEW.encaminhamento THEN
            INSERT INTO historico (id_atendimento, campo_alterado, valor_anterior, valor_novo, usuario)
            VALUES (NEW.id, 'encaminhamento', OLD.encaminhamento, NEW.encaminhamento, auth.uid());
        END IF;

        IF OLD.secretaria IS DISTINCT FROM NEW.secretaria THEN
            INSERT INTO historico (id_atendimento, campo_alterado, valor_anterior, valor_novo, usuario)
            VALUES (NEW.id, 'secretaria', COALESCE(OLD.secretaria, 'N/A'), COALESCE(NEW.secretaria, 'N/A'), auth.uid());
        END IF;

        IF OLD.solicitacao IS DISTINCT FROM NEW.solicitacao THEN
            INSERT INTO historico (id_atendimento, campo_alterado, valor_anterior, valor_novo, usuario)
            VALUES (NEW.id, 'solicitacao', LEFT(OLD.solicitacao, 50) || '...', LEFT(NEW.solicitacao, 50) || '...', auth.uid());
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário de auditoria
COMMENT ON FUNCTION registrar_historico_atendimento() IS 'Corrige tipo do usuario para UUID usando auth.uid()';
