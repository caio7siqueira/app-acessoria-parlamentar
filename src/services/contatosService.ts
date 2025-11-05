import type { Contato, ContatoForm } from '@/types';
import { getSupabaseClient } from '@/services/supabaseClient';

const supabase = getSupabaseClient() as any;

export class ContatosService {
  // Buscar todos os contatos
  static async buscarTodos(filtro?: string, secretaria?: string): Promise<Contato[]> {
    let query = supabase
      .from('contatos')
      .select('*')
      .order('nome', { ascending: true });

    if (filtro) {
      query = query.or(
        `nome.ilike.%${filtro}%,email.ilike.%${filtro}%,cidade.ilike.%${filtro}%`
      );
    }

    if (secretaria) {
      query = query.eq('secretaria', secretaria);
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
      .order('nome', { ascending: true });

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
      .not('secretaria', 'is', null)
      .order('secretaria', { ascending: true });

    if (error) {
      throw new Error(`Erro ao buscar secretarias: ${error.message}`);
    }

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