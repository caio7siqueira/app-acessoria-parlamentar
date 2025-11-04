import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware de autenticação (permissivo)
 * Observação importante:
 * - Este projeto usa @supabase/supabase-js no cliente, que por padrão persiste sessão em localStorage, não em cookies.
 * - O Middleware NÃO tem acesso ao localStorage, portanto não consegue confirmar auth de forma confiável.
 *
 * Estratégia adotada:
 * - NUNCA bloquear a navegação por ausência de cookies (evita loops pós-login).
 * - Apenas redirecionar usuários logados para fora de /login (quando possível detectar via cookies conhecidos).
 * - Deixar a proteção efetiva para o client-side (AuthGuard/useAuth) nas rotas protegidas.
 */
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const isDev = process.env.NODE_ENV === 'development';

    // Rotas públicas sempre liberadas
    const publicPrefixes = ['/login', '/api', '/_next', '/favicon.ico', '/manifest.json', '/icons', '/public'];
    const isPublic = publicPrefixes.some((prefix) => pathname.startsWith(prefix));
    if (isPublic) {
        return NextResponse.next();
    }

    // Detectar indícios de sessão via cookies do Supabase (quando presentes)
    const cookies = request.cookies.getAll();
    const cookieNames = cookies.map((c) => c.name);
    const hasKnownCookies = cookieNames.some((name) => (
        name === 'sb-access-token' ||
        name === 'sb-refresh-token' ||
        name === 'supabase-auth-token' ||
        name === 'supabase.auth.token' ||
        /^sb-.*-auth-token$/.test(name)
    ));

    // Se o usuário tentar acessar /login e já parecer autenticado por cookies, redirecionar para dashboard
    if (pathname.startsWith('/login') && hasKnownCookies) {
        const url = new URL('/', request.url);
        const res = NextResponse.redirect(url);
        res.headers.set('x-auth-debug', 'redirected-from-login-has-cookies');
        return res;
    }

    // NÃO bloquear acesso às rotas aqui. O guard do cliente fará o papel de proteger.
    const res = NextResponse.next();
    // Adicionar cabeçalhos de debug úteis
    res.headers.set('x-auth-debug', [
        'middleware=permissive',
        `env=${isDev ? 'dev' : 'prod'}`,
        `cookies=${cookieNames.join(',') || 'none'}`,
    ].join('; '));
    return res;
}

export const config = {
    matcher: [
        // Ignorar rotas estáticas e assets
        '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icons).*)',
    ],
};