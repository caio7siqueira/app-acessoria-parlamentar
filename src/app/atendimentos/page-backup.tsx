'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AtendimentosService } from '@/services/atendimentosService';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Plus, Search, Calendar, Clock, AlertCircle, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AtendimentosPage() {
  const router = useRouter();
  const [busca, setBusca] = useState('');
  const [paginacao, setPaginacao] = useState({ page: 1, limit: 10 });

  const { data: atendimentos, isLoading } = useQuery({
    queryKey: ['atendimentos', busca, paginacao],
    queryFn: () => AtendimentosService.buscarAtendimentos(
      { busca },
      paginacao
    ),
  });

  const getStatusColor = (status: string) => {
    const colors = {
      'Pendente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Em Andamento': 'bg-blue-100 text-blue-800 border-blue-200',
      'Concluído': 'bg-green-100 text-green-800 border-green-200',
      'Cancelado': 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getUrgenciaIcon = (urgencia: string) => {
    if (urgencia === 'Urgente' || urgencia === 'Alta') {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  const getUrgenciaColor = (urgencia: string) => {
    const colors = {
      'Baixa': 'text-gray-600',
      'Média': 'text-yellow-600',
      'Alta': 'text-orange-600',
      'Urgente': 'text-red-600 font-semibold',
    };
    return colors[urgencia as keyof typeof colors] || 'text-gray-600';
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Header com Search */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4 space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Atendimentos</h1>
            <p className="text-sm text-gray-600">Gerencie suas demandas</p>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou solicitação..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-base focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Cards List */}
        <div className="px-4 py-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : atendimentos?.data.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg font-medium">Nenhum atendimento encontrado</p>
              <p className="text-gray-400 text-sm mt-1">Tente ajustar sua busca</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="space-y-3">
                {atendimentos?.data.map((atendimento, index) => (
                  <motion.div
                    key={atendimento.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                    onClick={() => router.push(`/atendimentos/${atendimento.id}`)}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 active:scale-98 transition-all duration-200 cursor-pointer hover:shadow-md"
                    role="button"
                    aria-label={`Ver detalhes do atendimento de ${atendimento.nome}`}
                  >
                    {/* Header do Card */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {atendimento.nome}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                          {atendimento.solicitacao}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                    </div>

                    {/* Badges e Info */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(atendimento.status)}`}>
                        {atendimento.status}
                      </span>

                      {atendimento.prazo_urgencia && (
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-50 ${getUrgenciaColor(atendimento.prazo_urgencia)}`}>
                          {getUrgenciaIcon(atendimento.prazo_urgencia)}
                          {atendimento.prazo_urgencia}
                        </span>
                      )}

                      {atendimento.canal && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {atendimento.canal}
                        </span>
                      )}
                    </div>

                    {/* Data */}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(atendimento.data_criacao).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}

          {/* Pagination */}
          {atendimentos && atendimentos.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={() => setPaginacao(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={paginacao.page === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>

              <span className="text-sm text-gray-600">
                Página {paginacao.page} de {atendimentos.totalPages}
              </span>

              <button
                onClick={() => setPaginacao(prev => ({ ...prev, page: Math.min(atendimentos.totalPages, prev.page + 1) }))}
                disabled={paginacao.page === atendimentos.totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Próxima
              </button>
            </div>
          )}
        </div>

        {/* Floating Action Button (FAB) */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 260, damping: 20 }}
          className="fixed bottom-20 right-4 z-20 md:bottom-6 md:right-6"
        >
          <button
            onClick={() => router.push('/atendimentos/novo')}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-4 rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200"
            aria-label="Novo atendimento"
          >
            <Plus className="w-6 h-6" />
            <span className="font-semibold hidden sm:inline">Novo</span>
          </button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
