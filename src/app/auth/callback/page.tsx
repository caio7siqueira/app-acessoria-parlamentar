'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Verificar se a URL contém parâmetros de hash (access_token, etc)
    const hash = window.location.hash;
    const urlParams = new URLSearchParams(window.location.search);
    const type = urlParams.get('type');

    // Debug: Log todos os parâmetros recebidos
    console.log('🔍 Auth Callback Debug:', {
      type,
      hash,
      search: window.location.search,
      allParams: Object.fromEntries(urlParams.entries()),
      url: window.location.href
    });

    // Se for um convite (vem na URL ou no hash), SEMPRE redirecionar para definir senha
    if (type === 'invite' || hash.includes('type=invite')) {
      console.log('✅ Convite detectado - redirecionando para definir senha');
      // Usar replace para não manter no histórico
      router.replace('/definir-senha?type=invite');
      return;
    }

    // Se for outro tipo de autenticação (magic link, etc), redirecionar para atendimentos
    if (type) {
      console.log('🔄 Outro tipo de auth, redirecionando para atendimentos');
      router.push('/atendimentos');
      return;
    }

    // Fallback padrão
    console.log('🏠 Fallback, redirecionando para login');
    router.push('/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-neutral-900 dark:to-neutral-800">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Autenticando...</p>
      </div>
    </div>
  );
}
