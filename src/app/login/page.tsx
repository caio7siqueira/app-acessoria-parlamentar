'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getSupabaseClient } from '@/services/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = getSupabaseClient();

    // Pegar URL de redirecionamento dos parâmetros
    const redirectTo = searchParams.get('redirectTo') || '/';

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        console.log('🔐 Tentando fazer login...', { email, redirectTo });

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            console.log('📊 Resposta do login:', { data, error });

            if (error) {
                setError(error.message);
                console.log('❌ Erro no login:', error);
            } else if (data.user && data.session) {
                console.log('✅ Login bem-sucedido!', { user: data.user, session: data.session });
                setError('Login realizado com sucesso! Redirecionando...');

                // Aguardar um pouco para garantir que os cookies sejam definidos
                await new Promise(resolve => setTimeout(resolve, 500));

                // Forçar reload da página para garantir que o middleware detecte a autenticação
                console.log('🔄 Redirecionando para:', redirectTo);

                if (typeof window !== 'undefined') {
                    // Em desenvolvimento, usar window.location.href
                    if (process.env.NODE_ENV === 'development') {
                        window.location.href = redirectTo;
                    } else {
                        // Em produção, usar router.push primeiro, fallback para window.location
                        try {
                            router.push(redirectTo);
                            setTimeout(() => {
                                window.location.href = redirectTo;
                            }, 100);
                        } catch {
                            window.location.href = redirectTo;
                        }
                    }
                }
            }
        } catch (err) {
            console.error('💥 Erro inesperado:', err);
            setError('Erro inesperado. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async () => {
        setLoading(true);
        setError('');

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) {
                setError(error.message);
            } else if (data.user) {
                // Se confirmação de email estiver desabilitada, redirecionar
                if (data.session) {
                    setTimeout(() => {
                        window.location.href = redirectTo;
                    }, 100);
                } else {
                    setError('Verifique seu email para confirmar a conta.');
                }
            }
        } catch (err) {
            setError('Erro inesperado. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sistema de Assessoria Parlamentar
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Entre com sua conta ou crie uma nova
                    </p>
                </div>

                <Card className="p-8">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="sr-only">
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                required
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="sr-only">
                                Senha
                            </label>
                            <Input
                                id="password"
                                type="password"
                                required
                                placeholder="Senha"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="space-y-4">
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={loading}
                            >
                                {loading ? 'Entrando...' : 'Entrar'}
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                disabled={loading}
                                onClick={handleSignUp}
                            >
                                {loading ? 'Criando...' : 'Criar Conta'}
                            </Button>
                        </div>
                    </form>
                </Card>

                <div className="text-center">
                    <p className="text-sm text-gray-600">
                        Sistema desenvolvido para gerenciamento de atendimentos parlamentares
                    </p>
                </div>
            </div>
        </div>
    );
}