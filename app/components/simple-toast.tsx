"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, XCircle, Info, X, Trash2, CheckCheck } from "lucide-react";
import { useEffect, useState } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

let toastId = 0;
const toastListeners = new Set<(toasts: Toast[]) => void>();
let currentToasts: Toast[] = [];

export const toast = {
  success: (message: string) => {
    addToast("success", message);
  },
  error: (message: string) => {
    addToast("error", message);
  },
  info: (message: string) => {
    addToast("info", message);
  },
};

function addToast(type: ToastType, message: string) {
  const id = `toast-${toastId++}`;
  const newToast = { id, type, message };
  currentToasts = [...currentToasts, newToast];
  notifyListeners();

  // Auto remove after 3 seconds
  setTimeout(() => {
    removeToast(id);
  }, 3000);
}

function removeToast(id: string) {
  currentToasts = currentToasts.filter((t) => t.id !== id);
  notifyListeners();
}

function notifyListeners() {
  toastListeners.forEach((listener) => listener(currentToasts));
}

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    toastListeners.add(setToasts);
    return () => {
      toastListeners.delete(setToasts);
    };
  }, []);

  const getIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return <CheckCircle className="text-green-500" size={20} />;
      case "error":
        return <XCircle className="text-red-500" size={20} />;
      case "info":
        return <Info className="text-blue-500" size={20} />;
    }
  };

  const getStyles = (type: ToastType) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-lg pointer-events-auto min-w-[300px] ${getStyles(
              t.type
            )}`}
          >
            {getIcon(t.type)}
            <p className="flex-1 text-sm font-bold">{t.message}</p>
            <button
              onClick={() => removeToast(t.id)}
              className="p-1 hover:bg-black/5 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}