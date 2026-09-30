"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface DialogLayerValue {
  register: (id: string) => void;
  unregister: (id: string) => void;
  isForeground: (id: string) => boolean;
}

const DialogLayerContext = createContext<DialogLayerValue | null>(null);

export function DialogLayerProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<string[]>([]);

  const register = useCallback((id: string) => {
    setStack((current) => (current.includes(id) ? current : [...current, id]));
  }, []);

  const unregister = useCallback((id: string) => {
    setStack((current) => current.filter((item) => item !== id));
  }, []);

  const isForeground = useCallback((id: string) => stack.at(-1) === id, [stack]);

  const value = useMemo<DialogLayerValue>(
    () => ({ register, unregister, isForeground }),
    [isForeground, register, unregister],
  );

  return <DialogLayerContext.Provider value={value}>{children}</DialogLayerContext.Provider>;
}

export function useDialogLayer(open: boolean) {
  const id = useId();
  const context = useContext(DialogLayerContext);
  const register = context?.register;
  const unregister = context?.unregister;

  useEffect(() => {
    if (!register || !unregister || !open) return;
    register(id);
    return () => unregister(id);
  }, [id, open, register, unregister]);

  return {
    id,
    isForeground: !context || !open ? open : context.isForeground(id),
  };
}
