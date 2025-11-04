'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { AtendimentosService } from '@/services/atendimentosService';
import { Users, ClipboardList, AlertTriangle, Clock } from 'lucide-react';

export function DashboardPage() {
  const router = useRouter();
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => AtendimentosService.obterEstatisticas(),
  });

  if (isLoading || !stats) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  const cards = [
    {
      id: 'total',
      title: 'Total de Atendimentos',
      value: stats.total_atendimentos,
      icon: ClipboardList,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      href: '/atendimentos'
    },
    {
      id: 'urgentes',
      title: 'Atendimentos Urgentes',
      value: stats.atendimentos_urgentes,
      icon: AlertTriangle,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
      href: '/atendimentos?urgencia=Urgente'
    },
    {
      id: 'prazo',
      title: 'Próximos do Prazo',
      value: stats.atendimentos_prazo,
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      href: '/atendimentos?prazo=proximo'
    },
    {
      id: 'mes',
      title: 'Atendimentos do Mês',
      value: stats.total_atendimentos,
      icon: Users,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      href: '/atendimentos?periodo=mes'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral dos atendimentos e demandas</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => router.push(card.href)}
            className="bg-white overflow-hidden shadow-sm hover:shadow-md rounded-2xl transition-all duration-200 hover:scale-105 active:scale-100 text-left"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-xl ${card.bgColor}`}>
                    <card.icon className={`h-6 w-6 ${card.textColor}`} />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {card.title}
                    </dt>
                    <dd className="text-2xl font-semibold text-gray-900">
                      {card.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Atendimentos por Status</h3>
          <div className="space-y-3">
            {stats.atendimentos_por_status.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.status}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(item.quantidade / stats.total_atendimentos) * 100}%`
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8">
                    {item.quantidade}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Channel Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Atendimentos por Canal</h3>
          <div className="space-y-3">
            {stats.atendimentos_por_canal.map((item) => (
              <div key={item.canal} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.canal}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${(item.quantidade / stats.total_atendimentos) * 100}%`
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8">
                    {item.quantidade}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Atividades Recentes</h3>
          <div className="flow-root">
            <div className="text-sm text-gray-500 text-center py-4">
              Sistema implementado com sucesso! 
              <br />
              Dados em tempo real sendo carregados...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}