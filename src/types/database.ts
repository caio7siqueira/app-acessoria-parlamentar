// Tipos do banco de dados gerados pelo Supabase
export interface Database {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string;
          nome: string;
          email: string;
          role: string;
          ativo: boolean;
          criado_em: string;
        };
        Insert: {
          id?: string;
          nome: string;
          email: string;
          role?: string;
          ativo?: boolean;
          criado_em?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          email?: string;
          role?: string;
          ativo?: boolean;
          criado_em?: string;
        };
      };
      atendimentos: {
        Row: {
          id: number;
          nome: string;
          genero: string;
          endereco: string;
          idade: number | null;
          telefone: string | null;
          solicitacao: string;
          prazo_data: string | null;
          prazo_urgencia: string;
          encaminhamento: string;
          secretaria: string | null;
          status: string;
          canal: string;
          usuario_criacao: string | null;
          data_criacao: string;
          data_atualizacao: string;
        };
        Insert: {
          id?: number;
          nome: string;
          genero: string;
          endereco: string;
          idade?: number | null;
          telefone?: string | null;
          solicitacao: string;
          prazo_data?: string | null;
          prazo_urgencia: string;
          encaminhamento: string;
          secretaria?: string | null;
          status?: string;
          canal: string;
          usuario_criacao?: string | null;
          data_criacao?: string;
          data_atualizacao?: string;
        };
        Update: {
          id?: number;
          nome?: string;
          genero?: string;
          endereco?: string;
          idade?: number | null;
          telefone?: string | null;
          solicitacao?: string;
          prazo_data?: string | null;
          prazo_urgencia?: string;
          encaminhamento?: string;
          secretaria?: string | null;
          status?: string;
          canal?: string;
          usuario_criacao?: string | null;
          data_criacao?: string;
          data_atualizacao?: string;
        };
      };
      historico: {
        Row: {
          id: number;
          id_atendimento: number;
          usuario: string | null;
          campo_alterado: string | null;
          valor_anterior: string | null;
          valor_novo: string | null;
          data_hora: string;
        };
        Insert: {
          id?: number;
          id_atendimento: number;
          usuario?: string | null;
          campo_alterado?: string | null;
          valor_anterior?: string | null;
          valor_novo?: string | null;
          data_hora?: string;
        };
        Update: {
          id?: number;
          id_atendimento?: number;
          usuario?: string | null;
          campo_alterado?: string | null;
          valor_anterior?: string | null;
          valor_novo?: string | null;
          data_hora?: string;
        };
      };
      contatos: {
        Row: {
          id: number;
          secretaria: string;
          nome_responsavel: string;
          cargo: string | null;
          telefone1: string | null;
          telefone2: string | null;
          email: string | null;
          observacoes: string | null;
        };
        Insert: {
          id?: number;
          secretaria: string;
          nome_responsavel: string;
          cargo?: string | null;
          telefone1?: string | null;
          telefone2?: string | null;
          email?: string | null;
          observacoes?: string | null;
        };
        Update: {
          id?: number;
          secretaria?: string;
          nome_responsavel?: string;
          cargo?: string | null;
          telefone1?: string | null;
          telefone2?: string | null;
          email?: string | null;
          observacoes?: string | null;
        };
      };
    };
  };
}