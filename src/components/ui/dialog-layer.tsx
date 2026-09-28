"use client";

import { createContext, useContext, useEffect, useId, useMemo, useState, type ReactNode } from "react";

interface DialogLayerValue {
  register: (id: string) => void;
  unregister: (id: string) => void;
  isForeground: (id: string) => boolean;
}

const DialogLayerContext = createContext<DialogLayerValue | null>(null);

export function DialogLayerProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<string[]>([]);

  const value = useMemo<DialogLayerValue>(
    () => ({
      register: (id) => {
        setStack((current) => (current.includes(id) ? current : [...current, id]));
      },
      unregister: (id) => {
        setStack((current) => current.filter((item) => item !== id));
      },
      isForeground: (id) => stack.at(-1) === id,
    }),
    [stack],
  );

  return <DialogLayerContext.Provider value={value}>{children}</DialogLayerContext.Provider>;
}

export function useDialogLayer(open: boolean) {
  const id = useId();
  const context = useContext(DialogLayerContext);

  useEffect(() => {
    if (!context || !open) return;
    context.register(id);
    return () => context.unregister(id);
  }, [context, id, open]);

  return {
    id,
    isForeground: !context || !open ? open : context.isForeground(id),
  };
}
