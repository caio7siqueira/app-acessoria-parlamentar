'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger',
  isLoading = false
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const variantStyles = {
    danger: {
      bg: 'bg-red-50 dark:bg-red-900/10',
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
      titleColor: 'text-red-900 dark:text-red-200',
      button: 'bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800'
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/10',
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      titleColor: 'text-yellow-900 dark:text-yellow-200',
      button: 'bg-yellow-600 hover:bg-yellow-700 text-white dark:bg-yellow-700 dark:hover:bg-yellow-800'
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/10',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      titleColor: 'text-blue-900 dark:text-blue-200',
      button: 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-800'
    }
  };

  const styles = variantStyles[variant];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleCancel}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1200]"
            aria-hidden="true"
          />

          {/* Dialog */}
          <div className="fixed inset-0 z-[1201] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto w-full max-w-md"
              role="dialog"
              aria-modal="true"
              aria-labelledby="dialog-title"
              aria-describedby="dialog-description"
            >
              <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header with Icon */}
                <div className={`${styles.bg} px-6 pt-6 pb-4`}>
                  <div className="flex items-start gap-4">
                    <div className={`${styles.iconBg} rounded-full p-3 flex-shrink-0`}>
                      <AlertTriangle className={`w-6 h-6 ${styles.iconColor}`} aria-hidden="true" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2
                        id="dialog-title"
                        className={`text-lg font-semibold ${styles.titleColor}`}
                      >
                        {title}
                      </h2>
                    </div>
                    <button
                      onClick={handleCancel}
                      disabled={isLoading}
                      className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Fechar diálogo"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="px-6 py-4">
                  <p
                    id="dialog-description"
                    className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed"
                  >
                    {description}
                  </p>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-neutral-900/50 flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="min-w-[100px] min-h-[44px] rounded-xl font-medium"
                  >
                    {cancelText}
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    disabled={isLoading}
                    className={`${styles.button} min-w-[100px] min-h-[44px] rounded-xl font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200`}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Excluindo...
                      </div>
                    ) : (
                      confirmText
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
