'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { getSupabaseClient } from '@/services/supabaseClient';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    signOut: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = getSupabaseClient();

    useEffect(() => {
        // Verificar sessão atual
        const getSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setSession(session);
                setUser(session?.user || null);
            } catch (error) {
                console.error('Erro ao obter sessão:', error);
            } finally {
                setLoading(false);
            }
        };

        getSession();

        // Escutar mudanças na autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('Auth event:', event);
                setSession(session);
                setUser(session?.user || null);
                setLoading(false);
            }
        );

        return () => subscription.unsubscribe();
    }, [supabase]);

    const signOut = useCallback(async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
            setSession(null);
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    }, [supabase]);

    return (
        <AuthContext.Provider value={{
            user,
            session,
            loading,
            signOut
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de AuthProvider');
    }
    return context;
};