"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  CONTRACTOR_REGISTRATION_INTENT_KEY,
  HOME_ORDER_CATEGORIES,
  URGENT_HOME_ORDERS,
  type HomeOrderCard,
} from "@/constants/home-orders";
import { useAuthStore } from "@/lib/store";
import { HomeOrderCardItem } from "./home-order-card";
import { HomeScrollSection } from "./home-scroll-section";

export function HomeNewOrdersSection() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userRole = useAuthStore((s) => s.user?.role);
  const [registrationModalOpen, setRegistrationModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<HomeOrderCard | null>(null);

  const canRespondAsContractor = isAuthenticated && userRole === "contractor";

  const handleRespond = (order: HomeOrderCard) => {
    if (canRespondAsContractor) {
      router.push(`/requests/${order.requestId}`);
      return;
    }

    setSelectedOrder(order);
    setRegistrationModalOpen(true);
  };

  const handleRegister = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(CONTRACTOR_REGISTRATION_INTENT_KEY, "1");
    }
    setRegistrationModalOpen(false);
    router.push("/register");
  };

  return (
    <>
      <HomeScrollSection title="Срочные заказы" linkHref="/requests" linkLabel="Смотреть все заказы">
        {URGENT_HOME_ORDERS.map((order) => (
          <HomeOrderCardItem key={order.id} order={order} onRespond={handleRespond} buttonVariant="blue" />
        ))}
      </HomeScrollSection>

      {HOME_ORDER_CATEGORIES.map((category) => (
        <HomeScrollSection
          key={category.title}
          title={category.title}
          linkHref="/services"
          linkLabel="Все услуги"
        >
          {category.orders.map((order) => (
            <HomeOrderCardItem key={order.id} order={order} onRespond={handleRespond} />
          ))}
        </HomeScrollSection>
      ))}

      <Modal
        open={registrationModalOpen}
        onClose={() => setRegistrationModalOpen(false)}
        title="Нужна регистрация исполнителя"
        footer={
          <>
            <Button variant="outline" onClick={() => setRegistrationModalOpen(false)}>
              Закрыть
            </Button>
            {!isAuthenticated ? (
              <Button onClick={handleRegister}>Зарегистрироваться</Button>
            ) : (
              <Button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.sessionStorage.setItem(CONTRACTOR_REGISTRATION_INTENT_KEY, "1");
                  }
                  setRegistrationModalOpen(false);
                  router.push("/register");
                }}
              >
                Зарегистрировать компанию
              </Button>
            )}
          </>
        }
      >
        <div className="space-y-3 text-sm text-gray-700">
          <p>
            Чтобы откликнуться на заказ
            {selectedOrder ? (
              <>
                {" "}
                «<span className="font-medium">{selectedOrder.title}</span>»
              </>
            ) : null}
            , зарегистрируйте организацию на платформе и выберите роль{" "}
            <span className="font-medium">«Исполнитель»</span>.
          </p>
          <p>
            После подтверждения email и модерации вы сможете просматривать детали заявок и
            отправлять отклики напрямую с главной страницы.
          </p>
          {isAuthenticated && userRole !== "contractor" && (
            <p className="border border-gray-300 bg-gray-50 p-3 text-xs">
              Вы уже вошли в систему как другая роль. Для откликов на заказы зарегистрируйте
              компанию-исполнителя или войдите под аккаунтом исполнителя.
            </p>
          )}
        </div>
      </Modal>
    </>
  );
}
