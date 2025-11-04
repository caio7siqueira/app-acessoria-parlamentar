'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function TestAuthPage() {
    const { user, session, loading, signOut } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-center mb-8">Teste de Autenticação</h1>

                <Card className="p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Status da Autenticação</h2>

                    <div className="space-y-2">
                        <p><strong>Usuário logado:</strong> {user ? '✅ Sim' : '❌ Não'}</p>
                        {user && (
                            <>
                                <p><strong>Email:</strong> {user.email}</p>
                                <p><strong>ID:</strong> {user.id}</p>
                            </>
                        )}
                        <p><strong>Sessão ativa:</strong> {session ? '✅ Sim' : '❌ Não'}</p>
                        {session && (
                            <p><strong>Expira em:</strong> {new Date(session.expires_at! * 1000).toLocaleString()}</p>
                        )}
                    </div>
                </Card>

                <Card className="p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Cookies de Autenticação</h2>
                    <div className="bg-gray-100 p-4 rounded text-sm font-mono">
                        {typeof document !== 'undefined' ? document.cookie || 'Nenhum cookie encontrado' : 'Carregando cookies...'}
                    </div>
                </Card>

                <Card className="p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Informações do Ambiente</h2>
                    <div className="space-y-2">
                        <p><strong>Ambiente:</strong> {process.env.NODE_ENV}</p>
                        <p><strong>URL atual:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
                        <p><strong>User Agent:</strong> {typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}</p>
                    </div>
                </Card>

                <div className="flex gap-4 justify-center">
                    {user ? (
                        <Button onClick={signOut} variant="outline">
                            Fazer Logout
                        </Button>
                    ) : (
                        <Button onClick={() => window.location.href = '/login'}>
                            Ir para Login
                        </Button>
                    )}

                    <Button onClick={() => window.location.href = '/'}>
                        Ir para Dashboard
                    </Button>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
                        Esta página ajuda a diagnosticar problemas de autenticação e redirecionamento.
                    </p>
                </div>
            </div>
        </div>
    );
}