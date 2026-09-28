"use client";

import { ToastProvider } from "@/components/ui/toast-provider";
import { DialogLayerProvider } from "@/components/ui/dialog-layer";
import { DemoMenu } from "@/components/prototype/demo-menu";
import { useAuthHydrated } from "@/lib/hooks/use-auth-hydrated";

const SHOW_DEMO = process.env.NEXT_PUBLIC_SHOW_DEMO !== "0";

function AuthHydrationGate({ children }: { children: React.ReactNode }) {
  const hydrated = useAuthHydrated();

  if (!hydrated) {
    return <div className="min-h-screen bg-white" aria-busy="true" />;
  }

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <DialogLayerProvider>
        <AuthHydrationGate>
          {children}
          {SHOW_DEMO ? <DemoMenu /> : null}
        </AuthHydrationGate>
      </DialogLayerProvider>
    </ToastProvider>
  );
}