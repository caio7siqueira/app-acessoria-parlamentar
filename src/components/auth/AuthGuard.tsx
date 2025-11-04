'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/services/supabaseClient';
import type { User } from '@supabase/supabase-js';

interface AuthGuardProps {
    children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = getSupabaseClient();

    useEffect(() => {
        // Verificar usuário atual
        const checkUser = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    setUser(session.user);
                } else {
                    // Se não há sessão, redirecionar para login
                    router.push('/login');
                    return;
                }
            } catch (error) {
                console.error('Erro ao verificar autenticação:', error);
                router.push('/login');
                return;
            } finally {
                setLoading(false);
            }
        };

        checkUser();

        // Escutar mudanças na autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth state changed:', event, session?.user?.email);

                if (event === 'SIGNED_IN' && session?.user) {
                    setUser(session.user);
                    setLoading(false);
                } else if (event === 'SIGNED_OUT') {
                    setUser(null);
                    router.push('/login');
                }
            }
        );

        return () => subscription.unsubscribe();
    }, [router, supabase]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Verificando autenticação...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null; // Será redirecionado para login
    }

    return <>{children}</>;
}