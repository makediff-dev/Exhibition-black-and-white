"use client";

import { useSyncExternalStore } from "react";
import { usePrototypeStore } from "@/lib/store";

function subscribe(onStoreChange: () => void) {
  return usePrototypeStore.persist.onFinishHydration(onStoreChange);
}

function getHydratedSnapshot() {
  return usePrototypeStore.persist.hasHydrated();
}

function getServerHydratedSnapshot() {
  return false;
}

export function usePrototypeHydrated() {
  return useSyncExternalStore(subscribe, getHydratedSnapshot, getServerHydratedSnapshot);
}
