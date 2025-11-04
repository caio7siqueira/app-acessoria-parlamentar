import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Rotas que não precisam de autenticação
    const publicRoutes = ['/login', '/api', '/_next', '/favicon.ico', '/manifest.json', '/icons'];

    // Verificar se a rota é pública
    const isPublicRoute = publicRoutes.some(route =>
        request.nextUrl.pathname.startsWith(route)
    );

    if (isPublicRoute) {
        return NextResponse.next();
    }

    // Para outras rotas, verificar autenticação
    // Buscar cookies de autenticação do Supabase
    const cookies = request.cookies;
    let hasAuthCookie = false;

    // Verificar cookies específicos do Supabase
    const authCookies = [
        'sb-access-token',
        'sb-refresh-token',
        'supabase-auth-token',
        'supabase.auth.token'
    ];

    // Também verificar por padrões de cookies do Supabase
    cookies.getAll().forEach(cookie => {
        if (authCookies.includes(cookie.name) ||
            cookie.name.startsWith('sb-') ||
            cookie.name.includes('supabase') ||
            cookie.name.includes('auth-token')) {
            hasAuthCookie = true;
        }
    });

    // Em desenvolvimento, ser mais permissivo
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
        // No desenvolvimento, permitir acesso se há qualquer indicação de autenticação
        const hasAnyAuthIndicator = cookies.getAll().some(cookie =>
            cookie.name.includes('auth') ||
            cookie.name.includes('token') ||
            cookie.name.includes('session')
        );

        if (hasAnyAuthIndicator) {
            hasAuthCookie = true;
        }
    }

    // Se não tiver cookies de auth, redirecionar para login
    if (!hasAuthCookie) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
} export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};