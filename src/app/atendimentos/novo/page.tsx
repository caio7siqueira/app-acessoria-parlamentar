'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AtendimentosService } from '@/services/atendimentosService';
import type { AtendimentoForm } from '@/types';
import { CANAIS, STATUS_ATENDIMENTO, TIPOS_ENCAMINHAMENTO, URGENCIAS, SECRETARIAS } from '@/types';
import { useToast } from '@/components/ui/toast';
import { MESSAGES } from '@/utils/messages';

export default function NovoAtendimentoPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [erro, setErro] = useState('');
  const [form, setForm] = useState<AtendimentoForm>({
    nome: '',
    genero: 'Não informado',
    endereco: '',
    idade: undefined,
    telefone: '',
    solicitacao: '',
    prazo_data: '',
    prazo_urgencia: 'Baixa',
    encaminhamento: 'Secretaria',
    secretaria: '',
    status: 'Pendente',
    canal: 'Presencial',
  });

  const criar = useMutation({
    mutationFn: (dados: AtendimentoForm) => AtendimentosService.criar(dados),
    onSuccess: (novo) => {
      showToast(MESSAGES.SUCCESS.ATENDIMENTO_CREATED, 'success');
      router.replace('/atendimentos');
    },
    onError: (e: any) => {
      const msg = e?.message || MESSAGES.ERROR.ATENDIMENTO_SAVE;
      setErro(msg);
      showToast(msg, 'error');
    },
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    await criar.mutateAsync(form);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Novo Atendimento</h1>
          <p className="text-gray-600">Cadastre um novo atendimento no sistema</p>
        </div>

        <Card className="p-6">
          {erro && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded">{erro}</div>
          )}

          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={onSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gênero</label>
              <select className="input" value={form.genero} onChange={(e) => setForm({ ...form, genero: e.target.value as any })}>
                <option>Masculino</option>
                <option>Feminino</option>
                <option>Não informado</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
              <Input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Idade</label>
              <Input type="number" value={form.idade || ''} onChange={(e) => setForm({ ...form, idade: Number(e.target.value) })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <Input value={form.telefone || ''} onChange={(e) => setForm({ ...form, telefone: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Solicitação</label>
              <textarea
                className="block w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                value={form.solicitacao}
                onChange={(e) => setForm({ ...form, solicitacao: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prazo (data)</label>
              <Input type="date" value={form.prazo_data || ''} onChange={(e) => setForm({ ...form, prazo_data: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Urgência</label>
              <select className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white" value={form.prazo_urgencia} onChange={(e) => setForm({ ...form, prazo_urgencia: e.target.value as any })}>
                {URGENCIAS.map(u => (<option key={u} value={u}>{u}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Encaminhamento</label>
              <select className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white" value={form.encaminhamento} onChange={(e) => setForm({ ...form, encaminhamento: e.target.value as any })}>
                {TIPOS_ENCAMINHAMENTO.map(t => (<option key={t} value={t}>{t}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Secretaria</label>
              <select className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white" value={form.secretaria || ''} onChange={(e) => setForm({ ...form, secretaria: e.target.value })}>
                <option value="">Não se aplica</option>
                {SECRETARIAS.map(s => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}>
                {STATUS_ATENDIMENTO.map(s => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Canal</label>
              <select className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white" value={form.canal} onChange={(e) => setForm({ ...form, canal: e.target.value as any })}>
                {CANAIS.map(c => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
              <Button type="submit" disabled={criar.isLoading}>{criar.isLoading ? 'Salvando...' : 'Salvar'}</Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}