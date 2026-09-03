"use client";

import { ToastProvider } from "@/components/ui/toast-provider";
import { DemoMenu } from "@/components/prototype/demo-menu";
import { useAuthHydrated } from "@/lib/hooks/use-auth-hydrated";

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
      <AuthHydrationGate>
        {children}
        <DemoMenu />
      </AuthHydrationGate>
    </ToastProvider>
  );
}