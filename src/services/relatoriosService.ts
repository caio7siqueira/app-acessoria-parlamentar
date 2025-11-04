import { createClient } from '@supabase/supabase-js';
import type { RelatorioParams } from '@/types';

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

export class RelatoriosService {
  // Gerar relatório de atendimentos
  static async gerarRelatorio(params: RelatorioParams) {
    let query = supabase
      .from('atendimentos')
      .select('*')
      .gte('data_criacao', params.data_inicio)
      .lte('data_criacao', params.data_fim)
      .order('data_criacao', { ascending: false });

    // Aplicar filtros opcionais
    if (params.secretarias && params.secretarias.length > 0) {
      query = query.in('secretaria', params.secretarias);
    }

    if (params.status && params.status.length > 0) {
      query = query.in('status', params.status);
    }

    if (params.urgencia && params.urgencia.length > 0) {
      query = query.in('prazo_urgencia', params.urgencia);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao gerar relatório: ${error.message}`);
    }

    return data || [];
  }

  // Exportar para PDF
  static async exportarPDF(params: RelatorioParams): Promise<Blob> {
    const response = await fetch('/api/relatorios/pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('Erro ao gerar PDF');
    }

    return response.blob();
  }

  // Exportar para Excel
  static async exportarExcel(params: RelatorioParams): Promise<Blob> {
    const response = await fetch('/api/relatorios/excel', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error('Erro ao gerar Excel');
    }

    return response.blob();
  }

  // Baixar arquivo
  static baixarArquivo(blob: Blob, nomeArquivo: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nomeArquivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Obter estatísticas do relatório
  static async obterEstatisticasRelatorio(params: Omit<RelatorioParams, 'formato'>) {
    const dados = await this.gerarRelatorio({ ...params, formato: 'pdf' }) as any[];

    // Calcular estatísticas
    const totalAtendimentos = dados.length;
    
    const porStatus = dados.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const porUrgencia = dados.reduce((acc, item) => {
      acc[item.prazo_urgencia] = (acc[item.prazo_urgencia] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const porCanal = dados.reduce((acc, item) => {
      acc[item.canal] = (acc[item.canal] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const porSecretaria = dados.reduce((acc, item) => {
      if (item.secretaria) {
        acc[item.secretaria] = (acc[item.secretaria] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const atendimentosUrgentes = dados.filter(
      item => item.prazo_urgencia === 'Urgente' && item.status !== 'Concluído'
    ).length;

    const atendimentosConcluidos = dados.filter(
      item => item.status === 'Concluído'
    ).length;

    const taxaConclusao = totalAtendimentos > 0 ? 
      Math.round((atendimentosConcluidos / totalAtendimentos) * 100) : 0;

    return {
      periodo: {
        inicio: params.data_inicio,
        fim: params.data_fim
      },
      resumo: {
        total_atendimentos: totalAtendimentos,
        atendimentos_urgentes: atendimentosUrgentes,
        atendimentos_concluidos: atendimentosConcluidos,
        taxa_conclusao: taxaConclusao
      },
      distribuicao: {
        por_status: Object.entries(porStatus).map(([status, quantidade]) => ({
          status,
          quantidade: quantidade as number,
          percentual: Math.round(((quantidade as number) / totalAtendimentos) * 100)
        })),
        por_urgencia: Object.entries(porUrgencia).map(([urgencia, quantidade]) => ({
          urgencia,
          quantidade: quantidade as number,
          percentual: Math.round(((quantidade as number) / totalAtendimentos) * 100)
        })),
        por_canal: Object.entries(porCanal).map(([canal, quantidade]) => ({
          canal,
          quantidade: quantidade as number,
          percentual: Math.round(((quantidade as number) / totalAtendimentos) * 100)
        })),
        por_secretaria: Object.entries(porSecretaria).map(([secretaria, quantidade]) => ({
          secretaria,
          quantidade: quantidade as number,
          percentual: Math.round(((quantidade as number) / totalAtendimentos) * 100)
        }))
      }
    };
  }
}