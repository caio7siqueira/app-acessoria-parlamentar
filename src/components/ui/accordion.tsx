"use client";

import React, { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";

type AccordionType = "single" | "multiple";

type AccordionContextValue = {
  type: AccordionType;
  openItems: Set<string>;
  toggleItem: (val: string) => void;
  registerTrigger: (el: HTMLButtonElement) => void;
  triggers: React.MutableRefObject<HTMLButtonElement[]>;
};

const AccordionContext = createContext<AccordionContextValue | null>(null);

export function Accordion({
  children,
  type = "single",
  value,
  defaultValue,
  onValueChange,
  className,
}: {
  children: React.ReactNode;
  type?: AccordionType;
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (val: string | string[]) => void;
  className?: string;
}) {
  const isControlled = value !== undefined;
  const init = useMemo(() => {
    const v = (isControlled ? value : defaultValue) ?? (type === "multiple" ? [] : "");
    return new Set(Array.isArray(v) ? v : v ? [v] : []);
  }, [value, defaultValue, isControlled, type]);

  const [internal, setInternal] = useState<Set<string>>(init);
  const openItems = isControlled ? new Set(Array.isArray(value) ? value : value ? [value] : []) : internal;

  const triggers = useRef<HTMLButtonElement[]>([]);
  const registerTrigger = (el: HTMLButtonElement) => {
    if (!triggers.current.includes(el)) triggers.current.push(el);
  };

  const setOpenItems = useCallback(
    (next: Set<string>) => {
      if (isControlled) {
        onValueChange?.(type === "multiple" ? Array.from(next) : Array.from(next)[0] ?? "");
      } else {
        setInternal(next);
        onValueChange?.(type === "multiple" ? Array.from(next) : Array.from(next)[0] ?? "");
      }
    },
    [isControlled, onValueChange, type]
  );

  const toggleItem = (val: string) => {
    const next = new Set(openItems);
    if (type === "single") {
      if (next.has(val)) next.clear();
      else {
        next.clear();
        next.add(val);
      }
    } else {
      if (next.has(val)) next.delete(val);
      else next.add(val);
    }
    setOpenItems(next);
  };

  const ctx = useMemo<AccordionContextValue>(() => ({ type, openItems, toggleItem, registerTrigger, triggers }), [type, openItems]);

  return <div className={cn("w-full", className)}>{<AccordionContext.Provider value={ctx}>{children}</AccordionContext.Provider>}</div>;
}

export function AccordionItem({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) {
  const id = useId();
  const regionId = `${id}-region`;
  const headerId = `${id}-header`;
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error("AccordionItem must be used within Accordion");
  const open = ctx.openItems.has(value);

  return (
    <div className={cn("border border-gray-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800", className)}>
      {React.Children.map(children, (child: any) =>
        React.isValidElement(child)
          ? (React.cloneElement(child as any, { __accordion: { value, open, toggle: ctx.toggleItem, regionId, headerId, registerTrigger: ctx.registerTrigger, triggers: ctx.triggers } } as any) as any)
          : child
      )}
    </div>
  );
}

export function AccordionTrigger({ children, className, __accordion }: any) {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const { value, open, toggle, regionId, headerId, registerTrigger, triggers } = __accordion;

  useEffect(() => {
    if (btnRef.current) registerTrigger(btnRef.current);
  }, [registerTrigger]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const els = triggers.current;
    const idx = els.indexOf(btnRef.current!);
    if (e.key === "ArrowDown") {
      e.preventDefault();
      els[(idx + 1) % els.length]?.focus();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      els[(idx - 1 + els.length) % els.length]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      els[0]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      els[els.length - 1]?.focus();
    }
  };

  return (
    <button
      ref={btnRef}
      id={headerId}
      aria-controls={regionId}
      aria-expanded={open}
      onClick={() => toggle(value)}
      onKeyDown={onKeyDown}
      className={cn(
        "w-full flex items-center justify-between gap-3 p-4 text-left rounded-xl",
        "active:bg-gray-50 dark:active:bg-neutral-700",
        className
      )}
    >
      <span className="flex-1 min-w-0">{children}</span>
      <ChevronDown className={cn("w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform", open && "rotate-180")}/>
    </button>
  );
}

export function AccordionContent({ children, className, __accordion }: any) {
  const { open, regionId, headerId, toggle, value } = __accordion;
  const y = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnd = (_: any, info: PanInfo) => {
    setIsDragging(false);
    // Se arrastou para baixo mais de 50px, fecha
    if (info.offset.y > 50) {
      toggle(value);
    }
  };

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          id={regionId}
          role="region"
          aria-labelledby={headerId}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className={cn(
            "overflow-hidden border-t border-gray-200 dark:border-neutral-700",
            className
          )}
        >
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            style={{ y }}
            className={cn("p-4 touch-pan-y", isDragging && "cursor-grabbing")}
          >
            {/* Swipe indicator (iOS style) */}
            <div className="flex justify-center mb-2 md:hidden">
              <div className="w-10 h-1 bg-gray-300 dark:bg-neutral-600 rounded-full" />
            </div>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
