'use client'

import { useState, useEffect } from 'react'
import { Bell, X, Clock, AlertCircle } from 'lucide-react'
import { getSupabaseClient } from '@/services/supabaseClient'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Notification {
    id: string
    titulo: string
    mensagem: string
    tipo: 'urgente' | 'prazo' | 'info'
    lida: boolean
    created_at: string
    atendimento_id?: number
}

export default function NotificationPanel() {
    const [isOpen, setIsOpen] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const supabase = getSupabaseClient()

    useEffect(() => {
        loadNotifications()

        // Realtime subscription
        const channel = supabase
            .channel('notifications')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'notificacoes' }, () => loadNotifications())
            .subscribe()

        return () => {
            // removeChannel is deprecated in some versions - using unsubscribe pattern
            try {
                supabase.removeChannel?.(channel)
            } catch (err) {
                // ignore
            }
        }
    }, [])

    const loadNotifications = async () => {
        try {
            const { data } = await supabase.from('notificacoes').select('*').order('created_at', { ascending: false }).limit(10)
            if (data) {
                setNotifications(data as Notification[])
                setUnreadCount((data as Notification[]).filter((n) => !n.lida).length)
            }
        } catch (err) {
            console.warn('Erro carregando notificações', err)
        }
    }

    const markAsRead = async (id: string) => {
        const supabase = getSupabaseClient()
        // @ts-ignore - Tipagem do Supabase com schemas customizados
        await supabase.from('notificacoes').update({ lida: true }).eq('id', id)
        loadNotifications()
    }

    const markAllAsRead = async () => {
        const supabase = getSupabaseClient()
        // @ts-ignore - Tipagem do Supabase com schemas customizados
        await supabase.from('notificacoes').update({ lida: true }).eq('lida', false)
        loadNotifications()
    }

    const getIcon = (tipo: string) => {
        switch (tipo) {
            case 'urgente':
                return <AlertCircle className="text-red-500" size={20} />
            case 'prazo':
                return <Clock className="text-orange-500" size={20} />
            default:
                return <Bell className="text-blue-500" size={20} />
        }
    }

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell size={24} className="text-gray-700" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

                    <div className="absolute right-0 top-12 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl z-50 border border-gray-200">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="font-semibold text-lg">Notificações</h3>
                            <div className="flex gap-2">
                                {unreadCount > 0 && (
                                    <button onClick={markAllAsRead} className="text-sm text-blue-600 hover:text-blue-700">
                                        Marcar todas como lidas
                                    </button>
                                )}
                                <button onClick={() => setIsOpen(false)}>
                                    <X size={20} className="text-gray-500" />
                                </button>
                            </div>
                        </div>

                        <div className="max-h-[70vh] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <Bell size={48} className="mx-auto mb-4 opacity-30" />
                                    <p>Nenhuma notificação</p>
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!notif.lida ? 'bg-blue-50' : ''}`}
                                            onClick={() => markAsRead(notif.id)}
                                        >
                                            <div className="flex gap-3">
                                                {getIcon(notif.tipo)}
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900">{notif.titulo}</h4>
                                                    <p className="text-sm text-gray-600 mt-1">{notif.mensagem}</p>
                                                    <p className="text-xs text-gray-400 mt-2">{formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: ptBR })}</p>
                                                </div>
                                                {!notif.lida && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
