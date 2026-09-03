"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast-provider";

export function PinLoginSettings() {
  const { pinLoginEnabled, pinCode, setPinLoginSettings } = useAuthStore();
  const { showToast } = useToast();
  const [enabled, setEnabled] = useState(pinLoginEnabled);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!/^\d{4,6}$/.test(pin)) {
      setError("PIN-код должен содержать 4–6 цифр");
      return;
    }
    if (pin !== confirmPin) {
      setError("PIN-коды не совпадают");
      return;
    }

    setPinLoginSettings(true, pin);
    setPin("");
    setConfirmPin("");
    setError("");
    showToast("PIN-код для входа сохранён");
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium">Вход по PIN-коду</p>
        <p className="text-xs text-gray-600 mt-1">
          Опциональный способ быстрого входа. Основной вход — email и пароль.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => {
            const checked = e.target.checked;
            setEnabled(checked);
            setError("");
            if (!checked) {
              setPinLoginSettings(false);
              setPin("");
              setConfirmPin("");
              showToast("Вход по PIN отключён");
            }
          }}
        />
        Включить вход по PIN-коду
      </label>

      {enabled && (
        <div className="space-y-3">
          {pinCode && (
            <p className="text-xs text-gray-600 border border-dashed border-gray-300 px-3 py-2">
              PIN настроен. Введите новый PIN ниже, чтобы изменить его.
            </p>
          )}
          <Input
            label="Новый PIN-код"
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            placeholder="4–6 цифр"
          />
          <Input
            label="Подтвердите PIN-код"
            type="password"
            inputMode="numeric"
            maxLength={6}
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ""))}
            placeholder="Повторите PIN"
          />
        </div>
      )}

      {error && <p className="text-xs text-gray-700">{error}</p>}

      {enabled && (
        <Button size="sm" onClick={handleSave}>
          Сохранить PIN
        </Button>
      )}
    </div>
  );
}