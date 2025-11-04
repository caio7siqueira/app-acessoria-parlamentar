import { createClient } from '@supabase/supabase-js';
import type { Contato, ContatoForm } from '@/types';

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

export class ContatosService {
  // Buscar todos os contatos
  static async buscarTodos(filtro?: string): Promise<Contato[]> {
    let query = supabase
      .from('contatos')
      .select('*')
      .order('secretaria', { ascending: true });

    if (filtro) {
      query = query.or(
        `secretaria.ilike.%${filtro}%,nome_responsavel.ilike.%${filtro}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erro ao buscar contatos: ${error.message}`);
    }

    return data || [];
  }

  // Buscar contato por ID
  static async buscarPorId(id: number): Promise<Contato | null> {
    const { data, error } = await supabase
      .from('contatos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Erro ao buscar contato: ${error.message}`);
    }

    return data;
  }

  // Buscar contatos por secretaria
  static async buscarPorSecretaria(secretaria: string): Promise<Contato[]> {
    const { data, error } = await supabase
      .from('contatos')
      .select('*')
      .eq('secretaria', secretaria)
      .order('nome_responsavel', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar contatos da secretaria: ${error.message}`);
    }

    return data || [];
  }

  // Criar novo contato
  static async criar(contato: ContatoForm): Promise<Contato> {
    const { data, error } = await supabase
      .from('contatos')
      .insert(contato as any)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar contato: ${error.message}`);
    }

    return data as Contato;
  }

  // Atualizar contato
  static async atualizar(id: number, contato: Partial<ContatoForm>): Promise<Contato> {
    const { data, error } = await supabase
      .from('contatos')
      .update(contato as any)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar contato: ${error.message}`);
    }

    return data as Contato;
  }

  // Excluir contato
  static async excluir(id: number): Promise<void> {
    const { error } = await supabase
      .from('contatos')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao excluir contato: ${error.message}`);
    }
  }

  // Obter lista de secretarias únicas
  static async obterSecretarias(): Promise<string[]> {
    const { data, error } = await supabase
      .from('contatos')
      .select('secretaria')
      .order('secretaria', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar secretarias: ${error.message}`);
    }

    // Remover duplicatas
    const secretariasUnicas = [...new Set((data as any)?.map((item: any) => item.secretaria) || [])] as string[];
    return secretariasUnicas;
  }

  // Funcionalidades de integração
  static gerarLinkWhatsApp(telefone: string, mensagem?: string): string {
    const telefoneFormatado = telefone.replace(/\D/g, '');
    const mensagemCodificada = mensagem ? encodeURIComponent(mensagem) : '';
    return `https://wa.me/55${telefoneFormatado}${mensagemCodificada ? `?text=${mensagemCodificada}` : ''}`;
  }

  static async copiarTelefone(telefone: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(telefone);
    } catch (error) {
      // Fallback para navegadores sem suporte ao clipboard
      const textArea = document.createElement('textarea');
      textArea.value = telefone;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }
}