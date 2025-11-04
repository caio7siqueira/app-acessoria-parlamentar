-- Migration: Adicionar trigger para histórico automático de atendimentos
-- Cria função que registra mudanças na tabela de atendimentos

CREATE OR REPLACE FUNCTION registrar_historico_atendimento()
RETURNS TRIGGER AS $$
DECLARE
    campo TEXT;
    valor_antigo TEXT;
    valor_novo TEXT;
BEGIN
    -- Apenas para UPDATE
    IF TG_OP = 'UPDATE' THEN
        -- Verificar cada campo e registrar se mudou
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            INSERT INTO historico (id_atendimento, campo_alterado, valor_anterior, valor_novo, usuario)
            VALUES (NEW.id, 'status', OLD.status, NEW.status, auth.uid()::text);
        END IF;

        IF OLD.prazo_urgencia IS DISTINCT FROM NEW.prazo_urgencia THEN
            INSERT INTO historico (id_atendimento, campo_alterado, valor_anterior, valor_novo, usuario)
            VALUES (NEW.id, 'prazo_urgencia', OLD.prazo_urgencia, NEW.prazo_urgencia, auth.uid()::text);
        END IF;

        IF OLD.encaminhamento IS DISTINCT FROM NEW.encaminhamento THEN
            INSERT INTO historico (id_atendimento, campo_alterado, valor_anterior, valor_novo, usuario)
            VALUES (NEW.id, 'encaminhamento', OLD.encaminhamento, NEW.encaminhamento, auth.uid()::text);
        END IF;

        IF OLD.secretaria IS DISTINCT FROM NEW.secretaria THEN
            INSERT INTO historico (id_atendimento, campo_alterado, valor_anterior, valor_novo, usuario)
            VALUES (NEW.id, 'secretaria', COALESCE(OLD.secretaria, 'N/A'), COALESCE(NEW.secretaria, 'N/A'), auth.uid()::text);
        END IF;

        IF OLD.solicitacao IS DISTINCT FROM NEW.solicitacao THEN
            INSERT INTO historico (id_atendimento, campo_alterado, valor_anterior, valor_novo, usuario)
            VALUES (NEW.id, 'solicitacao', LEFT(OLD.solicitacao, 50) || '...', LEFT(NEW.solicitacao, 50) || '...', auth.uid()::text);
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger
DROP TRIGGER IF EXISTS trigger_historico_atendimento ON atendimentos;
CREATE TRIGGER trigger_historico_atendimento
    AFTER UPDATE ON atendimentos
    FOR EACH ROW
    EXECUTE FUNCTION registrar_historico_atendimento();

-- Comentário
COMMENT ON FUNCTION registrar_historico_atendimento() IS 'Registra automaticamente mudanças importantes nos atendimentos';
