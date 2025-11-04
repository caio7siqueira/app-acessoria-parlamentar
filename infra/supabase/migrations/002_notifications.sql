-- Migration: 002_notifications.sql
-- Cria tabela de notificacoes e trigger de exemplo para gerar notificações

CREATE TABLE IF NOT EXISTS notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id),
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('urgente', 'prazo', 'info')),
  lida BOOLEAN DEFAULT FALSE,
  atendimento_id BIGINT REFERENCES atendimentos(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario ON notificacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON notificacoes(lida);

-- Exemplo de trigger para criar notificações automáticas quando um atendimento vira urgente
CREATE OR REPLACE FUNCTION notificar_prazo_urgente()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.prazo_urgencia = 'Urgente' AND (OLD.prazo_urgencia IS DISTINCT FROM NEW.prazo_urgencia) THEN
      INSERT INTO notificacoes (titulo, mensagem, tipo, atendimento_id)
      VALUES ('Atendimento Urgente', 'Atendimento de ' || COALESCE(NEW.nome, '') || ' marcado como urgente', 'urgente', NEW.id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notificar_urgente ON atendimentos;
CREATE TRIGGER trigger_notificar_urgente
AFTER UPDATE ON atendimentos
FOR EACH ROW
EXECUTE FUNCTION notificar_prazo_urgente();
