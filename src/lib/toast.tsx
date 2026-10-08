import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

type ToastType = "info" | "success" | "error";
type ShowToast = (message: string, type?: ToastType) => void;

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

const ToastContext = createContext<ShowToast | null>(null);

/** Returns a function that shows a short message at the bottom of the screen. */
export function useToast(): ShowToast {
  const show = useContext(ToastContext);
  // Without a provider the call does nothing, so components still render on their own.
  return show ?? (() => {});
}

const BORDER: Record<ToastType, string> = {
  info: "border-strong",
  success: "border-success",
  error: "border-danger",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const show = useCallback<ShowToast>((message, type = "info") => {
    const id = ++nextId.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      {/* role="status" makes screen readers announce each new message politely */}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed bottom-6 left-1/2 z-(--z-toast) flex -translate-x-1/2 flex-col gap-2"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`max-w-[min(420px,90vw)] animate-rise-in rounded-md border bg-raised px-5 py-2 text-center text-sm text-primary shadow-md ${BORDER[t.type]}`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
