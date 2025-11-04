import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/services/supabaseClient'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const email = (body.email || '').toString().trim()

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
        }

        const supabaseAdmin = getSupabaseAdmin()
        if (!supabaseAdmin) {
            return NextResponse.json({ error: 'Service role key não configurada no servidor' }, { status: 500 })
        }

        // Verificar limite de usuários (tabela "usuarios")
        const { data: users, error: countError } = await supabaseAdmin
            .from('usuarios')
            .select('id', { count: 'exact' })

        if (countError) {
            return NextResponse.json({ error: countError.message }, { status: 500 })
        }

        if (users && users.length >= 3) {
            return NextResponse.json({ error: 'Número máximo de usuários atingido (limite: 3)' }, { status: 400 })
        }

        // Enviar convite via admin
        const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL || ''}/auth/callback`
        const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            redirectTo,
        })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // Inserir registro na tabela usuarios (ativo: false)
        try {
            await supabaseAdmin.from('usuarios').insert({
                email,
                ativo: false,
                nome: email.split('@')[0],
            })
        } catch (err: any) {
            // Não bloquear o convite caso a inserção falhe; apenas logar
            console.error('Erro inserindo usuario na tabela usuarios:', err?.message || err)
        }

        return NextResponse.json({ success: true, data })
    } catch (err: any) {
        console.error('Erro em /api/invite-user:', err)
        return NextResponse.json({ error: err?.message || 'Erro interno' }, { status: 500 })
    }
}
