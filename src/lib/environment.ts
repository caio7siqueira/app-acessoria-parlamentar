// Arquivo para validação das variáveis de ambiente
// Garante que todas as variáveis necessárias estão presentes

export interface EnvironmentConfig {
    supabaseUrl: string;
    supabaseAnonKey: string;
    supabaseServiceRoleKey?: string;
    nextAuthUrl: string;
    nextAuthSecret: string;
    vapidPublicKey?: string;
    vapidPrivateKey?: string;
}

/**
 * Valida e retorna as variáveis de ambiente necessárias
 * Usa nomes padronizados das variáveis em UPPER_CASE
 * Funciona tanto no servidor quanto no cliente
 */
export function validateEnvironment(): EnvironmentConfig {
    // No cliente, algumas variáveis podem não estar disponíveis
    const isServer = typeof window === 'undefined';

    // Variáveis obrigatórias com nomes padronizados
    const envVars = {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        // NextAuth variáveis só são necessárias no servidor
        NEXTAUTH_URL: isServer ? process.env.NEXTAUTH_URL : (
            typeof window !== 'undefined' && window.location.origin.includes('vercel.app')
                ? window.location.origin
                : 'http://localhost:3000'
        ),
        NEXTAUTH_SECRET: isServer ? process.env.NEXTAUTH_SECRET : 'placeholder-for-client',
    };

    // Variáveis opcionais
    const optionalVars = {
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
        NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        VAPID_PRIVATE_KEY: process.env.VAPID_PRIVATE_KEY,
    };

    // Verificar apenas variáveis necessárias para o contexto atual
    const missing: string[] = [];

    // Sempre verificar variáveis públicas do Supabase
    if (!envVars.NEXT_PUBLIC_SUPABASE_URL || envVars.NEXT_PUBLIC_SUPABASE_URL.trim() === '') {
        missing.push('NEXT_PUBLIC_SUPABASE_URL');
    }
    if (!envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim() === '') {
        missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }

    // Verificar NextAuth apenas no servidor
    if (isServer) {
        if (!envVars.NEXTAUTH_URL || envVars.NEXTAUTH_URL.trim() === '') {
            missing.push('NEXTAUTH_URL');
        }
        if (!envVars.NEXTAUTH_SECRET || envVars.NEXTAUTH_SECRET.trim() === '') {
            missing.push('NEXTAUTH_SECRET');
        }
    }

    if (missing.length > 0) {
        const context = isServer ? 'server' : 'client';
        const errorMessage = [
            `❌ Missing required environment variables (${context}): ${missing.join(', ')}`,
            '',
            '📝 Please add these variables to your .env.local file:',
            ...missing.map(name => `   ${name}=your_value_here`),
            '',
            '📖 Check the .env.example file for reference.',
        ].join('\n');

        throw new Error(errorMessage);
    }

    // Validar formato das URLs apenas se disponíveis
    try {
        if (envVars.NEXT_PUBLIC_SUPABASE_URL) {
            new URL(envVars.NEXT_PUBLIC_SUPABASE_URL);
        }
        if (isServer && envVars.NEXTAUTH_URL) {
            new URL(envVars.NEXTAUTH_URL);
        }
    } catch (error) {
        throw new Error('❌ Invalid URL format in environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXTAUTH_URL.');
    }

    return {
        supabaseUrl: envVars.NEXT_PUBLIC_SUPABASE_URL!,
        supabaseAnonKey: envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        nextAuthUrl: envVars.NEXTAUTH_URL!,
        nextAuthSecret: envVars.NEXTAUTH_SECRET!,
        supabaseServiceRoleKey: optionalVars.SUPABASE_SERVICE_ROLE_KEY,
        vapidPublicKey: optionalVars.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        vapidPrivateKey: optionalVars.VAPID_PRIVATE_KEY,
    };
}

// Para debug em desenvolvimento
export function logEnvironmentStatus() {
    if (process.env.NODE_ENV === 'development') {
        const config = validateEnvironment();
        console.log('Environment configuration loaded:', {
            supabaseUrl: config.supabaseUrl,
            hasSupabaseAnonKey: !!config.supabaseAnonKey,
            hasSupabaseServiceRole: !!config.supabaseServiceRoleKey,
            nextAuthUrl: config.nextAuthUrl,
            hasNextAuthSecret: !!config.nextAuthSecret,
            hasVapidKeys: !!(config.vapidPublicKey && config.vapidPrivateKey),
        });
    }
}