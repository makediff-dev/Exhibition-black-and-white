"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CabinetAwareLayout } from "@/components/layout/cabinet-aware-layout";
import { CustomerCheckoutSection } from "@/components/customer/customer-checkout-section";
import { useCabinetSession } from "@/lib/hooks/use-cabinet-session";
import { CUSTOMER_CHECKOUT_HREF, getCartHref } from "@/lib/utils/cart-routes";

export default function CheckoutPage() {
  const router = useRouter();
  const { hydrated, accountRole } = useCabinetSession();

  useEffect(() => {
    if (hydrated && accountRole === "customer") {
      router.replace(CUSTOMER_CHECKOUT_HREF);
    }
  }, [hydrated, accountRole, router]);

  if (accountRole === "customer") {
    return null;
  }

  return (
    <CabinetAwareLayout
      title="Оформление заказа"
      showBack
      backFallbackHref={getCartHref(accountRole)}
    >
      <CustomerCheckoutSection cartHref={getCartHref(accountRole)} />
    </CabinetAwareLayout>
  );
}
