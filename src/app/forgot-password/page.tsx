"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle, Mail } from "lucide-react";
import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StepIndicator } from "@/components/ui/file-upload";
import { useToast } from "@/components/ui/toast-provider";
import { validateEmail, validatePhone, validatePasswordMatch, validateRequired } from "@/lib/utils/validators";

const STEPS = ["Контакт", "Отправка", "Код", "Новый пароль"];
const TEST_CODE = "123456";

export default function ForgotPasswordPage() {
  const { showToast } = useToast();
  const [step, setStep] = useState(0);
  const [contact, setContact] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateContact = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "Email или телефон обязателен";
    if (trimmed.includes("@")) return validateEmail(trimmed);
    return validatePhone(trimmed);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateContact(contact);
    if (error) {
      setErrors({ contact: error });
      return;
    }
    setErrors({});
    setStep(1);
    setTimeout(() => setStep(2), 1500);
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code !== TEST_CODE) {
      setErrors({ code: "Неверный код. Для демо используйте 123456" });
      showToast("Неверный код подтверждения", "error");
      return;
    }
    setErrors({});
    setStep(3);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    const passwordError = validateRequired(password, "Пароль");
    if (passwordError) nextErrors.password = passwordError;
    const matchError = validatePasswordMatch(password, confirmPassword);
    if (matchError) nextErrors.confirmPassword = matchError;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    showToast("Пароль успешно изменён");
    setStep(4);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1 mx-auto max-w-site w-full px-4 py-8">
        <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-2">Восстановление пароля</h1>
        <p className="text-sm text-gray-600 mb-6">
          Следуйте шагам для сброса пароля
        </p>

        {step < 4 && <StepIndicator steps={STEPS} currentStep={step} />}

        {step === 0 && (
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <Input
              label="Email или телефон"
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              error={errors.contact}
              placeholder="example@mail.ru или +7 900 000-00-00"
            />
            <Button type="submit" className="w-full">
              Продолжить
            </Button>
            <Link href="/login" className="block text-center text-sm underline">
              Вернуться ко входу
            </Link>
          </form>
        )}

        {step === 1 && (
          <div className="flex flex-col items-center py-8 text-center border border-gray-300">
            <Mail className="h-10 w-10 text-gray-400 mb-3 animate-pulse" />
            <p className="text-sm font-medium">Отправляем код...</p>
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div className="border border-gray-300 bg-gray-50 p-4 text-sm text-gray-700 mb-2">
              Код отправлен на <strong>{contact}</strong>. Проверьте почту или SMS.
            </div>
            <Input
              label="Код подтверждения"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              error={errors.code}
              placeholder="6 цифр"
            />
            <p className="text-xs text-gray-500">Демо-код: 123456</p>
            <Button type="submit" className="w-full">
              Подтвердить код
            </Button>
            <button
              type="button"
              className="w-full text-sm underline text-gray-600"
              onClick={() => showToast("Код отправлен повторно")}
            >
              Отправить код повторно
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Input
              label="Новый пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              autoComplete="new-password"
            />
            <Input
              label="Подтверждение пароля"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              autoComplete="new-password"
            />
            <Button type="submit" className="w-full">
              Сохранить пароль
            </Button>
          </form>
        )}

        {step === 4 && (
          <div className="flex flex-col items-center py-8 text-center border border-gray-900">
            <CheckCircle className="h-12 w-12 text-gray-900 mb-4" />
            <h2 className="text-lg font-semibold mb-2">Пароль изменён</h2>
            <p className="text-sm text-gray-600 mb-6">
              Теперь вы можете войти с новым паролем
            </p>
            <Link href="/login">
              <Button>Перейти ко входу</Button>
            </Link>
          </div>
        )}
        </div>
      </main>
      <Footer />
    </div>
  );
}