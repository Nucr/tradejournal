"use client";

import { createContext, useContext, useState, useCallback, ReactNode, useRef } from "react";

export interface Toast {
  id: string;
  message: string;
  type?: "success" | "error" | "info";
  action?: { label: string; onClick: () => void };
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (t: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
  success: (msg: string) => void;
  error: (msg: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toasts: [],
  addToast: () => "",
  removeToast: () => {},
  success: () => {},
  error: () => {},
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((t: Omit<Toast, "id">): string => {
    const id = `toast-${++counter.current}`;
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => removeToast(id), 4000);
    return id;
  }, [removeToast]);

  const success = useCallback((msg: string) => {
    addToast({ message: msg, type: "success" });
  }, [addToast]);

  const error = useCallback((msg: string) => {
    addToast({ message: msg, type: "error" });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, success, error }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
