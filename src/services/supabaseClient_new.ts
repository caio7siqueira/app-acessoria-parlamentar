import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';
import { validateEnvironment, logEnvironmentStatus } from '@/lib/environment';

// Singleton clients
let _supabase: SupabaseClient<Database> | null = null;
let _supabaseAdmin: SupabaseClient<Database> | null = null;

/**
 * Obtém o cliente Supabase principal (lazy loaded)
 */
export function getSupabaseClient(): SupabaseClient<Database> {
    if (!_supabase) {
        const env = validateEnvironment();

        // Log de debug apenas uma vez
        if (process.env.NODE_ENV === 'development') {
            logEnvironmentStatus();
        }

        _supabase = createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true
            },
            realtime: {
                params: {
                    eventsPerSecond: 10
                }
            }
        });
    }

    return _supabase;
}

/**
 * Obtém o cliente Supabase Admin (lazy loaded)
 */
export function getSupabaseAdmin(): SupabaseClient<Database> | null {
    if (!_supabaseAdmin) {
        const env = validateEnvironment();

        if (env.supabaseServiceRoleKey) {
            _supabaseAdmin = createClient<Database>(env.supabaseUrl, env.supabaseServiceRoleKey, {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            });
        }
    }

    return _supabaseAdmin;
}

// Exportações de compatibilidade
export const supabase = getSupabaseClient();
export const supabaseAdmin = getSupabaseAdmin();