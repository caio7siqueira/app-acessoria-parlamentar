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
import { MESSAGES } from '@/utils/messages';
import { motion } from 'framer-motion';
import { ArrowLeft, Trash2 } from 'lucide-react';

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
      showToast(MESSAGES.SUCCESS.ATENDIMENTO_UPDATED, 'success');
    },
    onError: (e: any) => {
      const msg = e?.message || MESSAGES.ERROR.ATENDIMENTO_SAVE;
      setErro(msg);
      showToast(msg, 'error');
    },
  });

  const excluir = useMutation({
    mutationFn: () => AtendimentosService.excluir(id),
    onSuccess: () => {
      showToast(MESSAGES.SUCCESS.ATENDIMENTO_DELETED, 'success');
      router.replace('/atendimentos');
    },
    onError: (e: any) => showToast(e?.message || MESSAGES.ERROR.ATENDIMENTO_DELETE, 'error'),
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setErro('');
    await atualizar.mutateAsync(form);
  };

  const handleDelete = async () => {
    if (confirm(MESSAGES.WARNING.CONFIRM_DELETE_ATENDIMENTO)) {
      // Vibração tátil no iPhone
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10);
      }
      await excluir.mutateAsync();
    }
  };

  if (!Number.isFinite(id)) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-safe">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Atendimento #{id}</h1>
            <p className="text-gray-600 dark:text-gray-400">Visualize e edite os detalhes do atendimento</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <motion.div whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
              <Button
                variant="outline"
                onClick={() => {
                  if (typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate(10);
                  }
                  router.back();
                }}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-600 active:scale-95 transition-all duration-200 ease-in-out rounded-xl px-4 py-2 text-sm font-medium flex items-center gap-2 min-h-[44px]"
                aria-label="Voltar para lista de atendimentos"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
            </motion.div>
            <motion.div whileTap={{ scale: 0.95 }} transition={{ duration: 0.2 }}>
              <Button
                variant="outline"
                onClick={handleDelete}
                className="bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 active:scale-95 transition-all duration-200 ease-in-out rounded-xl px-4 py-2 text-sm font-medium flex items-center gap-2 min-h-[44px]"
                aria-label="Excluir atendimento"
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </Button>
            </motion.div>
          </div>
        </div>

        {isLoading || !form ? (
          <div className="bg-white dark:bg-neutral-800 shadow rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500 dark:text-gray-400">{MESSAGES.INFO.LOADING}</p>
          </div>
        ) : isError ? (
          <Card className="p-6">{MESSAGES.ERROR.ATENDIMENTO_LOAD}</Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulário */}
            <Card className="p-6 lg:col-span-2 dark:bg-neutral-800 dark:border-neutral-700">
              {isConcluido && (
                <div className="mb-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 px-4 py-2 rounded">
                  ⓘ {MESSAGES.WARNING.ATENDIMENTO_CONCLUIDO}
                </div>
              )}
              {erro && <div className="mb-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 px-4 py-2 rounded">{erro}</div>}
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={onSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
                  <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required disabled={isConcluido} className="dark:bg-neutral-700 dark:border-neutral-600 dark:text-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gênero</label>
                  <select className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 dark:text-gray-100" value={form.genero} onChange={(e) => setForm({ ...form, genero: e.target.value as any })} disabled={isConcluido}>
                    <option>Masculino</option>
                    <option>Feminino</option>
                    <option>Não informado</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Endereço</label>
                  <Input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} disabled={isConcluido} className="dark:bg-neutral-700 dark:border-neutral-600 dark:text-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Idade</label>
                  <Input type="number" value={form.idade || ''} onChange={(e) => setForm({ ...form, idade: Number(e.target.value) })} disabled={isConcluido} className="dark:bg-neutral-700 dark:border-neutral-600 dark:text-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefone</label>
                  <Input value={form.telefone || ''} onChange={(e) => setForm({ ...form, telefone: e.target.value })} disabled={isConcluido} className="dark:bg-neutral-700 dark:border-neutral-600 dark:text-gray-100" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Solicitação</label>
                  <textarea className="block w-full border border-gray-300 dark:border-neutral-600 rounded-md p-2 text-sm dark:bg-neutral-700 dark:text-gray-100" rows={3} value={form.solicitacao} onChange={(e) => setForm({ ...form, solicitacao: e.target.value })} disabled={isConcluido} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prazo (data)</label>
                  <Input type="date" value={form.prazo_data || ''} onChange={(e) => setForm({ ...form, prazo_data: e.target.value })} disabled={isConcluido} className="dark:bg-neutral-700 dark:border-neutral-600 dark:text-gray-100" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Urgência</label>
                  <select className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 dark:text-gray-100" value={form.prazo_urgencia} onChange={(e) => setForm({ ...form, prazo_urgencia: e.target.value as any })} disabled={isConcluido}>
                    {URGENCIAS.map(u => (<option key={u} value={u}>{u}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Encaminhamento</label>
                  <select className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 dark:text-gray-100" value={form.encaminhamento} onChange={(e) => setForm({ ...form, encaminhamento: e.target.value as any })} disabled={isConcluido}>
                    {TIPOS_ENCAMINHAMENTO.map(t => (<option key={t} value={t}>{t}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Secretaria</label>
                  <select className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 dark:text-gray-100" value={form.secretaria || ''} onChange={(e) => setForm({ ...form, secretaria: e.target.value })} disabled={isConcluido}>
                    <option value="">Não se aplica</option>
                    {SECRETARIAS.map(s => (<option key={s} value={s}>{s}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 dark:text-gray-100" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
                    {STATUS_ATENDIMENTO.map(s => (<option key={s} value={s}>{s}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Canal</label>
                  <select className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 dark:text-gray-100" value={form.canal} onChange={(e) => setForm({ ...form, canal: e.target.value as any })} disabled={isConcluido}>
                    {CANAIS.map(c => (<option key={c} value={c}>{c}</option>))}
                  </select>
                </div>
                <div className="md:col-span-2 flex justify-end gap-2">
                  <Button type="submit" disabled={atualizar.isLoading || isConcluido} className="min-h-[44px]">{atualizar.isLoading ? MESSAGES.INFO.SAVING : 'Salvar alterações'}</Button>
                </div>
              </form>
            </Card>

            {/* Histórico */}
            <Card className="p-6 dark:bg-neutral-800 dark:border-neutral-700">
              <h3 className="text-lg font-semibold mb-4 dark:text-gray-100">Histórico</h3>
              {!historico || (historico as any).length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">{MESSAGES.INFO.NO_HISTORY}</p>
              ) : (
                <ul className="space-y-3">
                  {(historico as any).map((h: any) => (
                    <li key={h.id} className="text-sm text-gray-700 dark:text-gray-300">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{h.campo_alterado}</span>
                        <span className="text-gray-500 dark:text-gray-400">{new Date(h.data_hora).toLocaleString()}</span>
                      </div>
                      {h.valor_anterior && h.valor_novo && (
                        <p className="text-gray-600 dark:text-gray-400">{h.valor_anterior} → {h.valor_novo}</p>
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