'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ContatosService } from '@/services/contatosService';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import type { Contato, ContatoForm } from '@/types';

export default function ContatosPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [busca, setBusca] = useState('');
  const [secretariaFiltro, setSecretariaFiltro] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState<Contato | null>(null);
  const [page, setPage] = useState(1);
  const itemsPorPagina = 10;

  const { data: secretarias } = useQuery({
    queryKey: ['contatos', 'secretarias'],
    queryFn: () => ContatosService.obterSecretarias(),
  });

  const { data: contatos, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['contatos', busca, secretariaFiltro],
    queryFn: async () => {
      const lista = await ContatosService.buscarTodos(busca);
      if (secretariaFiltro) {
        return lista.filter((c) => c.secretaria === secretariaFiltro);
      }
      return lista;
    },
  });

  const criarContato = useMutation({
    mutationFn: (payload: ContatoForm) => ContatosService.criar(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contatos'] });
      setShowForm(false);
      showToast('Contato criado com sucesso', 'success');
    },
    onError: (e: any) => showToast(e?.message || 'Erro ao criar contato', 'error'),
  });

  const atualizarContato = useMutation({
    mutationFn: ({ id, dados }: { id: number; dados: Partial<ContatoForm> }) =>
      ContatosService.atualizar(id, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contatos'] });
      setEditando(null);
      setShowForm(false);
      showToast('Contato atualizado com sucesso', 'success');
    },
    onError: (e: any) => showToast(e?.message || 'Erro ao atualizar contato', 'error'),
  });

  const excluirContato = useMutation({
    mutationFn: (id: number) => ContatosService.excluir(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contatos'] });
      showToast('Contato excluído com sucesso', 'success');
    },
    onError: (e: any) => showToast(e?.message || 'Erro ao excluir contato', 'error'),
  });

  const [form, setForm] = useState<ContatoForm>({
    secretaria: '',
    nome_responsavel: '',
    cargo: '',
    telefone1: '',
    telefone2: '',
    email: '',
    observacoes: '',
  });

  useEffect(() => {
    if (editando) {
      const { secretaria, nome_responsavel, cargo, telefone1, telefone2, email, observacoes } = editando;
      setForm({ secretaria: secretaria || '', nome_responsavel, cargo, telefone1, telefone2, email, observacoes });
      setShowForm(true);
    } else {
      setForm({ secretaria: '', nome_responsavel: '', cargo: '', telefone1: '', telefone2: '', email: '', observacoes: '' });
    }
  }, [editando]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editando) {
      await atualizarContato.mutateAsync({ id: editando.id, dados: form });
    } else {
      await criarContato.mutateAsync(form);
    }
  };

  const contatosFiltrados = contatos || [];

  // Paginação
  const totalPaginas = Math.ceil(contatosFiltrados.length / itemsPorPagina);
  const inicio = (page - 1) * itemsPorPagina;
  const fim = inicio + itemsPorPagina;
  const contatosPaginados = contatosFiltrados.slice(inicio, fim);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contatos</h1>
            <p className="text-gray-600">Gerencie os contatos das secretarias</p>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => { setEditando(null); setShowForm((s) => !s); }}>
              {showForm ? 'Fechar' : 'Novo Contato'}
            </Button>
            <Button variant="outline" onClick={() => refetch()}>
              Atualizar
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                placeholder="Buscar por secretaria ou responsável..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
            <div>
              <select
                className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
                value={secretariaFiltro}
                onChange={(e) => setSecretariaFiltro(e.target.value)}
              >
                <option value="">Todas as secretarias</option>
                {(secretarias || []).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setBusca(''); setSecretariaFiltro(''); }}>
                Limpar filtros
              </Button>
            </div>
          </div>
        </Card>

        {/* Formulário */}
        {showForm && (
          <Card className="p-6">
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={onSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secretaria</label>
                <Input value={form.secretaria} onChange={(e) => setForm({ ...form, secretaria: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Responsável</label>
                <Input value={form.nome_responsavel} onChange={(e) => setForm({ ...form, nome_responsavel: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                <Input value={form.cargo || ''} onChange={(e) => setForm({ ...form, cargo: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone 1</label>
                <Input value={form.telefone1 || ''} onChange={(e) => setForm({ ...form, telefone1: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone 2</label>
                <Input value={form.telefone2 || ''} onChange={(e) => setForm({ ...form, telefone2: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <Input type="email" value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea
                  className="block w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  value={form.observacoes || ''}
                  onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                />
              </div>
              <div className="md:col-span-2 flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditando(null); }}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={criarContato.isLoading || atualizarContato.isLoading}>
                  {editando ? 'Salvar alterações' : 'Criar contato'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Tabela */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Carregando contatos...</p>
            </div>
          ) : isError ? (
            <div className="p-8 text-center text-red-600">{(error as any)?.message || 'Erro ao carregar contatos'}</div>
          ) : contatosFiltrados.length === 0 ? (
            <div className="p-8 text-center text-gray-500">Nenhum contato encontrado</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Secretaria</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsável</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contato</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-mail</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contatosPaginados.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{c.secretaria}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{c.nome_responsavel}{c.cargo ? ` • ${c.cargo}` : ''}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex flex-col">
                          {c.telefone1 && (
                            <button
                              className="text-blue-600 hover:text-blue-800 text-left"
                              onClick={() => window.open(ContatosService.gerarLinkWhatsApp(c.telefone1!, `Olá ${c.nome_responsavel}`), '_blank')}
                            >
                              {c.telefone1}
                            </button>
                          )}
                          {c.telefone2 && (
                            <button
                              className="text-blue-600 hover:text-blue-800 text-left"
                              onClick={() => window.open(ContatosService.gerarLinkWhatsApp(c.telefone2!, `Olá ${c.nome_responsavel}`), '_blank')}
                            >
                              {c.telefone2}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{c.email || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Button variant="outline" onClick={() => setEditando(c)}>Editar</Button>
                        <Button
                          variant="outline"
                          onClick={async () => {
                            if (confirm('Deseja realmente excluir este contato?')) {
                              await excluirContato.mutateAsync(c.id);
                            }
                          }}
                        >
                          Excluir
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Paginação */}
        {contatosFiltrados.length > itemsPorPagina && (
          <div className="flex items-center justify-between bg-white px-6 py-3 rounded-lg shadow">
            <div className="text-sm text-gray-700">
              Mostrando {inicio + 1} a {Math.min(fim, contatosFiltrados.length)} de {contatosFiltrados.length} contatos
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Página {page} de {totalPaginas}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPaginas, p + 1))}
                disabled={page === totalPaginas}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}