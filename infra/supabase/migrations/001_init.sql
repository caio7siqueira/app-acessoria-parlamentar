-- Migração inicial do banco de dados
-- Sistema de Assessoria Parlamentar

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'assessora',
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMPTZ DEFAULT now()
);

-- Tabela de atendimentos
CREATE TABLE atendimentos (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  genero TEXT NOT NULL,
  endereco TEXT NOT NULL,
  idade INT,
  telefone TEXT,
  solicitacao TEXT NOT NULL,
  prazo_data DATE,
  prazo_urgencia TEXT NOT NULL,
  encaminhamento TEXT NOT NULL,
  secretaria TEXT,
  status TEXT DEFAULT 'Pendente',
  canal TEXT NOT NULL,
  usuario_criacao UUID REFERENCES usuarios(id),
  data_criacao TIMESTAMPTZ DEFAULT now(),
  data_atualizacao TIMESTAMPTZ DEFAULT now()
);

-- Tabela de histórico
CREATE TABLE historico (
  id BIGSERIAL PRIMARY KEY,
  id_atendimento BIGINT REFERENCES atendimentos(id) ON DELETE CASCADE,
  usuario UUID REFERENCES usuarios(id),
  campo_alterado TEXT,
  valor_anterior TEXT,
  valor_novo TEXT,
  data_hora TIMESTAMPTZ DEFAULT now()
);

-- Tabela de contatos
CREATE TABLE contatos (
  id BIGSERIAL PRIMARY KEY,
  secretaria TEXT NOT NULL,
  nome_responsavel TEXT NOT NULL,
  cargo TEXT,
  telefone1 TEXT,
  telefone2 TEXT,
  email TEXT,
  observacoes TEXT
);

-- Função para atualizar data_atualizacao automaticamente
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_atualizacao = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar data_atualizacao na tabela atendimentos
CREATE TRIGGER update_atendimentos_modtime
    BEFORE UPDATE ON atendimentos
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Função para registrar histórico de alterações
CREATE OR REPLACE FUNCTION registrar_historico()
RETURNS TRIGGER AS $$
DECLARE
    campo text;
    valor_antigo text;
    valor_novo text;
