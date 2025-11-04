"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type ComboItem = { label: string; value: string };

function normalizeItems(items: (string | ComboItem)[]): ComboItem[] {
  return items.map((it) =>
    typeof it === "string" ? { label: it, value: it } : it
  );
}

type BaseProps = {
  items: (string | ComboItem)[];
  placeholder?: string;
  searchPlaceholder?: string;
  ariaLabel?: string;
  disabled?: boolean;
  className?: string;
  menuClassName?: string;
  showChips?: boolean;
};

type SingleProps = BaseProps & {
  multiple?: false;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
};

type MultiProps = BaseProps & {
  multiple: true;
  value: string[];
  onChange: (value: string[]) => void;
};

export type ComboboxProps = SingleProps | MultiProps;

export function Combobox(props: ComboboxProps) {
  const {
    items: rawItems,
    placeholder = "Selecionar...",
    searchPlaceholder = "Buscar...",
    ariaLabel = "Combobox",
    disabled,
    className,
    menuClassName,
    showChips = true,
  } = props;

  const items = useMemo(() => normalizeItems(rawItems), [rawItems]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const controlRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const id = useId();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) =>
      it.label.toLowerCase().includes(q) || it.value.toLowerCase().includes(q)
    );
  }, [items, query]);

  const valueToLabel = (val?: string) => {
    const f = items.find((i) => i.value === val);
    return f?.label ?? val ?? "";
  };

  const isSelected = (val: string) => {
    if (props.multiple) return props.value.includes(val);
    return props.value === val;
  };

  const selectValue = (val: string) => {
    if (props.multiple) {
      const set = new Set(props.value);
      if (set.has(val)) set.delete(val);
      else set.add(val);
      props.onChange(Array.from(set));
    } else {
      props.onChange(props.value === val ? undefined : val);
      setOpen(false);
    }
  };

  const clearAll = () => {
    if (props.multiple) {
      props.onChange([]);
    } else {
      props.onChange(undefined);
    }
  };

  const removeChip = (val: string) => {
    if (props.multiple) {
      props.onChange(props.value.filter((v) => v !== val));
    }
  };

  // close on click outside
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!controlRef.current?.contains(t) && !listRef.current?.contains(t)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  // manage active index when open/filter changes
  useEffect(() => {
    if (open) setActiveIndex(filtered.length ? 0 : -1);
  }, [open, filtered.length]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => searchRef.current?.focus(), 0);
      }
      return;
    }

    if (e.key === "Escape") {
      setOpen(false);
      controlRef.current?.focus();
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
      return;
    }
    if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
      return;
    }
    if (e.key === "End") {
      e.preventDefault();
      setActiveIndex(filtered.length - 1);
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const opt = filtered[activeIndex];
      if (opt) selectValue(opt.value);
      return;
    }
  };

  const listboxId = `${id}-listbox`;
  const activeId = activeIndex >= 0 ? `${id}-opt-${activeIndex}` : undefined;

  const displayText = useMemo(() => {
    if (props.multiple) {
      const selectedLabels = props.value
        .map((v) => valueToLabel(v))
        .filter(Boolean);
      if (selectedLabels.length === 0) return placeholder;
      if (selectedLabels.length <= 2) return selectedLabels.join(", ");
      return `${selectedLabels.slice(0, 2).join(", ")} +${
        selectedLabels.length - 2
      }`;
    } else {
      return props.value ? valueToLabel(props.value) : placeholder;
    }
  }, [props, placeholder]);

  const selectedChips = useMemo(() => {
    if (!props.multiple || !showChips) return [];
    return props.value.map((v) => ({ value: v, label: valueToLabel(v) }));
  }, [props, showChips]);

  const hasSelection = props.multiple ? props.value.length > 0 : !!props.value;

  return (
    <div className={cn("relative", className)}>
      <button
        ref={controlRef}
        type="button"
        className={cn(
          "w-full flex items-center justify-between gap-2 px-3 py-3 rounded-lg border bg-white text-gray-900 dark:bg-neutral-800 dark:text-gray-100 dark:border-neutral-700",
          "min-h-[44px] text-left transition-all",
          disabled && "opacity-50 cursor-not-allowed",
          open && "ring-2 ring-primary-500 border-primary-500"
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={activeId}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel}
      >
        <span className={cn("truncate flex-1", !props.value && "text-gray-500 dark:text-gray-400")}>{displayText}</span>
        <ChevronDown className={cn("w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform", open && "rotate-180")} />
      </button>

      {/* Chips below control */}
      <AnimatePresence>
        {showChips && selectedChips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 mt-2"
          >
            {selectedChips.map((chip) => (
              <motion.span
                key={chip.value}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300 border border-primary-200 dark:border-primary-800"
              >
                <span className="truncate max-w-[120px]">{chip.label}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeChip(chip.value);
                  }}
                  className="hover:bg-primary-200 dark:hover:bg-primary-800 rounded p-0.5 transition-colors"
                  aria-label={`Remover ${chip.label}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.15 }}
          className={cn(
            "absolute z-50 mt-2 w-full rounded-lg border bg-white dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 shadow-lg",
            menuClassName
          )}
          role="presentation"
        >
          <div className="p-2 border-b border-gray-200 dark:border-neutral-700">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-2 rounded-md bg-gray-50 dark:bg-neutral-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 border border-gray-200 dark:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            {hasSelection && (
              <button
                onClick={clearAll}
                className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
              >
                <X className="w-3 h-3" />
                Limpar tudo
              </button>
            )}
          </div>

          <ul
            ref={listRef}
            id={listboxId}
            role="listbox"
            aria-multiselectable={props.multiple || undefined}
            className="max-h-60 overflow-auto py-1"
          >
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">Nenhum resultado</li>
            )}
            {filtered.map((opt, idx) => {
              const selected = isSelected(opt.value);
              const active = idx === activeIndex;
              return (
                <li
                  id={`${id}-opt-${idx}`}
                  key={opt.value}
                  role="option"
                  aria-selected={selected}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => selectValue(opt.value)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 cursor-pointer select-none transition-colors",
                    active
                      ? "bg-primary-50 text-primary-700 dark:bg-neutral-700 dark:text-gray-100"
                      : "text-gray-700 dark:text-gray-200",
                    selected && "font-medium"
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {selected && <Check className="w-4 h-4 text-primary-600 dark:text-primary-400" />}
                </li>
              );
            })}
          </ul>
        </motion.div>
      )}
    </div>
  );
}
