-- Migration: Remover triggers duplicados do histórico
-- Problema: Existem 2 triggers registrando histórico na tabela atendimentos:
--   1. trigger_registrar_historico (migração 001) - rastreia TODOS os campos
--   2. trigger_historico_atendimento (migração 002) - rastreia campos importantes
-- Solução: Dropar AMBOS os triggers e manter apenas o mais eficiente

-- 1. Remover AMBOS os triggers de histórico
DROP TRIGGER IF EXISTS trigger_registrar_historico ON atendimentos;
DROP TRIGGER IF EXISTS trigger_historico_atendimento ON atendimentos;

-- 2. Remover a função antiga da migração 001 (registrava todos os campos)
DROP FUNCTION IF EXISTS registrar_historico() CASCADE;

-- 3. Garantir que a função otimizada está com a versão correta (UUID sem ::text)
--    Esta função rastreia apenas os campos mais importantes: status, prazo_urgencia, 
--    encaminhamento, secretaria e solicitacao (resumida)
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

-- 4. Recriar apenas o trigger otimizado (rastreia campos importantes)
CREATE TRIGGER trigger_historico_atendimento
    AFTER UPDATE ON atendimentos
    FOR EACH ROW
    EXECUTE FUNCTION registrar_historico_atendimento();

-- 5. Verificação: listar triggers da tabela atendimentos
--    Deve retornar apenas 3 triggers:
--    - trigger_historico_atendimento (histórico)
--    - trigger_notificar_urgente (notificações)
--    - update_atendimentos_modtime (timestamp)
-- SELECT tgname FROM pg_trigger WHERE tgrelid = 'atendimentos'::regclass AND tgisinternal = false;

COMMENT ON TRIGGER trigger_historico_atendimento ON atendimentos IS 
'Trigger único para registrar histórico de alterações em atendimentos';
