/**
 * Mensagens centralizadas do sistema
 * Todas as mensagens devem estar em português, objetivas e amigáveis
 */

export const MESSAGES = {
  // Sucesso
  SUCCESS: {
    GENERIC: 'Ação concluída com sucesso!',
    ATENDIMENTO_CREATED: 'Atendimento criado com sucesso!',
    ATENDIMENTO_UPDATED: 'Atendimento atualizado com sucesso!',
    ATENDIMENTO_DELETED: 'Atendimento excluído com sucesso!',
    CONTATO_CREATED: 'Contato criado com sucesso!',
    CONTATO_UPDATED: 'Contato atualizado com sucesso!',
    CONTATO_DELETED: 'Contato excluído com sucesso!',
    USER_INVITED: 'Convite enviado com sucesso!',
    RELATORIO_EXPORTED: 'Relatório exportado com sucesso!',
    SETTINGS_SAVED: 'Configurações salvas com sucesso!',
  },

  // Erros
  ERROR: {
    GENERIC: 'Ocorreu um erro. Tente novamente.',
    ATENDIMENTO_LOAD: 'Erro ao carregar atendimento.',
    ATENDIMENTO_SAVE: 'Erro ao salvar atendimento. Verifique os campos obrigatórios.',
    ATENDIMENTO_DELETE: 'Erro ao excluir atendimento.',
    CONTATO_LOAD: 'Erro ao carregar contato.',
    CONTATO_SAVE: 'Erro ao salvar contato. Tente novamente.',
    CONTATO_DELETE: 'Erro ao excluir contato.',
    RELATORIO_GENERATE: 'Erro ao gerar relatório. Tente novamente.',
    RELATORIO_EXPORT: 'Erro ao exportar relatório. Tente novamente.',
    INVALID_CREDENTIALS: 'E-mail ou senha incorretos.',
    USER_EXISTS: 'Este e-mail já está cadastrado.',
    USER_NOT_FOUND: 'Usuário não encontrado. Verifique o e-mail informado.',
    USER_LIMIT_REACHED: 'Limite de 3 usuários atingido para esta conta.',
    INVALID_EMAIL: 'E-mail inválido.',
    INVALID_DATA: 'Dados inválidos. Verifique os campos.',
    NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
    PERMISSION_DENIED: 'Você não tem permissão para esta ação.',
    SESSION_EXPIRED: 'Sua sessão expirou. Faça login novamente.',
    CEP_NOT_FOUND: 'CEP não encontrado. Verifique o número digitado.',
    CEP_ERROR: 'Erro ao buscar CEP. Tente novamente.',
    INVALID_TOKEN: 'Link inválido ou expirado. Solicite um novo convite.',
    PASSWORD_MISMATCH: 'As senhas não coincidem.',
  },

  // Avisos
  WARNING: {
    UNSAVED_CHANGES: 'Você tem alterações não salvas.',
    CONFIRM_DELETE: 'Tem certeza que deseja excluir?',
    CONFIRM_DELETE_ATENDIMENTO: 'Tem certeza que deseja excluir este atendimento?',
    CONFIRM_DELETE_CONTATO: 'Tem certeza que deseja excluir este contato?',
    NO_DATA: 'Nenhum dado encontrado.',
    NO_DATA_FILTERS: 'Nenhum dado encontrado para os filtros selecionados.',
    ATENDIMENTO_CONCLUIDO: 'Este atendimento está concluído. Campos principais estão bloqueados para edição.',
  },

  // Informações
  INFO: {
    LOADING: 'Carregando...',
    SAVING: 'Salvando...',
    DELETING: 'Excluindo...',
    GENERATING_REPORT: 'Gerando relatório...',
    EXPORTING: 'Exportando...',
    SEARCHING_CEP: 'Buscando CEP...',
    NO_HISTORY: 'Nenhum evento registrado.',
    NO_ATENDIMENTOS: 'Nenhum atendimento encontrado.',
    NO_CONTATOS: 'Nenhum contato cadastrado ainda.',
    PASSWORD_CREATED: 'Senha criada com sucesso! Redirecionando...',
  },

  // Validação
  VALIDATION: {
    REQUIRED_FIELD: 'Este campo é obrigatório',
    REQUIRED_FIELDS: 'Preencha todos os campos obrigatórios',
    INVALID_EMAIL: 'E-mail inválido',
    INVALID_PHONE: 'Telefone inválido. Use o formato (##) #####-####',
    INVALID_CEP: 'CEP inválido. Use o formato #####-###',
    MIN_LENGTH: 'Mínimo de {n} caracteres',
    MAX_LENGTH: 'Máximo de {n} caracteres',
    INVALID_DATE: 'Data inválida',
    PASSWORD_MIN_LENGTH: 'A senha deve ter no mínimo 6 caracteres',
    PASSWORD_WEAK: 'Senha fraca. Use letras, números e caracteres especiais',
  },
} as const;

/**
 * Utilitário para substituir placeholders em mensagens
 * Exemplo: replaceParams('Mínimo de {n} caracteres.', { n: 3 }) -> 'Mínimo de 3 caracteres.'
 */
export function replaceParams(message: string, params: Record<string, string | number>): string {
  let result = message;
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`{${key}}`, String(value));
  });
  return result;
}
