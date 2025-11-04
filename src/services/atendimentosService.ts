import { createClient } from '@supabase/supabase-js';
import type { 
  Atendimento, 
  AtendimentoForm, 
  FiltrosAtendimento, 
  PaginacaoParams, 
  PaginacaoResponse,
  DashboardStats 
} from '@/types';

// Create a simple client without strict typing for compatibility
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export class AtendimentosService {
  // Buscar atendimentos com filtros e paginação
  static async buscarAtendimentos(
    filtros: FiltrosAtendimento = {},
    paginacao: PaginacaoParams = { page: 1, limit: 10 }
  ): Promise<PaginacaoResponse<Atendimento>> {
    let query = supabase
      .from('atendimentos')
      .select('*', { count: 'exact' });

    // Aplicar filtros
    if (filtros.status && filtros.status.length > 0) {
      query = query.in('status', filtros.status);
    }

    if (filtros.urgencia && filtros.urgencia.length > 0) {
      query = query.in('prazo_urgencia', filtros.urgencia);
    }

    if (filtros.secretaria && filtros.secretaria.length > 0) {
      query = query.in('secretaria', filtros.secretaria);
    }

    if (filtros.canal && filtros.canal.length > 0) {
      query = query.in('canal', filtros.canal);
    }

    if (filtros.data_inicio) {
      query = query.gte('data_criacao', filtros.data_inicio);
    }

    if (filtros.data_fim) {
      query = query.lte('data_criacao', filtros.data_fim);
    }

    if (filtros.busca) {
      query = query.or(`nome.ilike.%${filtros.busca}%,solicitacao.ilike.%${filtros.busca}%`);
    }

    // Aplicar ordenação
    const orderBy = paginacao.orderBy || 'data_criacao';
    const orderDirection = paginacao.orderDirection || 'desc';
    query = query.order(orderBy, { ascending: orderDirection === 'asc' });

    // Aplicar paginação
    const from = (paginacao.page - 1) * paginacao.limit;
    const to = from + paginacao.limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Erro ao buscar atendimentos: ${error.message}`);
    }

    return {
      data: data || [],
      total: count || 0,
      page: paginacao.page,
      limit: paginacao.limit,
      totalPages: Math.ceil((count || 0) / paginacao.limit)
    };
  }

  // Buscar atendimento por ID
  static async buscarPorId(id: number): Promise<Atendimento | null> {
    const { data, error } = await supabase
      .from('atendimentos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Não encontrado
      }
      throw new Error(`Erro ao buscar atendimento: ${error.message}`);
    }

    return data;
  }

  // Criar novo atendimento
  static async criar(atendimento: AtendimentoForm): Promise<Atendimento> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('atendimentos')
      .insert({
        ...atendimento,
        usuario_criacao: user?.id
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar atendimento: ${error.message}`);
    }

    return data as Atendimento;
  }

  // Atualizar atendimento
  static async atualizar(id: number, atendimento: Partial<AtendimentoForm>): Promise<Atendimento> {
    const { data, error } = await supabase
      .from('atendimentos')
      .update(atendimento as any)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar atendimento: ${error.message}`);
    }

    return data as Atendimento;
  }

  // Excluir atendimento
  static async excluir(id: number): Promise<void> {
    const { error } = await supabase
      .from('atendimentos')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao excluir atendimento: ${error.message}`);
    }
  }

  // Buscar histórico de um atendimento
  static async buscarHistorico(idAtendimento: number) {
    const { data, error } = await supabase
      .from('historico')
      .select(`
        *,
        usuarios(nome)
      `)
      .eq('id_atendimento', idAtendimento)
      .order('data_hora', { ascending: false });

    if (error) {
      throw new Error(`Erro ao buscar histórico: ${error.message}`);
    }

    return data;
  }

  // Estatísticas do dashboard
  static async obterEstatisticas(): Promise<DashboardStats> {
    // Total de atendimentos
    const { count: totalAtendimentos } = await supabase
      .from('atendimentos')
      .select('*', { count: 'exact', head: true });

    // Atendimentos urgentes
    const { count: atendimentosUrgentes } = await supabase
      .from('atendimentos')
      .select('*', { count: 'exact', head: true })
      .eq('prazo_urgencia', 'Urgente')
      .neq('status', 'Concluído');

    // Atendimentos próximos do prazo (3 dias)
    const dataLimite = new Date();
    dataLimite.setDate(dataLimite.getDate() + 3);
    const { count: atendimentosPrazo } = await supabase
      .from('atendimentos')
      .select('*', { count: 'exact', head: true })
      .lte('prazo_data', dataLimite.toISOString().split('T')[0])
      .neq('status', 'Concluído');

    // Atendimentos por status
    const { data: statusData } = await supabase
      .from('atendimentos')
      .select('status');
    
    const contagem: Record<string, number> = {};
    (statusData as any)?.forEach((item: any) => {
      contagem[item.status] = (contagem[item.status] || 0) + 1;
    });
    
    const porStatus = Object.entries(contagem).map(([status, quantidade]) => ({
      status,
      quantidade
    }));

    // Atendimentos por canal
    const { data: canalData } = await supabase
      .from('atendimentos')
      .select('canal');
    
    const canalContagem: Record<string, number> = {};
    (canalData as any)?.forEach((item: any) => {
      canalContagem[item.canal] = (canalContagem[item.canal] || 0) + 1;
    });
    
    const porCanal = Object.entries(canalContagem).map(([canal, quantidade]) => ({
      canal,
      quantidade
    }));

    // Atendimentos por secretaria
    const { data: secretariaData } = await supabase
      .from('atendimentos')
      .select('secretaria')
      .not('secretaria', 'is', null);
      
    const secretariaContagem: Record<string, number> = {};
    (secretariaData as any)?.forEach((item: any) => {
      if (item.secretaria) {
        secretariaContagem[item.secretaria] = (secretariaContagem[item.secretaria] || 0) + 1;
      }
    });
    
    const porSecretaria = Object.entries(secretariaContagem).map(([secretaria, quantidade]) => ({
      secretaria,
      quantidade
    }));

    // Atendimentos por urgência
    const { data: urgenciaData } = await supabase
      .from('atendimentos')
      .select('prazo_urgencia');
      
    const urgenciaContagem: Record<string, number> = {};
    (urgenciaData as any)?.forEach((item: any) => {
      urgenciaContagem[item.prazo_urgencia] = (urgenciaContagem[item.prazo_urgencia] || 0) + 1;
    });
    
    const porUrgencia = Object.entries(urgenciaContagem).map(([urgencia, quantidade]) => ({
      urgencia,
      quantidade
    }));

    return {
      total_atendimentos: totalAtendimentos || 0,
      atendimentos_urgentes: atendimentosUrgentes || 0,
      atendimentos_prazo: atendimentosPrazo || 0,
      atendimentos_por_status: porStatus,
      atendimentos_por_canal: porCanal,
      atendimentos_por_secretaria: porSecretaria,
      atendimentos_por_urgencia: porUrgencia
    };
  }

  // Subscrever a mudanças em tempo real
  static subscribeToChanges(callback: (payload: any) => void) {
    return supabase
      .channel('atendimentos-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'atendimentos' },
        callback
      )
      .subscribe();
  }
}