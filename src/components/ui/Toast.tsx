"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, X } from "lucide-react";

type ToastType = "success" | "error";

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  action?: ToastAction;
}

interface ShowToastOptions {
  action?: ToastAction;
  durationMs?: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, options?: ShowToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (message: string, type: ToastType = "success", options?: ShowToastOptions) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, type, action: options?.action }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, options?.durationMs ?? 3000);
    },
    []
  );

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:bottom-6 right-4 z-50 flex flex-col gap-2 max-w-sm safe-area-pr">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl border shadow-card animate-in slide-in-from-right",
              toast.type === "success"
                ? "bg-card border-positive/30 text-foreground"
                : "bg-card border-negative/30 text-foreground"
            )}
            role="status"
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="h-5 w-5 text-positive shrink-0" />
            ) : (
              <XCircle className="h-5 w-5 text-negative shrink-0" />
            )}
            <p className="text-sm flex-1">{toast.message}</p>
            {toast.action && (
              <button
                type="button"
                onClick={() => {
                  toast.action?.onClick();
                  dismiss(toast.id);
                }}
                className="text-sm font-medium text-primary hover:text-primary-hover transition-colors shrink-0 min-h-[44px] px-2 active:opacity-70"
              >
                {toast.action.label}
              </button>
            )}
            <button
              onClick={() => dismiss(toast.id)}
              className="text-muted hover:text-foreground transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
