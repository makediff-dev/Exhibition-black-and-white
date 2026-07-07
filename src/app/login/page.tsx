"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast-provider";
import { validateEmail, validatePhone, validateRequired } from "@/lib/utils/validators";
import { ROLE_LABELS } from "@/constants/statuses";
import type { UserRole } from "@/data/types";

const DEMO_ROLES: UserRole[] = ["customer", "contractor", "venue", "organizer"];

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const { showToast } = useToast();

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const redirectToAccount = (role: UserRole) => {
    if (!role) return;
    showToast("Вход выполнен успешно");
    login(role);
    router.push(`/account/${role}`);
  };

  const validateLoginId = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "Email или телефон обязателен";
    if (trimmed.includes("@")) return validateEmail(trimmed);
    return validatePhone(trimmed);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};
    const loginError = validateLoginId(loginId);
    if (loginError) nextErrors.loginId = loginError;
    const passwordError = validateRequired(password, "Пароль");
    if (passwordError) nextErrors.password = passwordError;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    redirectToAccount("customer");
  };

  const handleDemoLogin = (role: UserRole) => {
    redirectToAccount(role);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1 mx-auto max-w-md w-full px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">Вход</h1>
        <p className="text-sm text-gray-600 mb-6">
          Войдите в личный кабинет по email и паролю или используйте демо-роли для прототипа
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email или телефон"
            type="text"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            error={errors.loginId}
            autoComplete="username"
          />
          <Input
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            autoComplete="current-password"
          />
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="border-gray-300"
              />
              Запомнить меня
            </label>
            <Link href="/forgot-password" className="underline hover:text-gray-700">
              Забыли пароль?
            </Link>
          </div>
          <Button type="submit" className="w-full">
            Войти
          </Button>
        </form>

        <p className="text-xs text-gray-500 mt-4 text-center">
          Вход по PIN-коду можно включить опционально в настройках профиля после авторизации.
        </p>

        <p className="text-sm text-center mt-4 text-gray-600">
          Нет аккаунта?{" "}
          <Link href="/register" className="underline font-medium text-gray-900">
            Зарегистрироваться
          </Link>
        </p>

        <div className="mt-8 border-t border-gray-200 pt-6">
          <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">
            Демо-вход по роли
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ROLES.map((role) => (
              <Button
                key={role}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin(role)}
              >
                {ROLE_LABELS[role as keyof typeof ROLE_LABELS]}
              </Button>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