BEGIN
    -- Verificar se é uma inserção (não gerar histórico)
    IF TG_OP = 'INSERT' THEN
        RETURN NEW;
    END IF;

    -- Verificar cada campo alterado
    IF OLD.nome != NEW.nome THEN
        INSERT INTO historico (id_atendimento, usuario, campo_alterado, valor_anterior, valor_novo)
        VALUES (NEW.id, auth.uid(), 'nome', OLD.nome, NEW.nome);
    END IF;

    IF OLD.genero != NEW.genero THEN
        INSERT INTO historico (id_atendimento, usuario, campo_alterado, valor_anterior, valor_novo)
        VALUES (NEW.id, auth.uid(), 'genero', OLD.genero, NEW.genero);
    END IF;

    IF OLD.endereco != NEW.endereco THEN
        INSERT INTO historico (id_atendimento, usuario, campo_alterado, valor_anterior, valor_novo)
        VALUES (NEW.id, auth.uid(), 'endereco', OLD.endereco, NEW.endereco);
    END IF;

    IF OLD.idade != NEW.idade THEN
        INSERT INTO historico (id_atendimento, usuario, campo_alterado, valor_anterior, valor_novo)
        VALUES (NEW.id, auth.uid(), 'idade', OLD.idade::text, NEW.idade::text);
    END IF;

    IF OLD.telefone != NEW.telefone THEN
        INSERT INTO historico (id_atendimento, usuario, campo_alterado, valor_anterior, valor_novo)
        VALUES (NEW.id, auth.uid(), 'telefone', OLD.telefone, NEW.telefone);
    END IF;

    IF OLD.solicitacao != NEW.solicitacao THEN
        INSERT INTO historico (id_atendimento, usuario, campo_alterado, valor_anterior, valor_novo)
        VALUES (NEW.id, auth.uid(), 'solicitacao', OLD.solicitacao, NEW.solicitacao);
    END IF;

    IF OLD.prazo_data != NEW.prazo_data THEN
        INSERT INTO historico (id_atendimento, usuario, campo_alterado, valor_anterior, valor_novo)
        VALUES (NEW.id, auth.uid(), 'prazo_data', OLD.prazo_data::text, NEW.prazo_data::text);
    END IF;

    IF OLD.prazo_urgencia != NEW.prazo_urgencia THEN
        INSERT INTO historico (id_atendimento, usuario, campo_alterado, valor_anterior, valor_novo)
        VALUES (NEW.id, auth.uid(), 'prazo_urgencia', OLD.prazo_urgencia, NEW.prazo_urgencia);
    END IF;

    IF OLD.encaminhamento != NEW.encaminhamento THEN
        INSERT INTO historico (id_atendimento, usuario, campo_alterado, valor_anterior, valor_novo)
        VALUES (NEW.id, auth.uid(), 'encaminhamento', OLD.encaminhamento, NEW.encaminhamento);
    END IF;

    IF OLD.secretaria != NEW.secretaria THEN
        INSERT INTO historico (id_atendimento, usuario, campo_alterado, valor_anterior, valor_novo)
        VALUES (NEW.id, auth.uid(), 'secretaria', OLD.secretaria, NEW.secretaria);
    END IF;

    IF OLD.status != NEW.status THEN
        INSERT INTO historico (id_atendimento, usuario, campo_alterado, valor_anterior, valor_novo)
        VALUES (NEW.id, auth.uid(), 'status', OLD.status, NEW.status);
    END IF;

    IF OLD.canal != NEW.canal THEN
        INSERT INTO historico (id_atendimento, usuario, campo_alterado, valor_anterior, valor_novo)
        VALUES (NEW.id, auth.uid(), 'canal', OLD.canal, NEW.canal);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para registrar histórico na tabela atendimentos
CREATE TRIGGER trigger_registrar_historico
    AFTER UPDATE ON atendimentos
    FOR EACH ROW
    EXECUTE FUNCTION registrar_historico();

-- Políticas RLS (Row Level Security)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE atendimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico ENABLE ROW LEVEL SECURITY;
ALTER TABLE contatos ENABLE ROW LEVEL SECURITY;

-- Política para usuários autenticados - tabela usuarios
CREATE POLICY "Usuários podem ver seus próprios dados" ON usuarios
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seus próprios dados" ON usuarios
    FOR UPDATE USING (auth.uid() = id);

-- Política para usuários autenticados - tabela atendimentos
CREATE POLICY "Usuários autenticados podem ver todos os atendimentos" ON atendimentos
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir atendimentos" ON atendimentos
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar atendimentos" ON atendimentos
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar atendimentos" ON atendimentos
    FOR DELETE USING (auth.role() = 'authenticated');

-- Política para usuários autenticados - tabela historico
CREATE POLICY "Usuários autenticados podem ver histórico" ON historico
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para usuários autenticados - tabela contatos
CREATE POLICY "Usuários autenticados podem ver todos os contatos" ON contatos
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir contatos" ON contatos
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar contatos" ON contatos
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar contatos" ON contatos
    FOR DELETE USING (auth.role() = 'authenticated');

-- Índices para performance
CREATE INDEX idx_atendimentos_status ON atendimentos(status);
CREATE INDEX idx_atendimentos_urgencia ON atendimentos(prazo_urgencia);
CREATE INDEX idx_atendimentos_data_criacao ON atendimentos(data_criacao);
CREATE INDEX idx_atendimentos_usuario ON atendimentos(usuario_criacao);
CREATE INDEX idx_historico_atendimento ON historico(id_atendimento);
CREATE INDEX idx_contatos_secretaria ON contatos(secretaria);