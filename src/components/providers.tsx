"use client";

import { ToastProvider } from "@/components/ui/toast-provider";
import { DemoMenu } from "@/components/prototype/demo-menu";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <DemoMenu />
    </ToastProvider>
  );
}
