import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/services/supabaseClient'

export async function GET() {
    try {
        const supabaseAdmin = getSupabaseAdmin()
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Service role key não configurada no servidor' }, { status: 500 })
        }

        // Listar usuários (limitado para segurança)
        const { data, error } = await supabaseAdmin.auth.admin.listUsers({ limit: 100 })
        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ users: data.users || [] })
    } catch (err: any) {
        console.error('Erro em /api/list-users:', err)
        return NextResponse.json({ error: err?.message || 'Erro interno' }, { status: 500 })
    }
}
