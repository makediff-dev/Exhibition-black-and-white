"use client";

import { SharedPageShell } from "@/components/layout/shared-page-shell";
import { PaymentsPanel } from "@/components/finance/payments-panel";

export default function PaymentsPage() {
  return (
    <SharedPageShell
      title="Оплаты и финансы"
      breadcrumbs={[
        { label: "Главная", href: "/" },
        { label: "Оплаты" },
      ]}
      maxWidth="wide"
    >
      <PaymentsPanel />
    </SharedPageShell>
  );
}
