'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSupabaseClient } from '@/services/supabaseClient'
import { useToast } from '@/components/ui/toast'

export default function AuthCallback() {
    const router = useRouter()
    const [senha, setSenha] = useState('')
    const [confirmarSenha, setConfirmarSenha] = useState('')
    const [loading, setLoading] = useState(false)
    const supabase = getSupabaseClient()
    const { showToast } = useToast()

    const handleSetPassword = async () => {
        if (senha.length < 6) {
            showToast('Senha deve ter no mínimo 6 caracteres', 'error')
            return
        }

        if (senha !== confirmarSenha) {
            showToast('As senhas não coincidem', 'error')
            return
        }

        setLoading(true)
        try {
            const { error } = await supabase.auth.updateUser({ password: senha })
            if (error) throw error

            showToast('Senha definida com sucesso!', 'success')
            router.push('/')
        } catch (err: any) {
            console.error('Erro definindo senha:', err)
            showToast('Erro ao definir senha', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-2xl shadow-lg">
                <h1 className="text-2xl font-bold text-center">Defina sua senha</h1>

                <input
                    type="password"
                    placeholder="Nova senha (mín. 6 caracteres)"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="w-full p-4 border rounded-lg text-base"
                />

                <input
                    type="password"
                    placeholder="Confirmar senha"
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    className="w-full p-4 border rounded-lg text-base"
                />

                <button
                    onClick={handleSetPassword}
                    disabled={loading}
                    className="w-full p-4 bg-blue-600 text-white rounded-lg font-medium"
                >
                    {loading ? 'Aguarde...' : 'Criar Conta'}
                </button>
            </div>
        </div>
    )
}
