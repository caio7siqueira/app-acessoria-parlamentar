'use client';

import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function ContatosPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contatos</h1>
          <p className="text-gray-600">Gerencie os contatos das secretarias</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center py-8">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Funcionalidade em Desenvolvimento
            </h3>
            <p className="text-gray-500">
              A página de contatos está sendo desenvolvida e estará disponível em breve.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}