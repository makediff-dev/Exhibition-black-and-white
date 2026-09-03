"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { CONTRACTOR_REGISTRATION_INTENT_KEY, type HomeOrderCard } from "@/constants/home-orders";
import { useAuthStore } from "@/lib/store";

interface HomeOrderRespondModalProps {
  open: boolean;
  order: HomeOrderCard | null;
  onClose: () => void;
}

export function HomeOrderRespondModal({ open, order, onClose }: HomeOrderRespondModalProps) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userRole = useAuthStore((s) => s.user?.role);

  const handleRegister = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(CONTRACTOR_REGISTRATION_INTENT_KEY, "1");
    }
    onClose();
    router.push("/register");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Нужна регистрация исполнителя"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
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
                onClose();
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
          {order ? (
            <>
              {" "}
              «<span className="font-medium">{order.title}</span>»
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
  );
}