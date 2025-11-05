'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { MESSAGES } from '@/utils/messages';
import { maskPhone, validatePhone, maskCEP, validateCEP, buscarCEP, formatName } from '@/utils/formatters';
import { Loader2, X, MapPin, Phone, Mail, User, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Combobox } from '@/components/ui/combobox';
import { SECRETARIAS } from '@/types';

interface Contato {
  id?: string;
  nome: string;
  telefone: string;
  email?: string;
  secretaria?: string;
  cep?: string;
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  observacoes?: string;
}

interface ContatoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contato: Contato) => Promise<void>;
  contato?: Contato | null;
  mode: 'create' | 'edit';
}

export function ContatoModal({ isOpen, onClose, onSave, contato, mode }: ContatoModalProps) {
  const { showToast } = useToast();
  const [carregando, setCarregando] = useState(false);
  const [buscandoCEP, setBuscandoCEP] = useState(false);
  
  const [formData, setFormData] = useState<Contato>({
    nome: '',
    telefone: '',
    email: '',
    secretaria: '',
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    observacoes: '',
  });

  useEffect(() => {
    if (contato && mode === 'edit') {
      setFormData({
        ...contato,
        telefone: maskPhone(contato.telefone || ''),
        cep: maskCEP(contato.cep || ''),
        secretaria: contato.secretaria || '',
      });
    } else {
      setFormData({
        nome: '',
        telefone: '',
        email: '',
        secretaria: '',
        cep: '',
        rua: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        uf: '',
        observacoes: '',
      });
    }
  }, [contato, mode, isOpen]);

  const handleCEPBlur = async () => {
    const cepLimpo = formData.cep?.replace(/\D/g, '') || '';
    
    if (!cepLimpo || cepLimpo.length !== 8) return;
    
    if (!validateCEP(cepLimpo)) {
      showToast('CEP inválido', 'error');
      return;
    }
    
    setBuscandoCEP(true);
    
    try {
      const endereco = await buscarCEP(cepLimpo);
      
      if (endereco) {
        setFormData(prev => ({
          ...prev,
          rua: endereco.logradouro || prev.rua,
          bairro: endereco.bairro || prev.bairro,
          cidade: endereco.localidade || prev.cidade,
          uf: endereco.uf || prev.uf,
        }));
        
        showToast('CEP encontrado com sucesso', 'success');
      }
    } catch (error: any) {
      showToast(error.message || MESSAGES.ERROR.CEP_ERROR, 'error');
    } finally {
      setBuscandoCEP(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (!formData.nome?.trim()) {
      showToast('Nome é obrigatório', 'error');
      return;
    }

    if (!formData.telefone?.trim()) {
      showToast('Telefone é obrigatório', 'error');
      return;
    }
    
    const telefoneLimpo = formData.telefone.replace(/\D/g, '');
    if (!validatePhone(telefoneLimpo)) {
      showToast('Telefone inválido. Use o formato (##) #####-####', 'error');
      return;
    }
    
    if (formData.email && !formData.email.includes('@')) {
      showToast(MESSAGES.ERROR.INVALID_EMAIL, 'error');
      return;
    }

    // Validação de CEP se fornecido
    if (formData.cep) {
      const cepLimpo = formData.cep.replace(/\D/g, '');
      if (cepLimpo.length > 0 && !validateCEP(cepLimpo)) {
        showToast('CEP inválido. Use o formato #####-###', 'error');
        return;
      }
    }
    
    setCarregando(true);
    
    try {
      const dadosParaSalvar = {
        ...formData,
        nome: formatName(formData.nome.trim()),
        telefone: telefoneLimpo,
        email: formData.email?.trim() || undefined,
        secretaria: formData.secretaria?.trim() || undefined,
        cep: formData.cep?.replace(/\D/g, '').trim() || undefined,
        rua: formData.rua?.trim() || undefined,
        numero: formData.numero?.trim() || undefined,
        complemento: formData.complemento?.trim() || undefined,
        bairro: formData.bairro?.trim() || undefined,
        cidade: formData.cidade?.trim() || undefined,
        uf: formData.uf?.trim().toUpperCase() || undefined,
        observacoes: formData.observacoes?.trim() || undefined,
      };
      
      await onSave(dadosParaSalvar);
      
      showToast(
        mode === 'create' ? MESSAGES.SUCCESS.CONTATO_CREATED : MESSAGES.SUCCESS.CONTATO_UPDATED,
        'success'
      );
      
      onClose();
    } catch (error: any) {
      console.error('Erro ao salvar contato:', error);
      showToast(error.message || MESSAGES.ERROR.GENERIC, 'error');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1100]"
            onClick={onClose}
          />
          
          {/* Modal Container - Otimizado para mobile */}
          <div className="fixed inset-0 z-[1101] flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="rounded-t-3xl sm:rounded-2xl border-0 sm:border shadow-2xl dark:bg-neutral-800 dark:border-neutral-700 max-h-[95vh] sm:max-h-[90vh] flex flex-col">
                {/* Header - Fixo com área de toque maior */}
                <div className="flex-shrink-0 bg-white dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700 px-5 sm:px-6 py-4 rounded-t-3xl sm:rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 pr-12">
                      {mode === 'create' ? 'Novo Contato' : 'Editar Contato'}
                    </h2>
                    <button
                      onClick={onClose}
                      type="button"
                      className="absolute right-4 top-4 p-3 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-full transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95"
                      aria-label="Fechar modal"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Form - Scrollable */}
                <div className="flex-1 overflow-y-auto overscroll-contain px-5 sm:px-6 py-6">
                  <form onSubmit={handleSubmit} className="space-y-5" id="contact-form">
                    {/* Nome */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <User className="w-4 h-4 inline mr-2" />
                        Nome <span className="text-red-600" aria-label="obrigatório">*</span>
                      </label>
                      <Input
                        value={formData.nome}
                        onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                        placeholder="Nome completo"
                        required
                        aria-required="true"
                        autoComplete="name"
                        className="dark:bg-neutral-700 dark:border-neutral-600 dark:text-gray-100"
                      />
                    </div>

                    {/* Telefone e Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          <Phone className="w-4 h-4 inline mr-2" />
                          Telefone <span className="text-red-600" aria-label="obrigatório">*</span>
                        </label>
                        <Input
                          value={formData.telefone}
                          onChange={(e) => setFormData({ ...formData, telefone: maskPhone(e.target.value) })}
                          placeholder="(11) 98765-4321"
                          required
                          aria-required="true"
                          maxLength={15}
                          type="tel"
                          autoComplete="tel"
                          className="dark:bg-neutral-700 dark:border-neutral-600 dark:text-gray-100"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          <Mail className="w-4 h-4 inline mr-2" />
                          E-mail
                        </label>
                        <Input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="contato@email.com"
                          autoComplete="email"
                          className="dark:bg-neutral-700 dark:border-neutral-600 dark:text-gray-100"
                        />
                      </div>
                    </div>

                    {/* Secretaria */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <Building2 className="w-4 h-4 inline mr-2" />
                        Secretaria (opcional)
                      </label>
                      <Combobox
                        items={Array.from(SECRETARIAS)}
                        value={formData.secretaria || undefined}
                        onChange={(val) => setFormData({ ...formData, secretaria: val || '' })}
                        placeholder="Selecione a secretaria"
                      />
                    </div>

                    {/* CEP */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <MapPin className="w-4 h-4 inline mr-2" />
                        CEP
                      </label>
                      <div className="relative">
                        <Input
                          value={formData.cep}
                          onChange={(e) => setFormData({ ...formData, cep: maskCEP(e.target.value) })}
                          onBlur={handleCEPBlur}
                          placeholder="12345-678"
                          maxLength={9}
                          inputMode="numeric"
                          autoComplete="postal-code"
                          className="dark:bg-neutral-700 dark:border-neutral-600 dark:text-gray-100 pr-10"
                          aria-describedby="cep-help"
                        />
                        {buscandoCEP && (
                          <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
                        )}
                      </div>
                      {buscandoCEP && (
                        <p id="cep-help" className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                          {MESSAGES.INFO.SEARCHING_CEP}
                        </p>
                      )}
                    </div>

                    {/* Endereço */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Rua
                        </label>
                        <Input
                          value={formData.rua}
                          onChange={(e) => setFormData({ ...formData, rua: e.target.value })}
                          placeholder="Rua, Avenida, etc"
                          className="dark:bg-neutral-700 dark:border-neutral-600 dark:text-gray-100"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Número
                        </label>
                        <Input
                          value={formData.numero}
                          onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                          placeholder="123"
                          className="dark:bg-neutral-700 dark:border-neutral-600 dark:text-gray-100"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Complemento
                        </label>
                        <Input
                          value={formData.complemento}
                          onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
                          placeholder="Apto, Bloco, etc"
                          className="dark:bg-neutral-700 dark:border-neutral-600 dark:text-gray-100"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Bairro
                        </label>
                        <Input
                          value={formData.bairro}
                          onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                          placeholder="Nome do bairro"
                          className="dark:bg-neutral-700 dark:border-neutral-600 dark:text-gray-100"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Cidade
                        </label>
                        <Input
                          value={formData.cidade}
                          onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                          placeholder="Nome da cidade"
                          className="dark:bg-neutral-700 dark:border-neutral-600 dark:text-gray-100"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          UF
                        </label>
                        <Input
                          value={formData.uf}
                          onChange={(e) => setFormData({ ...formData, uf: e.target.value.toUpperCase() })}
                          placeholder="SP"
                          maxLength={2}
                          pattern="[A-Z]{2}"
                          autoComplete="address-level1"
                          className="dark:bg-neutral-700 dark:border-neutral-600 dark:text-gray-100 uppercase"
                        />
                      </div>
                    </div>

                    {/* Observações */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Observações
                      </label>
                      <textarea
                        value={formData.observacoes}
                        onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                        placeholder="Informações adicionais sobre o contato"
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-neutral-700 dark:text-gray-100"
                      />
                    </div>
                  </form>
                </div>

                {/* Botões - Fixos na parte inferior com pb-safe para iPhone */}
                <div className="flex-shrink-0 bg-white dark:bg-neutral-800 border-t border-gray-200 dark:border-neutral-700 px-5 sm:px-6 py-4 pb-safe">
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      onClick={onClose}
                      disabled={carregando}
                      className="flex-1 min-h-[44px] bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:text-gray-100"
                    >
                      Cancelar
                    </Button>
                    
                    <Button
                      type="submit"
                      form="contact-form"
                      disabled={carregando}
                      className="flex-1 min-h-[44px]"
                    >
                      {carregando ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Salvando...
                        </span>
                      ) : (
                        mode === 'create' ? 'Criar Contato' : 'Salvar Alterações'
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
