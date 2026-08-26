"use client";

import { createContext, useContext, type ReactNode } from "react";
import { HomeOrderRespondModal } from "./home-order-respond-modal";
import { useHomeOrderRespond } from "./use-home-order-respond";
import type { HomeOrderCard } from "@/constants/home-orders";

interface HomeOrdersContextValue {
  handleRespond: (order: HomeOrderCard) => void;
}

const HomeOrdersContext = createContext<HomeOrdersContextValue | null>(null);

export function HomeOrdersProvider({ children }: { children: ReactNode }) {
  const { handleRespond, registrationModalOpen, selectedOrder, closeModal } = useHomeOrderRespond();

  return (
    <HomeOrdersContext.Provider value={{ handleRespond }}>
      {children}
      <HomeOrderRespondModal open={registrationModalOpen} order={selectedOrder} onClose={closeModal} />
    </HomeOrdersContext.Provider>
  );
}

export function useHomeOrdersContext() {
  const context = useContext(HomeOrdersContext);
  if (!context) {
    throw new Error("useHomeOrdersContext must be used within HomeOrdersProvider");
  }
  return context;
}
