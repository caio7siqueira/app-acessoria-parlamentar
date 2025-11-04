"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ContatosService } from "@/services/contatosService";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Combobox } from "@/components/ui/combobox";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { motion } from "framer-motion";
import { Search, Phone, Mail, Building2, User, RefreshCcw } from "lucide-react";

export default function ContatosPage() {
  const [busca, setBusca] = useLocalStorage<string>("contatos_busca", "");
  const [secretariaFiltro, setSecretariaFiltro] = useLocalStorage<string>(
    "contatos_secretaria",
    ""
  );

  const { data: secretarias } = useQuery({
    queryKey: ["contatos", "secretarias"],
    queryFn: () => ContatosService.obterSecretarias(),
  });

  const { data: contatos, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["contatos", busca, secretariaFiltro],
    queryFn: async () => {
      const lista = await ContatosService.buscarTodos(busca);
      if (secretariaFiltro) {
        return lista.filter((c) => c.secretaria === secretariaFiltro);
      }
      return lista;
    },
  });

  const handleCall = (tel: string) => (window.location.href = `tel:${tel}`);
  const handleEmail = (email: string) => (window.location.href = `mailto:${email}`);
  const handleWhatsApp = (tel: string) => {
    const numero = tel.replace(/\D/g, "");
    window.open(`https://wa.me/55${numero}`, "_blank");
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 pb-24 safe-area-bottom">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800 px-4 py-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Agenda de Contatos
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Seus contatos organizados</p>
            </div>

            <button
              onClick={() => refetch()}
              disabled={isRefetching}
              className="p-2 min-h-[44px] text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-colors active:scale-95"
              aria-label="Atualizar contatos"
            >
              <RefreshCcw className={`w-5 h-5 ${isRefetching ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar contato..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-neutral-700 rounded-xl bg-gray-50 dark:bg-neutral-800 text-base text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all mobile-input"
            />
          </div>

          {/* Filtro de Secretarias - Combobox acessível */}
          {secretarias && secretarias.length > 0 && (
            <div className="pb-1">
              <Combobox
                items={["", ...secretarias]}
                value={secretariaFiltro}
                onChange={(val) => setSecretariaFiltro(val ?? "")}
                placeholder="Filtrar por secretaria (opcional)"
                ariaLabel="Filtro de secretaria"
              />
            </div>
          )}
        </div>

        {/* Cards List */}
        <div className="px-4 py-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-neutral-800 rounded-xl p-4 animate-pulse border border-gray-100 dark:border-neutral-700"
                >
                  <div className="h-6 bg-gray-200 dark:bg-neutral-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-1/2 mb-3"></div>
                  <div className="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : contatos?.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-300 text-lg font-medium">Nenhum contato encontrado</p>
              <p className="text-gray-400 dark:text-gray-400 text-sm mt-1">Tente ajustar sua busca</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <Accordion type="multiple" className="contents">
                {contatos?.map((contato, index) => (
                  <motion.div
                    key={contato.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.2 }}
                  >
                    <AccordionItem className="bg-white dark:bg-neutral-800 border border-gray-100 dark:border-neutral-700 overflow-hidden hover:shadow-md transition-shadow" value={String(contato.id)}>
                      <AccordionTrigger className="cursor-pointer">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {contato.nome_responsavel}
                            </h3>
                            {contato.cargo && (
                              <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{contato.cargo}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-50 text-primary-700 border border-primary-200 dark:bg-primary-600/10 dark:text-primary-300 dark:border-primary-700/40">
                              <Building2 className="w-3 h-3 mr-1" />
                              {contato.secretaria}
                            </span>
                          </div>
                        </div>

                        {contato.telefone1 && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mt-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <span>{contato.telefone1}</span>
                          </div>
                        )}
                      </AccordionTrigger>

                      <AccordionContent className="bg-gray-50 dark:bg-neutral-900/40">
                        <div className="space-y-3">
                          {/* Telefones */}
                          {contato.telefone1 && (
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Telefones</p>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCall(contato.telefone1!);
                                  }}
                                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors mobile-button"
                                >
                                  <Phone className="w-4 h-4" />
                                  Ligar
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleWhatsApp(contato.telefone1!);
                                  }}
                                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors mobile-button"
                                >
                                  WhatsApp
                                </button>
                              </div>
                              {contato.telefone2 && (
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 pl-2">
                                  <Phone className="w-4 h-4" />
                                  <span>{contato.telefone2}</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Email */}
                          {contato.email && (
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEmail(contato.email!);
                                }}
                                className="w-full flex items-center gap-2 py-2 px-3 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors mobile-button"
                              >
                                <Mail className="w-4 h-4" />
                                <span className="truncate">{contato.email}</span>
                              </button>
                            </div>
                          )}

                          {/* Observações */}
                          {contato.observacoes && (
                            <div className="space-y-2">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Observações</p>
                              <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{contato.observacoes}</p>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
