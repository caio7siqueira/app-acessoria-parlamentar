'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const type = searchParams?.get('type');
    const token = searchParams?.get('token_hash') || searchParams?.get('token');
    
    // Se for um convite, redirecionar para página de definir senha
    if (type === 'invite' && token) {
      router.push(`/definir-senha?token=${token}&type=invite`);
      return;
    }
    
    // Se for outro tipo de autenticação (magic link, etc), redirecionar para atendimentos
    if (type) {
      router.push('/atendimentos');
      return;
    }
    
    // Fallback padrão
    router.push('/login');
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-neutral-900 dark:to-neutral-800">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Autenticando...</p>
      </div>
    </div>
  );
}
