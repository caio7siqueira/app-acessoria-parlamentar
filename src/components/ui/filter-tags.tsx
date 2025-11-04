"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export type FilterTag = {
  label: string;
  value: string;
  category?: string;
};

type FilterTagsProps = {
  tags: FilterTag[];
  onRemove: (value: string) => void;
  onClearAll?: () => void;
  className?: string;
};

/**
 * Componente para exibir tags de filtros ativos com animações e botões de remoção.
 * Otimizado para mobile (iPhone) com áreas de toque adequadas.
 */
export function FilterTags({ tags, onRemove, onClearAll, className }: FilterTagsProps) {
  if (tags.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex flex-wrap items-center gap-2", className)}
    >
      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
        Filtros ativos:
      </span>
      <AnimatePresence mode="popLayout">
        {tags.map((tag) => (
          <motion.span
            key={tag.value}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300 border border-primary-200 dark:border-primary-800"
          >
            {tag.category && (
              <span className="text-primary-600 dark:text-primary-400 font-semibold">
                {tag.category}:
              </span>
            )}
            <span className="truncate max-w-[150px]">{tag.label}</span>
            <button
              onClick={() => onRemove(tag.value)}
              className="hover:bg-primary-200 dark:hover:bg-primary-800 rounded-full p-0.5 transition-colors min-h-[20px] min-w-[20px] flex items-center justify-center"
              aria-label={`Remover filtro ${tag.label}`}
            >
              <X className="w-3 h-3" />
            </button>
          </motion.span>
        ))}
      </AnimatePresence>
      {onClearAll && tags.length > 1 && (
        <motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={onClearAll}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800 transition-colors"
        >
          <X className="w-3 h-3" />
          Limpar todos
        </motion.button>
      )}
    </motion.div>
  );
}
