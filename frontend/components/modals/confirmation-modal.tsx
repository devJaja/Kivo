"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import WaterButton from "@/components/water-button";

interface ConfirmationModalProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export default function ConfirmationModal({
  title,
  description,
  icon,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
}: ConfirmationModalProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-card rounded-lg p-6 shadow-xl max-w-sm w-full relative"
        >
          <button onClick={onCancel} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>

          <div className="flex flex-col items-center text-center space-y-4">
            {icon && <div className="text-4xl text-primary">{icon}</div>}
            <h3 className="text-xl font-bold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>

            <div className="flex gap-3 w-full pt-4">
              <WaterButton
                onClick={onCancel}
                variant="secondary"
                size="md"
                className="flex-1"
                disabled={isLoading}
              >
                {cancelText}
              </WaterButton>
              <WaterButton
                onClick={onConfirm}
                variant="primary"
                size="md"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                    className="inline-block"
                  >
                    ⊙
                  </motion.div>
                ) : (
                  confirmText
                )}
              </WaterButton>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
