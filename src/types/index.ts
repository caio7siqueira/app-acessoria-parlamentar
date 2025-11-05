// Tipos principais do sistema

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: 'assessora' | 'admin';
  ativo: boolean;
  criado_em: string;
}

export interface Atendimento {
  id: number;
  nome: string;
  genero: 'Masculino' | 'Feminino' | 'Não informado';
  endereco: string;
  idade?: number;
  telefone?: string;
  solicitacao: string;
  prazo_data?: string;
  prazo_urgencia: 'Baixa' | 'Média' | 'Alta' | 'Urgente';
  encaminhamento: 'Secretaria' | 'Informação' | 'Orientação' | 'Outro';
  secretaria?: string;
  status: 'Pendente' | 'Em Andamento' | 'Concluído' | 'Cancelado';
  canal: 'Presencial' | 'Telefone' | 'WhatsApp' | 'E-mail' | 'Outro';
  usuario_criacao?: string;
  data_criacao: string;
  data_atualizacao: string;
}

export interface Historico {
  id: number;
  id_atendimento: number;
  usuario?: string;
  campo_alterado: string;
  valor_anterior?: string;
  valor_novo?: string;
  data_hora: string;
}

export interface Contato {
  id: string; // UUID
  user_id: string; // UUID do usuário dono
  nome: string;
  telefone: string;
  email?: string;
  secretaria?: string;
  cep?: string;
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

// Tipos para formulários
export interface AtendimentoForm {
  nome: string;
  genero: 'Masculino' | 'Feminino' | 'Não informado';
  endereco: string;
  idade?: number;
  telefone?: string;
  solicitacao: string;
  prazo_data?: string;
  prazo_urgencia: 'Baixa' | 'Média' | 'Alta' | 'Urgente';
  encaminhamento: 'Secretaria' | 'Informação' | 'Orientação' | 'Outro';
  secretaria?: string;
  status: 'Pendente' | 'Em Andamento' | 'Concluído' | 'Cancelado';
  canal: 'Presencial' | 'Telefone' | 'WhatsApp' | 'E-mail' | 'Outro';
}

export interface ContatoForm {
  nome: string;
  telefone: string;
  email?: string;
  secretaria?: string;
  cep?: string;
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  observacoes?: string;
}

// Tipos para filtros
export interface FiltrosAtendimento {
  status?: string[];
  urgencia?: string[];
  secretaria?: string[];
  canal?: string[];
  data_inicio?: string;
  data_fim?: string;
  busca?: string;
}

// Tipos para relatórios
export interface RelatorioParams {
  data_inicio: string;
  data_fim: string;
  secretarias?: string[];
  status?: string[];
  urgencia?: string[];
  formato: 'pdf' | 'excel';
}

// Tipos para dashboard/estatísticas
export interface DashboardStats {
  total_atendimentos: number;
  atendimentos_urgentes: number;
  atendimentos_prazo: number;
  atendimentos_por_status: {
    status: string;
    quantidade: number;
  }[];
  atendimentos_por_canal: {
    canal: string;
    quantidade: number;
  }[];
  atendimentos_por_secretaria: {
    secretaria: string;
    quantidade: number;
  }[];
  atendimentos_por_urgencia: {
    urgencia: string;
    quantidade: number;
  }[];
}

// Tipos para paginação
export interface PaginacaoParams {
  page: number;
  limit: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface PaginacaoResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Constantes
export const SECRETARIAS = [
  'Secretaria de Saúde',
  'Secretaria de Educação',
  'Secretaria de Assistência Social',
  'Secretaria de Obras',
  'Secretaria de Meio Ambiente',
  'Secretaria de Transporte',
  'Secretaria de Cultura',
  'Secretaria de Esporte'
] as const;

export const STATUS_ATENDIMENTO = [
  'Pendente',
  'Em Andamento',
  'Concluído',
  'Cancelado'
] as const;

export const URGENCIAS = [
  'Baixa',
  'Média',
  'Alta',
  'Urgente'
] as const;

export const CANAIS = [
  'Presencial',
  'Telefone',
  'WhatsApp',
  'E-mail',
  'Outro'
] as const;

export const TIPOS_ENCAMINHAMENTO = [
  'Secretaria',
  'Informação',
  'Orientação',
  'Outro'
] as const;