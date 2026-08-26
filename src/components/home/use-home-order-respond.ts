"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import type { HomeOrderCard } from "@/constants/home-orders";
import { useAuthStore } from "@/lib/store";

export function useHomeOrderRespond() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userRole = useAuthStore((s) => s.user?.role);
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<HomeOrderCard | null>(null);

  const canRespondAsContractor = isAuthenticated && userRole === "contractor";

  const handleRespond = useCallback(
    (order: HomeOrderCard) => {
      if (canRespondAsContractor) {
        router.push(`/requests/${order.requestId}`);
        return;
      }

      setSelectedOrder(order);
      setRegistrationModalOpen(true);
    },
    [canRespondAsContractor, router],
  );

  const closeModal = useCallback(() => {
    setRegistrationModalOpen(false);
  }, []);

  return {
    handleRespond,
    registrationModalOpen,
    selectedOrder,
    closeModal,
  };
}
