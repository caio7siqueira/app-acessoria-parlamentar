'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AtendimentosService } from '@/services/atendimentosService';
import type { AtendimentoForm } from '@/types';
import { CANAIS, STATUS_ATENDIMENTO, TIPOS_ENCAMINHAMENTO, URGENCIAS, SECRETARIAS } from '@/types';
import { useToast } from '@/components/ui/toast';

export default function AtendimentoDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const id = Number(params?.id);

  const { data: atendimento, isLoading, isError } = useQuery({
    queryKey: ['atendimento', id],
    queryFn: () => AtendimentosService.buscarPorId(id),
    enabled: Number.isFinite(id),
  });

  const { data: historico } = useQuery({
    queryKey: ['atendimento', id, 'historico'],
    queryFn: () => AtendimentosService.buscarHistorico(id),
    enabled: Number.isFinite(id),
  });

  const [form, setForm] = useState<AtendimentoForm | null>(null);
  const [erro, setErro] = useState('');

  const isConcluido = atendimento?.status === 'Concluído';

  useEffect(() => {
    if (atendimento) {
      const { nome, genero, endereco, idade, telefone, solicitacao, prazo_data, prazo_urgencia, encaminhamento, secretaria, status, canal } = atendimento as any;
      setForm({ nome, genero, endereco, idade, telefone, solicitacao, prazo_data, prazo_urgencia, encaminhamento, secretaria, status, canal });
    }
  }, [atendimento]);

  const atualizar = useMutation({
    mutationFn: (dados: Partial<AtendimentoForm>) => AtendimentosService.atualizar(id, dados),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['atendimento', id] });
      showToast('Atendimento atualizado com sucesso', 'success');
    },
    onError: (e: any) => {
      const msg = e?.message || 'Erro ao salvar';
      setErro(msg);
      showToast(msg, 'error');
    },
  });

  const excluir = useMutation({
    mutationFn: () => AtendimentosService.excluir(id),
    onSuccess: () => {
      showToast('Atendimento excluído com sucesso', 'success');
      router.replace('/atendimentos');
    },
    onError: (e: any) => showToast(e?.message || 'Erro ao excluir', 'error'),
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setErro('');
    await atualizar.mutateAsync(form);
  };

  if (!Number.isFinite(id)) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Atendimento #{id}</h1>
            <p className="text-gray-600">Visualize e edite os detalhes do atendimento</p>
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => router.back()}>Voltar</Button>
            <Button variant="outline" onClick={async () => { if (confirm('Excluir este atendimento?')) await excluir.mutateAsync(); }}>Excluir</Button>
          </div>
        </div>

        {isLoading || !form ? (
          <div className="bg-white shadow rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Carregando...</p>
          </div>
        ) : isError ? (
          <Card className="p-6">Erro ao carregar atendimento.</Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulário */}
            <Card className="p-6 lg:col-span-2">
              {isConcluido && (
                <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded">
                  ⓘ Este atendimento está concluído. Campos principais estão bloqueados para edição.
                </div>
              )}
              {erro && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded">{erro}</div>}
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={onSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required disabled={isConcluido} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gênero</label>
                  <select className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md bg-white" value={form.genero} onChange={(e) => setForm({ ...form, genero: e.target.value as any })} disabled={isConcluido}>
                    <option>Masculino</option>
                    <option>Feminino</option>
                    <option>Não informado</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                  <Input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} disabled={isConcluido} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Idade</label>
                  <Input type="number" value={form.idade || ''} onChange={(e) => setForm({ ...form, idade: Number(e.target.value) })} disabled={isConcluido} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <Input value={form.telefone || ''} onChange={(e) => setForm({ ...form, telefone: e.target.value })} disabled={isConcluido} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Solicitação</label>
                  <textarea className="block w-full border border-gray-300 rounded-md p-2 text-sm" rows={3} value={form.solicitacao} onChange={(e) => setForm({ ...form, solicitacao: e.target.value })} disabled={isConcluido} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prazo (data)</label>
                  <Input type="date" value={form.prazo_data || ''} onChange={(e) => setForm({ ...form, prazo_data: e.target.value })} disabled={isConcluido} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Urgência</label>
                  <select className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md bg-white" value={form.prazo_urgencia} onChange={(e) => setForm({ ...form, prazo_urgencia: e.target.value as any })} disabled={isConcluido}>
                    {URGENCIAS.map(u => (<option key={u} value={u}>{u}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Encaminhamento</label>
                  <select className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md bg-white" value={form.encaminhamento} onChange={(e) => setForm({ ...form, encaminhamento: e.target.value as any })} disabled={isConcluido}>
                    {TIPOS_ENCAMINHAMENTO.map(t => (<option key={t} value={t}>{t}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Secretaria</label>
                  <select className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md bg-white" value={form.secretaria || ''} onChange={(e) => setForm({ ...form, secretaria: e.target.value })} disabled={isConcluido}>
                    <option value="">Não se aplica</option>
                    {SECRETARIAS.map(s => (<option key={s} value={s}>{s}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md bg-white" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
                    {STATUS_ATENDIMENTO.map(s => (<option key={s} value={s}>{s}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Canal</label>
                  <select className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md bg-white" value={form.canal} onChange={(e) => setForm({ ...form, canal: e.target.value as any })} disabled={isConcluido}>
                    {CANAIS.map(c => (<option key={c} value={c}>{c}</option>))}
                  </select>
                </div>
                <div className="md:col-span-2 flex justify-end gap-2">
                  <Button type="submit" disabled={atualizar.isLoading || isConcluido}>{atualizar.isLoading ? 'Salvando...' : 'Salvar alterações'}</Button>
                </div>
              </form>
            </Card>

            {/* Histórico */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Histórico</h3>
              {!historico || (historico as any).length === 0 ? (
                <p className="text-sm text-gray-500">Nenhum evento registrado.</p>
              ) : (
                <ul className="space-y-3">
                  {(historico as any).map((h: any) => (
                    <li key={h.id} className="text-sm text-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{h.campo_alterado}</span>
                        <span className="text-gray-500">{new Date(h.data_hora).toLocaleString()}</span>
                      </div>
                      {h.valor_anterior && h.valor_novo && (
                        <p className="text-gray-600">{h.valor_anterior} → {h.valor_novo}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}