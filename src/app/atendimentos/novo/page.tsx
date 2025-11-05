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
import { maskPhone, validatePhone, maskCEP, validateCEP, buscarCEP, formatName } from '@/utils/formatters';
import { Loader2, MapPin } from 'lucide-react';

export default function NovoAtendimentoPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [erro, setErro] = useState('');
  const [buscandoCEP, setBuscandoCEP] = useState(false);
  const [form, setForm] = useState<AtendimentoForm & {
    cep?: string;
    rua?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
  }>({
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
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
  });

  const criar = useMutation({
    mutationFn: (dados: any) => {
      // Remover campos vazios de data
      const dadosLimpos = { ...dados };
      if (!dadosLimpos.prazo_data) {
        delete dadosLimpos.prazo_data;
      }
      
      // Construir endereço completo
      const enderecoCompleto = [
        dadosLimpos.rua,
        dadosLimpos.numero,
        dadosLimpos.complemento,
        dadosLimpos.bairro,
        dadosLimpos.cidade,
        dadosLimpos.uf
      ].filter(Boolean).join(', ');
      
      dadosLimpos.endereco = enderecoCompleto || dadosLimpos.endereco;
      
      return AtendimentosService.criar(dadosLimpos);
    },
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

  const handleCEPBlur = async () => {
    if (!form.cep) return;
    
    if (!validateCEP(form.cep)) {
      showToast(MESSAGES.VALIDATION.INVALID_CEP, 'error');
      return;
    }
    
    setBuscandoCEP(true);
    const resultado = await buscarCEP(form.cep);
    setBuscandoCEP(false);
    
    if (resultado) {
      setForm(prev => ({
        ...prev,
        rua: resultado.logradouro,
        bairro: resultado.bairro,
        cidade: resultado.localidade,
        uf: resultado.uf,
      }));
      showToast('Endereço encontrado!', 'success');
    } else {
      showToast(MESSAGES.ERROR.CEP_NOT_FOUND, 'error');
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    
    // Validações
    if (!form.nome?.trim()) {
      showToast('Nome é obrigatório', 'error');
      return;
    }
    
    if (!form.telefone?.trim()) {
      showToast('Telefone é obrigatório', 'error');
      return;
    }
    
    if (!validatePhone(form.telefone)) {
      showToast(MESSAGES.VALIDATION.INVALID_PHONE, 'error');
      return;
    }
    
    if (!form.solicitacao?.trim()) {
      showToast('Solicitação é obrigatória', 'error');
      return;
    }
    
    await criar.mutateAsync(form);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-safe">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Novo Atendimento</h1>
          <p className="text-gray-600 dark:text-gray-400">Cadastre um novo atendimento no sistema</p>
        </div>

        <Card className="p-4 md:p-6 dark:bg-neutral-800 dark:border-neutral-700">
          {erro && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 px-4 py-2 rounded">{erro}</div>
          )}

          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={onSubmit}>
            {/* Nome - OBRIGATÓRIO */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nome <span className="text-red-600">*</span>
              </label>
              <Input 
                value={form.nome} 
                onChange={(e) => setForm({ ...form, nome: formatName(e.target.value) })} 
                required 
                placeholder="Nome completo"
                className="dark:bg-neutral-700 dark:border-neutral-600 dark:text-gray-100"
              />
            </div>
            
            {/* Gênero */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gênero</label>
              <select 
                className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-700 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                value={form.genero} 
                onChange={(e) => setForm({ ...form, genero: e.target.value as any })}
              >
                <option>Masculino</option>
                <option>Feminino</option>
                <option>Não informado</option>
              </select>
            </div>
            
            {/* Idade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Idade</label>
              <Input 
                type="number" 
                min="0"
                max="150"
                value={form.idade || ''} 
                onChange={(e) => setForm({ ...form, idade: e.target.value ? Number(e.target.value) : undefined })} 
                placeholder="Idade"
                className="dark:bg-neutral-700 dark:border-neutral-600 dark:text-gray-100"
              />
            </div>
            
            {/* Telefone - OBRIGATÓRIO */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Telefone <span className="text-red-600">*</span>
              </label>
              <Input 
                value={form.telefone || ''} 
                onChange={(e) => setForm({ ...form, telefone: maskPhone(e.target.value) })} 
                required
                placeholder="(11) 98765-4321"
                maxLength={15}
                className="dark:bg-neutral-700 dark:border-neutral-600 dark:text-gray-100"
              />
            </div>

            {/* CEP */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                CEP {buscandoCEP && <span className="text-blue-600 text-xs ml-2">(Buscando...)</span>}
              </label>
              <div className="relative">
                <Input 
                  value={form.cep || ''} 
                  onChange={(e) => setForm({ ...form, cep: maskCEP(e.target.value) })} 
                  onBlur={handleCEPBlur}
                  placeholder="12345-678"
                  maxLength={9}
                  className="dark:bg-neutral-700 dark:border-neutral-600 dark:text-gray-100 pr-10"
                />
                {buscandoCEP && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-blue-600" />
                )}
                {!buscandoCEP && form.cep && (
                  <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>

            {/* Rua */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rua/Logradouro</label>
              <Input 
                value={form.rua || ''} 
                onChange={(e) => setForm({ ...form, rua: e.target.value })} 
                placeholder="Rua, Avenida, etc."
                className="dark:bg-neutral-700 dark:border-neutral-600 dark:text-gray-100"
              />
            </div>

            {/* Número e Complemento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Número</label>
              <Input 
                value={form.numero || ''} 
                onChange={(e) => setForm({ ...form, numero: e.target.value })} 
                placeholder="123"
                className="dark:bg-neutral-700 dark:border-neutral-600 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Complemento</label>
              <Input 
                value={form.complemento || ''} 
                onChange={(e) => setForm({ ...form, complemento: e.target.value })} 
                placeholder="Apto, Bloco, etc."
                className="dark:bg-neutral-700 dark:border-neutral-600 dark:text-gray-100"
              />
            </div>

            {/* Bairro */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bairro</label>
              <Input 
                value={form.bairro || ''} 
                onChange={(e) => setForm({ ...form, bairro: e.target.value })} 
                placeholder="Bairro"
                className="dark:bg-neutral-700 dark:border-neutral-600 dark:text-gray-100"
              />
            </div>

            {/* Cidade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cidade</label>
              <Input 
                value={form.cidade || ''} 
                onChange={(e) => setForm({ ...form, cidade: e.target.value })} 
                placeholder="Cidade"
                className="dark:bg-neutral-700 dark:border-neutral-600 dark:text-gray-100"
              />
            </div>

            {/* UF */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado (UF)</label>
              <Input 
                value={form.uf || ''} 
                onChange={(e) => setForm({ ...form, uf: e.target.value.toUpperCase() })} 
                placeholder="SP"
                maxLength={2}
                className="dark:bg-neutral-700 dark:border-neutral-600 dark:text-gray-100"
              />
            </div>

            {/* Solicitação - OBRIGATÓRIO */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Solicitação <span className="text-red-600">*</span>
              </label>
              <textarea
                className="block w-full border border-gray-300 dark:border-neutral-600 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-700 dark:text-gray-100"
                rows={3}
                value={form.solicitacao}
                onChange={(e) => setForm({ ...form, solicitacao: e.target.value })}
                required
                placeholder="Descreva a solicitação do cidadão..."
              />
            </div>
            
            {/* Prazo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Prazo (data)</label>
              <Input 
                type="date" 
                value={form.prazo_data || ''} 
                onChange={(e) => setForm({ ...form, prazo_data: e.target.value })} 
                className="dark:bg-neutral-700 dark:border-neutral-600 dark:text-gray-100"
              />
            </div>
            
            {/* Urgência */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Urgência</label>
              <select 
                className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-700 dark:text-gray-100" 
                value={form.prazo_urgencia} 
                onChange={(e) => setForm({ ...form, prazo_urgencia: e.target.value as any })}
              >
                {URGENCIAS.map(u => (<option key={u} value={u}>{u}</option>))}
              </select>
            </div>
            
            {/* Encaminhamento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Encaminhamento</label>
              <select 
                className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-700 dark:text-gray-100" 
                value={form.encaminhamento} 
                onChange={(e) => setForm({ ...form, encaminhamento: e.target.value as any })}
              >
                {TIPOS_ENCAMINHAMENTO.map(t => (<option key={t} value={t}>{t}</option>))}
              </select>
            </div>
            
            {/* Secretaria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Secretaria</label>
              <select 
                className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-700 dark:text-gray-100" 
                value={form.secretaria || ''} 
                onChange={(e) => setForm({ ...form, secretaria: e.target.value })}
              >
                <option value="">Não se aplica</option>
                {SECRETARIAS.map(s => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
            
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <select 
                className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-700 dark:text-gray-100" 
                value={form.status} 
                onChange={(e) => setForm({ ...form, status: e.target.value as any })}
              >
                {STATUS_ATENDIMENTO.map(s => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
            
            {/* Canal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Canal</label>
              <select 
                className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-neutral-700 dark:text-gray-100" 
                value={form.canal} 
                onChange={(e) => setForm({ ...form, canal: e.target.value as any })}
              >
                {CANAIS.map(c => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>

            {/* Botões */}
            <div className="md:col-span-2 flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.back()}
                className="min-h-[44px] dark:border-neutral-600 dark:text-gray-200"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={criar.isLoading}
                className="min-h-[44px]"
              >
                {criar.isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {MESSAGES.INFO.SAVING}
                  </span>
                ) : 'Salvar'}
              </Button>
            </div>

            {/* Legenda campos obrigatórios */}
            <div className="md:col-span-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="text-red-600">*</span> Campos obrigatórios
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}