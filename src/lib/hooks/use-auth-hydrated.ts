"use client";

import { useSyncExternalStore } from "react";
import { useAuthStore } from "@/lib/store";

function subscribe(onStoreChange: () => void) {
  return useAuthStore.persist.onFinishHydration(onStoreChange);
}

function getHydratedSnapshot() {
  return useAuthStore.persist.hasHydrated();
}

function getServerHydratedSnapshot() {
  return false;
}

/** Waits for zustand persist rehydration before choosing cabinet vs public layout. */
export function useAuthHydrated() {
  return useSyncExternalStore(subscribe, getHydratedSnapshot, getServerHydratedSnapshot);
}
