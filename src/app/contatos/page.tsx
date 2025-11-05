"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ContatosService } from "@/services/contatosService";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Combobox } from "@/components/ui/combobox";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Phone, Mail, Building2, User, RefreshCcw, Plus, Edit, Trash2, Download, Loader2 } from "lucide-react";
import { ContatoModal } from "@/components/contatos/ContatoModal";
import { useToast } from "@/components/ui/toast";
import { MESSAGES } from "@/utils/messages";
import { Button } from "@/components/ui/button";
import { getSupabaseClient } from "@/services/supabaseClient";

export default function ContatosPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [busca, setBusca] = useLocalStorage<string>("contatos_busca", "");
  const [secretariaFiltro, setSecretariaFiltro] = useLocalStorage<string>(
    "contatos_secretaria",
    ""
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [contatoSelecionado, setContatoSelecionado] = useState<any>(null);
  const [contatoParaDeletar, setContatoParaDeletar] = useState<any>(null);

  const { data: secretarias } = useQuery({
    queryKey: ["contatos", "secretarias"],
    queryFn: () => ContatosService.obterSecretarias(),
  });

  const { data: contatos, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["contatos", busca, secretariaFiltro],
    queryFn: async () => {
      const supabase = getSupabaseClient();
      let query = supabase.from('contatos').select('*').order('nome', { ascending: true });
      
      if (busca) {
        query = query.or(`nome.ilike.%${busca}%,telefone.ilike.%${busca}%,email.ilike.%${busca}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  // Mutation para criar contato
  const criarContatoMutation = useMutation({
    mutationFn: async (contato: any) => {
      const supabase = getSupabaseClient();
      
      // Obter o usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');
      
      // Adicionar user_id ao contato
      const contatoComUser = {
        ...contato,
        user_id: user.id,
      };
      
      const { data, error } = await supabase.from('contatos').insert([contatoComUser] as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contatos'] });
      showToast(MESSAGES.SUCCESS.CONTATO_CREATED, 'success');
    },
    onError: (error: any) => {
      showToast(error.message || MESSAGES.ERROR.GENERIC, 'error');
    },
  });

  // Mutation para atualizar contato
  const atualizarContatoMutation = useMutation({
    mutationFn: async ({ id, ...contato }: any) => {
      const supabase = getSupabaseClient();
      // @ts-ignore
      const { data, error } = await supabase.from('contatos').update(contato).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contatos'] });
      showToast(MESSAGES.SUCCESS.CONTATO_UPDATED, 'success');
    },
    onError: (error: any) => {
      showToast(error.message || MESSAGES.ERROR.GENERIC, 'error');
    },
  });

  // Mutation para deletar contato
  const deletarContatoMutation = useMutation({
    mutationFn: async (id: string) => {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('contatos').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contatos'] });
      showToast(MESSAGES.SUCCESS.CONTATO_DELETED, 'success');
      setContatoParaDeletar(null);
    },
    onError: (error: any) => {
      showToast(error.message || MESSAGES.ERROR.GENERIC, 'error');
    },
  });

  const handleSaveContato = async (contato: any) => {
    if (modalMode === 'create') {
      await criarContatoMutation.mutateAsync(contato);
    } else {
      await atualizarContatoMutation.mutateAsync({ ...contato, id: contatoSelecionado.id });
    }
  };

  const handleEditContato = (contato: any) => {
    setContatoSelecionado(contato);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleNovoContato = () => {
    setContatoSelecionado(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleImportarContatos = async () => {
    // Tentar Contact Picker API (Chrome Android)
    if ('contacts' in navigator && 'ContactsManager' in window) {
      try {
        const props = ['name', 'tel', 'email'];
        // @ts-ignore - API experimental
        const contacts = await navigator.contacts.select(props, { multiple: true });
        
        const contatosParaImportar = contacts.map((c: any) => ({
          nome: c.name?.[0] || 'Sem nome',
          telefone: c.tel?.[0] || '',
          email: c.email?.[0] || '',
        }));
        
        for (const contato of contatosParaImportar) {
          await criarContatoMutation.mutateAsync(contato);
        }
        
        showToast(`${contatosParaImportar.length} contatos importados com sucesso!`, 'success');
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Erro ao importar contatos:', error);
          showToast('Erro ao importar contatos', 'error');
        }
      }
    } else {
      // Fallback para Safari iOS - mostrar aviso amigável
      showToast(
        'O Safari não permite importar contatos diretamente. Use o botão "Novo Contato" para adicionar manualmente.',
        'warning'
      );
    }
  };

  const handleCall = (tel: string) => (window.location.href = `tel:${tel}`);
  const handleEmail = (email: string) => (window.location.href = `mailto:${email}`);
  const handleWhatsApp = (tel: string) => {
    const numero = tel.replace(/\D/g, "");
    window.open(`https://wa.me/55${numero}`, "_blank");
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 pb-24 safe-area-bottom">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800 px-4 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Agenda de Contatos
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Seus contatos organizados</p>
            </div>

            <button
              onClick={() => refetch()}
              disabled={isRefetching}
              className="p-2 min-h-[44px] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors active:scale-95"
              aria-label="Atualizar contatos"
            >
              <RefreshCcw className={`w-5 h-5 ${isRefetching ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar contato..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-neutral-700 rounded-xl bg-gray-50 dark:bg-neutral-800 text-base text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all mobile-input"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-2">
            <Button
              onClick={handleNovoContato}
              className="flex-1 min-h-[44px] flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Novo Contato
            </Button>
            
            <Button
              onClick={handleImportarContatos}
              className="flex-1 min-h-[44px] flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Download className="w-4 h-4" />
              Importar
            </Button>
          </div>
        </div>

        {/* Cards List */}
        <div className="px-4 py-4 space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-neutral-800 rounded-xl p-4 animate-pulse border border-gray-100 dark:border-neutral-700"
                >
                  <div className="h-6 bg-gray-200 dark:bg-neutral-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-1/2 mb-3"></div>
                  <div className="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : contatos?.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-300 text-lg font-medium">
                Nenhum contato cadastrado ainda
              </p>
              <p className="text-gray-400 dark:text-gray-400 text-sm mt-1 mb-6">
                Adicione seu primeiro contato ou importe da sua agenda
              </p>
              <Button onClick={handleNovoContato} className="min-h-[44px]">
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Contato
              </Button>
            </div>
          ) : (
            contatos?.map((contato: any, index) => (
              <motion.div
                key={contato.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
                className="bg-white dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                {/* Header do Card */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {contato.nome}
                    </h3>
                    {contato.telefone && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2 mt-1">
                        <Phone className="w-4 h-4" />
                        {contato.telefone}
                      </p>
                    )}
                    {contato.email && (
                      <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2 mt-1 truncate">
                        <Mail className="w-4 h-4" />
                        {contato.email}
                      </p>
                    )}
                  </div>
                  
                  {/* Botões de Ação */}
                  <div className="flex gap-2 ml-3">
                    <button
                      onClick={() => handleEditContato(contato)}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      aria-label="Editar contato"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setContatoParaDeletar(contato)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      aria-label="Excluir contato"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Botões de Ação Rápida */}
                {contato.telefone && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCall(contato.telefone)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-white dark:bg-neutral-700 border border-gray-300 dark:border-neutral-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-600 transition-colors min-h-[44px]"
                    >
                      <Phone className="w-4 h-4" />
                      Ligar
                    </button>
                    <button
                      onClick={() => handleWhatsApp(contato.telefone)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors min-h-[44px]"
                    >
                      WhatsApp
                    </button>
                  </div>
                )}

                {/* Endereço */}
                {contato.rua && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-neutral-700">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                      Endereço
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {contato.rua}{contato.numero ? `, ${contato.numero}` : ''}
                      {contato.complemento && ` - ${contato.complemento}`}
                      {contato.bairro && <br />}
                      {contato.bairro} - {contato.cidade}/{contato.uf}
                      {contato.cep && <br />}
                      {contato.cep && `CEP: ${contato.cep}`}
                    </p>
                  </div>
                )}

                {/* Observações */}
                {contato.observacoes && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-neutral-700">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase mb-1">
                      Observações
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                      {contato.observacoes}
                    </p>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>

        {/* Modal de Confirmação de Exclusão */}
        <AnimatePresence>
          {contatoParaDeletar && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setContatoParaDeletar(null)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-x-4 top-1/2 -translate-y-1/2 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-md z-50"
              >
                <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-gray-200 dark:border-neutral-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Confirmar Exclusão
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Tem certeza que deseja excluir o contato <strong>{contatoParaDeletar.nome}</strong>?
                    Esta ação não pode ser desfeita.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setContatoParaDeletar(null)}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:text-gray-100 min-h-[44px]"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={() => deletarContatoMutation.mutate(contatoParaDeletar.id)}
                      disabled={deletarContatoMutation.isPending}
                      className="flex-1 bg-red-600 hover:bg-red-700 min-h-[44px]"
                    >
                      {deletarContatoMutation.isPending ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Excluindo...
                        </span>
                      ) : (
                        'Excluir'
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Modal de Criar/Editar Contato */}
        <ContatoModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSave={handleSaveContato}
          contato={contatoSelecionado}
          mode={modalMode}
        />
      </div>
    </DashboardLayout>
  );
}
