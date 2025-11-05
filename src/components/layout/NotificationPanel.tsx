'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell, X, Clock, AlertCircle } from 'lucide-react'
import { getSupabaseClient } from '@/services/supabaseClient'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface Notification {
    id: string
    titulo: string
    mensagem: string
    tipo: 'urgente' | 'prazo' | 'info'
    lida: boolean
    created_at: string
    atendimento_id?: number | null
}

export default function NotificationPanel() {
    const [isOpen, setIsOpen] = useState(false)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)

    // Cliente Supabase único (singleton fora do componente)
    const supabase = getSupabaseClient()

    // Função para carregar notificações
    const loadNotifications = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('notificacoes')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10)

            if (error) {
                console.error('❌ Erro ao carregar notificações:', error.message)
                return
            }

            // Garantir que data não é null antes de processar
            const notificationsList = (data ?? []) as Notification[]
            setNotifications(notificationsList)
            setUnreadCount(notificationsList.filter((n) => !n.lida).length)
        } catch (err) {
            console.error('❌ Exceção ao carregar notificações:', err)
        }
    }, []) // supabase é singleton, não precisa na dependência

    // Configurar Realtime subscription
    useEffect(() => {
        // Carregar notificações iniciais
        loadNotifications()

        // Criar canal único para evitar duplicatas
        let channel: RealtimeChannel | null = null

        const setupRealtimeSubscription = async () => {
            channel = supabase
                .channel(`notifications-${crypto.randomUUID()}`)
                .on(
                    'postgres_changes',
                    {
                        event: '*',
                        schema: 'public',
                        table: 'notificacoes'
                    },
                    (payload) => {
                        console.log('📬 Notificação em tempo real:', payload.eventType)
                        loadNotifications()
                    }
                )
                .subscribe((status) => {
                    if (status === 'SUBSCRIBED') {
                        console.log('✅ Inscrito no canal de notificações')
                    } else if (status === 'CHANNEL_ERROR') {
                        console.error('❌ Erro no canal de notificações')
                    }
                })
        }

        setupRealtimeSubscription()

        // Cleanup: remover canal ao desmontar
        return () => {
            if (channel) {
                supabase.removeChannel(channel)
                console.log('🧹 Canal de notificações removido')
            }
        }
    }, [loadNotifications]) // Removido supabase - é singleton

    // Marcar notificação como lida
    const markAsRead = useCallback(async (id: string) => {
        try {
            // Otimistic update
            setNotifications(prev => 
                prev.map(n => n.id === id ? { ...n, lida: true } : n)
            )
            setUnreadCount(prev => Math.max(0, prev - 1))

            // Atualizar no banco (cast para evitar erro de tipagem)
            const { error } = await (supabase
                .from('notificacoes') as any)
                .update({ lida: true })
                .eq('id', id)

            if (error) {
                console.error('❌ Erro ao marcar como lida:', error.message)
                // Reverter otimistic update em caso de erro
                loadNotifications()
                return
            }
        } catch (err) {
            console.error('❌ Exceção ao marcar como lida:', err)
            loadNotifications()
        }
    }, [loadNotifications]) // Removido supabase - é singleton

    // Marcar todas como lidas
    const markAllAsRead = useCallback(async () => {
        try {
            // Otimistic update
            const prevNotifications = notifications
            const prevUnreadCount = unreadCount
            
            setNotifications(prev => prev.map(n => ({ ...n, lida: true })))
            setUnreadCount(0)

            // Atualizar no banco (cast para evitar erro de tipagem)
            const { error } = await (supabase
                .from('notificacoes') as any)
                .update({ lida: true })
                .eq('lida', false)

            if (error) {
                console.error('❌ Erro ao marcar todas como lidas:', error.message)
                // Reverter otimistic update em caso de erro
                setNotifications(prevNotifications)
                setUnreadCount(prevUnreadCount)
                return
            }
        } catch (err) {
            console.error('❌ Exceção ao marcar todas como lidas:', err)
            loadNotifications()
        }
    }, [supabase, notifications, unreadCount, loadNotifications])

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
        <>
            <div className="relative">
                <button 
                    onClick={() => setIsOpen(!isOpen)} 
                    className="relative p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                    aria-label="Notificações"
                >
                    <Bell size={24} className="text-gray-700 dark:text-gray-300" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                            {unreadCount}
                        </span>
                    )}
                </button>
            </div>

            {isOpen && (
                <>
                    <div className="fixed inset-0 bg-black/20 z-[999]" onClick={() => setIsOpen(false)} />

                    <div className="fixed right-4 top-16 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl z-[1000] border border-gray-200 dark:border-neutral-700">
                        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-700">
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">Notificações</h3>
                            <div className="flex gap-2 items-center">
                                {unreadCount > 0 && (
                                    <button 
                                        onClick={markAllAsRead} 
                                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                    >
                                        Marcar todas como lidas
                                    </button>
                                )}
                                <button 
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded transition-colors"
                                    aria-label="Fechar notificações"
                                >
                                    <X size={20} className="text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>
                        </div>

                        <div className="max-h-[70vh] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                    <Bell size={48} className="mx-auto mb-4 opacity-30" />
                                    <p>Nenhuma notificação</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-200 dark:divide-neutral-700">
                                    {notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            className={`p-4 hover:bg-gray-50 dark:hover:bg-neutral-700/50 cursor-pointer transition-colors ${
                                                !notif.lida ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                            }`}
                                            onClick={() => markAsRead(notif.id)}
                                        >
                                            <div className="flex gap-3">
                                                {getIcon(notif.tipo)}
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{notif.titulo}</h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{notif.mensagem}</p>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                                        {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: ptBR })}
                                                    </p>
                                                </div>
                                                {!notif.lida && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    )
}

