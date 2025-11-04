-- Dados de exemplo para o sistema
-- Inserir dados de demonstração após executar a migração inicial

-- Inserir usuário de exemplo
INSERT INTO usuarios (id, nome, email, role, ativo) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'Maria Silva', 'maria.silva@example.com', 'assessora', true);

-- Inserir contatos de secretarias
INSERT INTO contatos (secretaria, nome_responsavel, cargo, telefone1, telefone2, email, observacoes) VALUES 
('Secretaria de Saúde', 'João Santos', 'Diretor', '(11) 99999-1111', '(11) 3333-1111', 'joao.santos@saude.gov.br', 'Disponível das 8h às 17h'),
('Secretaria de Educação', 'Ana Costa', 'Coordenadora', '(11) 99999-2222', '(11) 3333-2222', 'ana.costa@educacao.gov.br', 'Atende também aos sábados'),
('Secretaria de Assistência Social', 'Carlos Lima', 'Supervisor', '(11) 99999-3333', '(11) 3333-3333', 'carlos.lima@assistencia.gov.br', 'Especialista em auxílio emergencial'),
('Secretaria de Obras', 'Fernanda Oliveira', 'Engenheira', '(11) 99999-4444', '(11) 3333-4444', 'fernanda.oliveira@obras.gov.br', 'Responsável por pavimentação'),
('Secretaria de Meio Ambiente', 'Roberto Ferreira', 'Biólogo', '(11) 99999-5555', '(11) 3333-5555', 'roberto.ferreira@meioambiente.gov.br', 'Questões de coleta seletiva');

-- Inserir atendimentos de exemplo
INSERT INTO atendimentos (
    nome, genero, endereco, idade, telefone, solicitacao, prazo_data, 
    prazo_urgencia, encaminhamento, secretaria, status, canal, usuario_criacao
) VALUES 
(
    'José da Silva', 
    'Masculino', 
    'Rua das Flores, 123 - Centro', 
    45, 
    '(11) 98765-4321', 
    'Solicita consulta médica especializada para tratamento de diabetes', 
    '2025-11-15', 
    'Média', 
    'Secretaria', 
    'Secretaria de Saúde', 
    'Pendente', 
    'Presencial',
    '550e8400-e29b-41d4-a716-446655440000'
),
(
    'Maria dos Santos', 
    'Feminino', 
    'Av. Principal, 456 - Vila Nova', 
    32, 
    '(11) 91234-5678', 
    'Precisa de vaga em creche para filho de 2 anos', 
    '2025-11-20', 
    'Alta', 
    'Secretaria', 
    'Secretaria de Educação', 
    'Em Andamento', 
    'WhatsApp',
    '550e8400-e29b-41d4-a716-446655440000'
),
(
    'Antonio Pereira', 
    'Masculino', 
    'Rua do Campo, 789 - Jardim', 
    67, 
    '(11) 95555-9999', 
    'Buraco na rua em frente à casa causando alagamentos', 
    '2025-11-10', 
    'Urgente', 
    'Secretaria', 
    'Secretaria de Obras', 
    'Concluído', 
    'Telefone',
    '550e8400-e29b-41d4-a716-446655440000'
),
(
    'Luiza Ferreira', 
    'Feminino', 
    'Rua das Palmeiras, 321 - Bosque', 
    28, 
    '(11) 97777-2222', 
    'Auxílio emergencial para família em situação de vulnerabilidade', 
    '2025-11-12', 
    'Urgente', 
    'Secretaria', 
    'Secretaria de Assistência Social', 
    'Em Andamento', 
    'E-mail',
    '550e8400-e29b-41d4-a716-446655440000'
),
(
    'Carlos Rodrigues', 
    'Masculino', 
    'Av. das Árvores, 654 - Parque', 
    55, 
    '(11) 93333-7777', 
    'Problema com coleta de lixo irregular no bairro', 
    '2025-11-18', 
    'Baixa', 
    'Secretaria', 
    'Secretaria de Meio Ambiente', 
    'Pendente', 
    'Presencial',
    '550e8400-e29b-41d4-a716-446655440000'
),
(
    'Fernanda Lima', 
    'Feminino', 
    'Rua Nova Esperança, 987 - Popular', 
    41, 
    '(11) 96666-1111', 
    'Informações sobre programa habitacional', 
    '2025-11-25', 
    'Média', 
    'Informação', 
    NULL, 
    'Concluído', 
    'WhatsApp',
    '550e8400-e29b-41d4-a716-446655440000'
);