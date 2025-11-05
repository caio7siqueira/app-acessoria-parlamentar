'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/toast';
import { MESSAGES } from '@/utils/messages';
import { validatePassword } from '@/utils/formatters';
import { getSupabaseClient } from '@/services/supabaseClient';
import { Loader2, Eye, EyeOff, Check, X } from 'lucide-react';

export default function DefinirSenhaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirma, setMostrarConfirma] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [tokenValido, setTokenValido] = useState(true);

  useEffect(() => {
    // Verificar se tem token no parâmetro
    const token = searchParams?.get('token');
    const type = searchParams?.get('type');
    
    if (!token || type !== 'invite') {
      setTokenValido(false);
      showToast(MESSAGES.ERROR.INVALID_TOKEN, 'error');
    }
  }, [searchParams, showToast]);

  const validacaoSenha = validatePassword(senha);
  const senhasConferem = senha && confirmaSenha && senha === confirmaSenha;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!senha || !confirmaSenha) {
      showToast(MESSAGES.VALIDATION.REQUIRED_FIELDS, 'error');
      return;
    }
    
    if (!validacaoSenha.valid) {
      showToast(validacaoSenha.message, 'error');
      return;
    }
    
    if (senha !== confirmaSenha) {
      showToast(MESSAGES.ERROR.PASSWORD_MISMATCH, 'error');
      return;
    }
    
    setCarregando(true);
    
    try {
      const supabase = getSupabaseClient();
      
      // Atualizar senha do usuário
      const { error } = await supabase.auth.updateUser({
        password: senha,
      });
      
      if (error) {
        throw error;
      }
      
      showToast(MESSAGES.INFO.PASSWORD_CREATED, 'success');
      
      // Redirecionar para dashboard após 2 segundos
      setTimeout(() => {
        router.push('/atendimentos');
      }, 2000);
      
    } catch (error: any) {
      console.error('Erro ao definir senha:', error);
      showToast(error.message || MESSAGES.ERROR.GENERIC, 'error');
    } finally {
      setCarregando(false);
    }
  };

  if (!tokenValido) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-neutral-900 dark:to-neutral-800 p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Link Inválido
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {MESSAGES.ERROR.INVALID_TOKEN}
          </p>
          <Button onClick={() => router.push('/login')} className="w-full">
            Ir para Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-neutral-900 dark:to-neutral-800 p-4 pb-safe">
      <Card className="w-full max-w-md p-8 dark:bg-neutral-800 dark:border-neutral-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Bem-vindo!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Crie sua senha para acessar o sistema
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Senha <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <Input
                type={mostrarSenha ? 'text' : 'password'}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite sua senha"
                required
                className="pr-10 dark:bg-neutral-700 dark:border-neutral-600 dark:text-gray-100"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {mostrarSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {senha && (
              <p className={`text-xs mt-1 ${
                validacaoSenha.message.includes('forte') ? 'text-green-600' :
                validacaoSenha.message.includes('média') ? 'text-yellow-600' :
                'text-gray-500 dark:text-gray-400'
              }`}>
                {validacaoSenha.message}
              </p>
            )}
          </div>

          {/* Campo Confirmar Senha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirmar Senha <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <Input
                type={mostrarConfirma ? 'text' : 'password'}
                value={confirmaSenha}
                onChange={(e) => setConfirmaSenha(e.target.value)}
                placeholder="Confirme sua senha"
                required
                className="pr-10 dark:bg-neutral-700 dark:border-neutral-600 dark:text-gray-100"
              />
              <button
                type="button"
                onClick={() => setMostrarConfirma(!mostrarConfirma)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {mostrarConfirma ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmaSenha && (
              <div className="flex items-center gap-2 mt-1">
                {senhasConferem ? (
                  <>
                    <Check className="w-4 h-4 text-green-600" />
                    <p className="text-xs text-green-600">As senhas conferem</p>
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 text-red-600" />
                    <p className="text-xs text-red-600">As senhas não conferem</p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Requisitos de Senha */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
              Requisitos da senha:
            </p>
            <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
              <li className="flex items-center gap-2">
                {senha.length >= 6 ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                Mínimo de 6 caracteres
              </li>
              <li className="flex items-center gap-2">
                {senha.length >= 8 ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                Recomendado: 8 ou mais caracteres
              </li>
              <li className="flex items-center gap-2">
                {/[A-Z]/.test(senha) && /[a-z]/.test(senha) ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                Letras maiúsculas e minúsculas
              </li>
              <li className="flex items-center gap-2">
                {/[0-9]/.test(senha) ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                Números
              </li>
              <li className="flex items-center gap-2">
                {/[!@#$%^&*(),.?":{}|<>]/.test(senha) ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                Caracteres especiais (!@#$%...)
              </li>
            </ul>
          </div>

          {/* Botão Submit */}
          <Button
            type="submit"
            disabled={carregando || !senha || !confirmaSenha || !senhasConferem}
            className="w-full min-h-[44px]"
          >
            {carregando ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Criando senha...
              </span>
            ) : (
              'Criar Senha e Acessar'
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
