"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RelatoriosService } from "@/services/relatoriosService";
import { STATUS_ATENDIMENTO, URGENCIAS, SECRETARIAS } from "@/types";
import { useToast } from "@/components/ui/toast";
import { MESSAGES } from "@/utils/messages";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CalendarRange, BarChart3, Percent, AlertTriangle } from "lucide-react";
import { Combobox } from "@/components/ui/combobox";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { FilterTags, FilterTag } from "@/components/ui/filter-tags";

export default function RelatoriosPage() {
  const { showToast } = useToast();
  const hoje = new Date();
  const inicioPadrao = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const fimPadrao = hoje.toISOString().split("T")[0];

  const [dataInicio, setDataInicio] = useState(inicioPadrao);
  const [dataFim, setDataFim] = useState(fimPadrao);
  const [status, setStatus] = useLocalStorage<string[]>("relatorios_status", []);
  const [urgencia, setUrgencia] = useLocalStorage<string[]>("relatorios_urgencia", []);
  const [secretarias, setSecretarias] = useLocalStorage<string[]>("relatorios_secretarias", []);
  const [foiGerado, setFoiGerado] = useState(false);

  const { data: estatisticas, isFetching, refetch } = useQuery({
    queryKey: [
      "relatorios",
      { dataInicio, dataFim, status, urgencia, secretarias },
    ],
    queryFn: () =>
      RelatoriosService.obterEstatisticasRelatorio({
        data_inicio: dataInicio,
        data_fim: dataFim,
        status,
        urgencia,
        secretarias,
      }),
    enabled: false, // somente quando clicar em Gerar
  });

  const handleGerar = async () => {
    setFoiGerado(false);
    const res = await refetch();
    if (res.error) {
      showToast(MESSAGES.ERROR.RELATORIO_GENERATE, 'error');
    } else if (res.data?.resumo.total_atendimentos === 0) {
      showToast(MESSAGES.WARNING.NO_DATA_FILTERS, 'warning');
      setFoiGerado(true);
    } else {
      setFoiGerado(true);
    }
  };

  // Combobox já retorna valores diretamente via onChange

  const resumoCards = useMemo(
    () => [
      {
        titulo: "Total de atendimentos",
        valor: estatisticas?.resumo.total_atendimentos ?? "—",
        icon: BarChart3,
      },
      {
        titulo: "Urgentes em aberto",
        valor: estatisticas?.resumo.atendimentos_urgentes ?? "—",
        icon: AlertTriangle,
      },
      {
        titulo: "Taxa de conclusão",
        valor: estatisticas ? `${estatisticas.resumo.taxa_conclusao}%` : "—",
        icon: Percent,
      },
    ],
    [estatisticas]
  );

  const filterTags = useMemo<FilterTag[]>(() => {
    const tags: FilterTag[] = [];
    status.forEach((s) => tags.push({ label: s, value: `status-${s}`, category: "Status" }));
    urgencia.forEach((u) => tags.push({ label: u, value: `urgencia-${u}`, category: "Urgência" }));
    secretarias.forEach((sec) => tags.push({ label: sec, value: `secretaria-${sec}`, category: "Secretaria" }));
    return tags;
  }, [status, urgencia, secretarias]);

  const removeFilterTag = (val: string) => {
    if (val.startsWith("status-")) {
      setStatus(status.filter((s) => `status-${s}` !== val));
    } else if (val.startsWith("urgencia-")) {
      setUrgencia(urgencia.filter((u) => `urgencia-${u}` !== val));
    } else if (val.startsWith("secretaria-")) {
      setSecretarias(secretarias.filter((sec) => `secretaria-${sec}` !== val));
    }
  };

  const clearAllFilters = () => {
    setStatus([]);
    setUrgencia([]);
    setSecretarias([]);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 pb-10 safe-area-bottom">
        {/* Header */}
        <div className="px-4 pt-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Relatórios</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Gere e visualize relatórios de atendimentos</p>
        </div>

        {/* Filtros */}
        <Card className="m-4 p-4 md:p-6 dark:bg-neutral-800 dark:border-neutral-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data Início
              </label>
              <div className="relative">
                <CalendarRange className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="pl-9 dark:bg-neutral-700 dark:border-neutral-600 dark:text-gray-100"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Data Fim
              </label>
              <div className="relative">
                <CalendarRange className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <Input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="pl-9 dark:bg-neutral-700 dark:border-neutral-600 dark:text-gray-100"
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <Button
                onClick={handleGerar}
                disabled={isFetching}
                aria-label="Gerar relatório"
                className="w-full md:w-auto mobile-button min-h-[44px]"
              >
                {isFetching ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> {MESSAGES.INFO.GENERATING_REPORT}
                  </span>
                ) : (
                  "Gerar Relatório"
                )}
              </Button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
              <Combobox
                items={STATUS_ATENDIMENTO as unknown as string[]}
                multiple
                value={status}
                onChange={setStatus}
                placeholder="Selecione status"
                ariaLabel="Filtrar por status"
                showChips={false}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Urgência</label>
              <Combobox
                items={URGENCIAS as unknown as string[]}
                multiple
                value={urgencia}
                onChange={setUrgencia}
                placeholder="Selecione urgências"
                ariaLabel="Filtrar por urgência"
                showChips={false}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Secretarias</label>
              <Combobox
                items={SECRETARIAS as unknown as string[]}
                multiple
                value={secretarias}
                onChange={setSecretarias}
                placeholder="Selecione secretarias"
                ariaLabel="Filtrar por secretarias"
                showChips={false}
              />
            </div>
          </div>

          {/* Filter Tags */}
          {filterTags.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-neutral-700">
              <FilterTags
                tags={filterTags}
                onRemove={removeFilterTag}
                onClearAll={clearAllFilters}
              />
            </div>
          )}
        </Card>

        {/* KPIs - mostram após gerar */}
        <div className="px-4">
          <AnimatePresence>
            {foiGerado && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {resumoCards.map(({ titulo, valor, icon: Icon }, idx) => (
                  <motion.div
                    key={titulo}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="p-6 dark:bg-neutral-800 dark:border-neutral-700">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{titulo}</p>
                        <Icon className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-3xl font-bold mt-1 text-gray-900 dark:text-gray-100">{valor}</p>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Distribuições - apenas após gerar */}
        <div className="px-4 mt-4">
          <AnimatePresence>
            {foiGerado && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-4"
              >
                <Card className="p-6 dark:bg-neutral-800 dark:border-neutral-700">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Por status</h3>
                  <ul className="space-y-2">
                    {estatisticas?.distribuicao.por_status.length ? (
                      estatisticas.distribuicao.por_status.map((s) => (
                        <li key={s.status} className="flex justify-between text-sm text-gray-700 dark:text-gray-200">
                          <span>{s.status}</span>
                          <span>
                            {s.quantidade} ({s.percentual}%)
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-500 dark:text-gray-400">{MESSAGES.WARNING.NO_DATA}</li>
                    )}
                  </ul>
                </Card>

                <Card className="p-6 dark:bg-neutral-800 dark:border-neutral-700">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Por urgência</h3>
                  <ul className="space-y-2">
                    {estatisticas?.distribuicao.por_urgencia.length ? (
                      estatisticas.distribuicao.por_urgencia.map((u) => (
                        <li key={u.urgencia} className="flex justify-between text-sm text-gray-700 dark:text-gray-200">
                          <span>{u.urgencia}</span>
                          <span>
                            {u.quantidade} ({u.percentual}%)
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-500 dark:text-gray-400">{MESSAGES.WARNING.NO_DATA}</li>
                    )}
                  </ul>
                </Card>

                <Card className="p-6 dark:bg-neutral-800 dark:border-neutral-700">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Por canal</h3>
                  <ul className="space-y-2">
                    {estatisticas?.distribuicao.por_canal.length ? (
                      estatisticas.distribuicao.por_canal.map((c) => (
                        <li key={c.canal} className="flex justify-between text-sm text-gray-700 dark:text-gray-200">
                          <span>{c.canal}</span>
                          <span>
                            {c.quantidade} ({c.percentual}%)
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-500 dark:text-gray-400">{MESSAGES.WARNING.NO_DATA}</li>
                    )}
                  </ul>
                </Card>

                <Card className="p-6 dark:bg-neutral-800 dark:border-neutral-700">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Por secretaria</h3>
                  <ul className="space-y-2">
                    {estatisticas?.distribuicao.por_secretaria.length ? (
                      estatisticas.distribuicao.por_secretaria.map((s) => (
                        <li key={s.secretaria} className="flex justify-between text-sm text-gray-700 dark:text-gray-200">
                          <span>{s.secretaria}</span>
                          <span>
                            {s.quantidade} ({s.percentual}%)
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-500 dark:text-gray-400">{MESSAGES.WARNING.NO_DATA}</li>
                    )}
                  </ul>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Exportações */}
        <div className="px-4 mt-4 flex flex-col sm:flex-row gap-2">
          <Button
            onClick={async () => {
              try {
                const blob = await RelatoriosService.exportarCSV({
                  data_inicio: dataInicio,
                  data_fim: dataFim,
                  status,
                  urgencia,
                  secretarias,
                });
                RelatoriosService.baixarArquivo(
                  blob,
                  `relatorio_${dataInicio}_${dataFim}.csv`
                );
                showToast(MESSAGES.SUCCESS.RELATORIO_EXPORTED, "success");
              } catch (e: any) {
                showToast(e?.message || MESSAGES.ERROR.RELATORIO_EXPORT, "error");
              }
            }}
            aria-label="Exportar CSV"
            className="mobile-button"
          >
            Exportar CSV
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              try {
                const blob = await RelatoriosService.exportarCSV({
                  data_inicio: dataInicio,
                  data_fim: dataFim,
                  status,
                  urgencia,
                  secretarias,
                });
                RelatoriosService.baixarArquivo(
                  blob,
                  `relatorio_${dataInicio}_${dataFim}.csv`
                );
                showToast(MESSAGES.SUCCESS.RELATORIO_EXPORTED, "success");
              } catch (e: any) {
                showToast(e?.message || MESSAGES.ERROR.RELATORIO_EXPORT, "error");
              }
            }}
            aria-label="Exportar Excel (CSV)"
            className="mobile-button dark:border-neutral-600 dark:text-gray-200 dark:hover:bg-neutral-700"
          >
            Exportar Excel (CSV)
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}