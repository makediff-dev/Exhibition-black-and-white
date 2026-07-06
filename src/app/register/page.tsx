"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle, Clock, RefreshCw } from "lucide-react";
import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StepIndicator } from "@/components/ui/file-upload";
import { usePrototypeStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast-provider";
import {
  validateEmail,
  validatePasswordMatch,
  validatePhone,
  validateRequired,
} from "@/lib/utils/validators";
import {
  CITIES,
  EVENT_INDUSTRIES,
  SERVICE_CATEGORIES,
  TEST_COMPANY_DATA,
  TEST_INN,
} from "@/constants/categories";
import { ROLE_LABELS } from "@/constants/statuses";
import type { UserRole } from "@/data/types";

const REGISTRATION_STEPS = [
  "Роль",
  "Компания",
  "ЭДО",
  "Контакты",
  "Профиль",
  "Соглашения",
  "Подтверждение",
  "Модерация",
];

const ROLES: { id: UserRole; title: string; description: string }[] = [
  {
    id: "customer",
    title: "Заказчик",
    description: "Размещайте заявки, находите исполнителей и управляйте сделками",
  },
  {
    id: "contractor",
    title: "Исполнитель",
    description: "Предлагайте услуги, откликайтесь на заявки и получайте заказы",
  },
  {
    id: "venue",
    title: "Площадка",
    description: "Управляйте залами, бронированием и участниками мероприятий",
  },
  {
    id: "organizer",
    title: "Организатор",
    description: "Создавайте выставки, форумы и конференции на платформе",
  },
];

const EDO_OPERATORS = [
  { value: "", label: "Выберите оператора" },
  { value: "diadoc", label: "Диадок" },
  { value: "sbis", label: "СБИС" },
  { value: "kontur", label: "Контур" },
];

const TEST_CODE = "123456";
const RESEND_SECONDS = 60;

interface RegistrationDraft {
  step?: number;
  role?: UserRole;
  inn?: string;
  companyName?: string;
  ogrn?: string;
  address?: string;
  director?: string;
  mainOkved?: string;
  additionalOkved?: string[];
  edoOperator?: string;
  edoId?: string;
  edoVerified?: boolean | null;
  edoSkipped?: boolean;
  contactName?: string;
  position?: string;
  phone?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  cities?: string[];
  categories?: string[];
  hasProduction?: boolean;
  description?: string;
  venueName?: string;
  hallCapacity?: string;
  industries?: string[];
  termsAccepted?: boolean;
  privacyAccepted?: boolean;
  marketingAccepted?: boolean;
}

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const registrationDraft = usePrototypeStore((s) => s.registrationDraft);
  const setRegistrationDraft = usePrototypeStore((s) => s.setRegistrationDraft);

  const draft = registrationDraft as RegistrationDraft;
  const [step, setStep] = useState(draft.step ?? 0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [timer, setTimer] = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);

  const [form, setForm] = useState<RegistrationDraft>({
    role: draft.role ?? null,
    inn: draft.inn ?? "",
    companyName: draft.companyName ?? "",
    ogrn: draft.ogrn ?? "",
    address: draft.address ?? "",
    director: draft.director ?? "",
    mainOkved: draft.mainOkved ?? "",
    additionalOkved: draft.additionalOkved ?? [],
    edoOperator: draft.edoOperator ?? "",
    edoId: draft.edoId ?? "",
    edoVerified: draft.edoVerified ?? null,
    edoSkipped: draft.edoSkipped ?? false,
    contactName: draft.contactName ?? "",
    position: draft.position ?? "",
    phone: draft.phone ?? "",
    email: draft.email ?? "",
    password: draft.password ?? "",
    confirmPassword: draft.confirmPassword ?? "",
    cities: draft.cities ?? [],
    categories: draft.categories ?? [],
    hasProduction: draft.hasProduction ?? false,
    description: draft.description ?? "",
    venueName: draft.venueName ?? "",
    hallCapacity: draft.hallCapacity ?? "",
    industries: draft.industries ?? [],
    termsAccepted: draft.termsAccepted ?? false,
    privacyAccepted: draft.privacyAccepted ?? false,
    marketingAccepted: draft.marketingAccepted ?? false,
  });

  const saveDraft = useCallback(
    (updates: Partial<RegistrationDraft>, nextStep?: number) => {
      const merged = { ...form, ...updates, step: nextStep ?? step };
      setForm((prev) => ({ ...prev, ...updates }));
      if (nextStep !== undefined) setStep(nextStep);
      setRegistrationDraft(merged as Record<string, unknown>);
    },
    [form, step, setRegistrationDraft]
  );

  useEffect(() => {
    if (step !== 6 || canResend) return;
    const id = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          setCanResend(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [step, canResend]);

  const updateField = <K extends keyof RegistrationDraft>(key: K, value: RegistrationDraft[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayItem = (key: "cities" | "categories" | "industries", item: string) => {
    setForm((prev) => {
      const list = prev[key] ?? [];
      const next = list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
      return { ...prev, [key]: next };
    });
  };

  const handleFindCompany = () => {
    if (form.inn !== TEST_INN) {
      setErrors({ inn: "Компания не найдена. Для демо используйте ИНН 7701234567" });
      showToast("Компания не найдена", "error");
      return;
    }
    setErrors({});
    setForm((prev) => ({
      ...prev,
      companyName: TEST_COMPANY_DATA.name,
      ogrn: TEST_COMPANY_DATA.ogrn,
      address: TEST_COMPANY_DATA.address,
      director: TEST_COMPANY_DATA.director,
      mainOkved: TEST_COMPANY_DATA.mainOkved,
      additionalOkved: TEST_COMPANY_DATA.additionalOkved,
    }));
    showToast("Данные компании загружены");
  };

  const handleVerifyEdo = () => {
    if (!form.edoOperator || !form.edoId?.trim()) {
      setErrors({
        edoOperator: !form.edoOperator ? "Выберите оператора" : undefined,
        edoId: !form.edoId?.trim() ? "Укажите ID в системе ЭДО" : undefined,
      } as Record<string, string>);
      return;
    }
    const success = form.edoId.endsWith("1");
    updateField("edoVerified", success);
    showToast(
      success ? "ЭДО успешно подключено" : "Не удалось проверить ЭДО. ID должен заканчиваться на 1",
      success ? "success" : "error"
    );
  };

  const validateStep = (currentStep: number): boolean => {
    const nextErrors: Record<string, string> = {};

    switch (currentStep) {
      case 0:
        if (!form.role) nextErrors.role = "Выберите роль";
        break;
      case 1: {
        const innError = validateRequired(form.inn ?? "", "ИНН");
        if (innError) nextErrors.inn = innError;
        else if (!/^\d{10}$/.test(form.inn ?? "")) nextErrors.inn = "ИНН должен содержать 10 цифр";
        if (!form.companyName) nextErrors.companyName = "Найдите компанию по ИНН";
        break;
      }
      case 2:
        if (!form.edoSkipped && form.edoVerified !== true) {
          nextErrors.edo = "Подключите ЭДО или пропустите шаг";
        }
        break;
      case 3: {
        const nameError = validateRequired(form.contactName ?? "", "ФИО");
        if (nameError) nextErrors.contactName = nameError;
        const positionError = validateRequired(form.position ?? "", "Должность");
        if (positionError) nextErrors.position = positionError;
        const phoneError = validatePhone(form.phone ?? "");
        if (phoneError) nextErrors.phone = phoneError;
        const emailError = validateEmail(form.email ?? "");
        if (emailError) nextErrors.email = emailError;
        const passwordError = validateRequired(form.password ?? "", "Пароль");
        if (passwordError) nextErrors.password = passwordError;
        const matchError = validatePasswordMatch(form.password ?? "", form.confirmPassword ?? "");
        if (matchError) nextErrors.confirmPassword = matchError;
        break;
      }
      case 4:
        if (form.role === "contractor" && !(form.categories?.length ?? 0)) {
          nextErrors.categories = "Выберите хотя бы одну категорию";
        }
        if (form.role === "venue" && !form.venueName?.trim()) {
          nextErrors.venueName = "Укажите название площадки";
        }
        if (form.role === "organizer" && !(form.industries?.length ?? 0)) {
          nextErrors.industries = "Выберите отрасль";
        }
        if (!(form.cities?.length ?? 0)) {
          nextErrors.cities = "Выберите хотя бы один город";
        }
        break;
      case 5:
        if (!form.termsAccepted) nextErrors.terms = "Примите условия использования";
        if (!form.privacyAccepted) nextErrors.privacy = "Примите политику конфиденциальности";
        break;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    const next = step + 1;
    if (next === 6) {
      setTimer(RESEND_SECONDS);
      setCanResend(false);
    }
    saveDraft(form, next);
  };

  const goBack = () => {
    const prev = Math.max(0, step - 1);
    saveDraft(form, prev);
  };

  const handleCodeSubmit = () => {
    if (code !== TEST_CODE) {
      setCodeError("Неверный код. Для демо используйте 123456");
      showToast("Неверный код подтверждения", "error");
      return;
    }
    setCodeError("");
    showToast("Email подтверждён");
    saveDraft(form, 7);
  };

  const handleResend = () => {
    setTimer(RESEND_SECONDS);
    setCanResend(false);
    setCodeError("");
    showToast("Код отправлен повторно");
  };

  const handleComplete = () => {
    saveDraft({ ...form, step: 7 }, 7);
    router.push("/moderation");
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1 mx-auto max-w-2xl w-full px-4 py-8">
        <h1 className="text-2xl font-bold mb-2">Регистрация</h1>
        <p className="text-sm text-gray-600 mb-6">
          Создайте аккаунт компании на маркетплейсе
        </p>

        <div className="mb-8">
          <StepIndicator steps={REGISTRATION_STEPS} currentStep={step} />
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-700">Выберите роль на платформе</p>
            {errors.role && <p className="text-xs text-gray-700">{errors.role}</p>}
            <div className="grid sm:grid-cols-2 gap-3">
              {ROLES.map((role) => (
                <Card
                  key={role.id}
                  onClick={() => updateField("role", role.id)}
                  className={form.role === role.id ? "border-gray-900 ring-1 ring-gray-900" : ""}
                >
                  <CardTitle>{role.title}</CardTitle>
                  <CardDescription>{role.description}</CardDescription>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                label="ИНН компании"
                value={form.inn}
                onChange={(e) => updateField("inn", e.target.value.replace(/\D/g, "").slice(0, 10))}
                error={errors.inn}
                placeholder="10 цифр"
                className="flex-1"
              />
              <div className="flex items-end">
                <Button type="button" onClick={handleFindCompany}>
                  Найти компанию
                </Button>
              </div>
            </div>
            {form.companyName && (
              <div className="border border-gray-300 p-4 space-y-2 text-sm">
                <p><span className="text-gray-500">Название:</span> {form.companyName}</p>
                <p><span className="text-gray-500">ОГРН:</span> {form.ogrn}</p>
                <p><span className="text-gray-500">Адрес:</span> {form.address}</p>
                <p><span className="text-gray-500">Руководитель:</span> {form.director}</p>
                <p><span className="text-gray-500">ОКВЭД:</span> {form.mainOkved}</p>
                {form.additionalOkved?.map((okved) => (
                  <p key={okved} className="text-gray-600 pl-4">· {okved}</p>
                ))}
              </div>
            )}
            {errors.companyName && <p className="text-xs text-gray-700">{errors.companyName}</p>}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Подключите электронный документооборот для подписания договоров
            </p>
            <Select
              label="Оператор ЭДО"
              options={EDO_OPERATORS}
              value={form.edoOperator}
              onChange={(e) => {
                updateField("edoOperator", e.target.value);
                updateField("edoVerified", null);
              }}
              error={errors.edoOperator}
            />
            <Input
              label="ID в системе ЭДО"
              value={form.edoId}
              onChange={(e) => {
                updateField("edoId", e.target.value);
                updateField("edoVerified", null);
              }}
              error={errors.edoId}
              placeholder="Для успеха заканчивается на 1"
            />
            {form.edoVerified === true && (
              <Badge variant="solid">ЭДО подключено</Badge>
            )}
            {form.edoVerified === false && (
              <Badge variant="dashed">Ошибка проверки</Badge>
            )}
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={handleVerifyEdo}>
                Проверить
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  updateField("edoSkipped", true);
                  updateField("edoVerified", true);
                  showToast("ЭДО пропущено — можно подключить позже", "info");
                }}
              >
                Пропустить
              </Button>
            </div>
            {errors.edo && <p className="text-xs text-gray-700">{errors.edo}</p>}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <Input
              label="ФИО контактного лица"
              value={form.contactName}
              onChange={(e) => updateField("contactName", e.target.value)}
              error={errors.contactName}
            />
            <Input
              label="Должность"
              value={form.position}
              onChange={(e) => updateField("position", e.target.value)}
              error={errors.position}
            />
            <Input
              label="Телефон"
              type="tel"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              error={errors.phone}
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              error={errors.email}
            />
            <Input
              label="Пароль"
              type="password"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              error={errors.password}
              autoComplete="new-password"
            />
            <Input
              label="Подтверждение пароля"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => updateField("confirmPassword", e.target.value)}
              error={errors.confirmPassword}
              autoComplete="new-password"
            />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Дополнительные данные для роли:{" "}
              <strong>{form.role ? ROLE_LABELS[form.role as keyof typeof ROLE_LABELS] : ""}</strong>
            </p>

            <div>
              <p className="text-sm font-medium mb-2">Города работы</p>
              {errors.cities && <p className="text-xs text-gray-700 mb-1">{errors.cities}</p>}
              <div className="flex flex-wrap gap-2">
                {CITIES.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => toggleArrayItem("cities", city)}
                    className={`text-xs border px-2 py-1 ${
                      form.cities?.includes(city)
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-300 hover:border-gray-900"
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            {form.role === "customer" && (
              <div>
                <p className="text-sm font-medium mb-2">Интересующие отрасли</p>
                <div className="flex flex-wrap gap-2">
                  {EVENT_INDUSTRIES.map((ind) => (
                    <button
                      key={ind}
                      type="button"
                      onClick={() => toggleArrayItem("industries", ind)}
                      className={`text-xs border px-2 py-1 ${
                        form.industries?.includes(ind)
                          ? "border-gray-900 bg-gray-900 text-white"
                          : "border-gray-300 hover:border-gray-900"
                      }`}
                    >
                      {ind}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {form.role === "contractor" && (
              <>
                <div>
                  <p className="text-sm font-medium mb-2">Категории услуг</p>
                  {errors.categories && <p className="text-xs text-gray-700 mb-1">{errors.categories}</p>}
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                    {SERVICE_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleArrayItem("categories", cat)}
                        className={`text-xs border px-2 py-1 ${
                          form.categories?.includes(cat)
                            ? "border-gray-900 bg-gray-900 text-white"
                            : "border-gray-300 hover:border-gray-900"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.hasProduction}
                    onChange={(e) => updateField("hasProduction", e.target.checked)}
                  />
                  Есть собственное производство
                </label>
                <Textarea
                  label="Описание компании"
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                />
              </>
            )}

            {form.role === "venue" && (
              <>
                <Input
                  label="Название площадки"
                  value={form.venueName}
                  onChange={(e) => updateField("venueName", e.target.value)}
                  error={errors.venueName}
                />
                <Input
                  label="Вместимость залов (чел.)"
                  type="number"
                  value={form.hallCapacity}
                  onChange={(e) => updateField("hallCapacity", e.target.value)}
                />
                <Textarea
                  label="Описание площадки"
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                />
              </>
            )}

            {form.role === "organizer" && (
              <>
                <div>
                  <p className="text-sm font-medium mb-2">Отрасли мероприятий</p>
                  {errors.industries && <p className="text-xs text-gray-700 mb-1">{errors.industries}</p>}
                  <div className="flex flex-wrap gap-2">
                    {EVENT_INDUSTRIES.map((ind) => (
                      <button
                        key={ind}
                        type="button"
                        onClick={() => toggleArrayItem("industries", ind)}
                        className={`text-xs border px-2 py-1 ${
                          form.industries?.includes(ind)
                            ? "border-gray-900 bg-gray-900 text-white"
                            : "border-gray-300 hover:border-gray-900"
                        }`}
                      >
                        {ind}
                      </button>
                    ))}
                  </div>
                </div>
                <Textarea
                  label="Описание организатора"
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                />
              </>
            )}
          </div>
        )}

        {step === 5 && (
          <div className="space-y-4">
            <label className="flex items-start gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.termsAccepted}
                onChange={(e) => updateField("termsAccepted", e.target.checked)}
                className="mt-1"
              />
              <span>
                Я принимаю{" "}
                <Link href="/how-it-works" className="underline">
                  условия использования
                </Link>{" "}
                сервиса
              </span>
            </label>
            {errors.terms && <p className="text-xs text-gray-700">{errors.terms}</p>}

            <label className="flex items-start gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.privacyAccepted}
                onChange={(e) => updateField("privacyAccepted", e.target.checked)}
                className="mt-1"
              />
              <span>
                Я принимаю{" "}
                <Link href="/how-it-works" className="underline">
                  политику конфиденциальности
                </Link>
              </span>
            </label>
            {errors.privacy && <p className="text-xs text-gray-700">{errors.privacy}</p>}

            <label className="flex items-start gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.marketingAccepted}
                onChange={(e) => updateField("marketingAccepted", e.target.checked)}
                className="mt-1"
              />
              <span>Получать новости и предложения сервиса (необязательно)</span>
            </label>
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            <div className="border border-gray-300 bg-gray-50 p-4 text-sm">
              Код подтверждения отправлен на <strong>{form.email}</strong>
            </div>
            <Input
              label="Код из письма"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/\D/g, ""));
                setCodeError("");
              }}
              error={codeError}
              placeholder="6 цифр"
            />
            <p className="text-xs text-gray-500">Демо-код: 123456</p>
            <div className="flex items-center justify-between text-sm">
              {!canResend ? (
                <span className="flex items-center gap-1 text-gray-500">
                  <Clock className="h-4 w-4" />
                  Повторная отправка через {timer} сек.
                </span>
              ) : (
                <button
                  type="button"
                  className="flex items-center gap-1 underline"
                  onClick={handleResend}
                >
                  <RefreshCw className="h-4 w-4" />
                  Отправить код повторно
                </button>
              )}
            </div>
            <Button type="button" className="w-full" onClick={handleCodeSubmit}>
              Подтвердить email
            </Button>
          </div>
        )}

        {step === 7 && (
          <div className="flex flex-col items-center py-8 text-center border border-gray-300">
            <CheckCircle className="h-12 w-12 text-gray-900 mb-4" />
            <h2 className="text-lg font-semibold mb-2">Заявка отправлена на модерацию</h2>
            <p className="text-sm text-gray-600 mb-2 max-w-md">
              Мы проверим данные компании{" "}
              <strong>{form.companyName || "вашей организации"}</strong> и уведомим вас о результате.
            </p>
            <p className="text-xs text-gray-500 mb-6">
              Обычно модерация занимает 1–2 рабочих дня
            </p>
            <Button onClick={handleComplete}>Перейти к статусу модерации</Button>
          </div>
        )}

        {step < 7 && (
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              disabled={step === 0}
            >
              Назад
            </Button>
            {step < 6 && (
              <Button type="button" onClick={goNext}>
                {step === 5 ? "Отправить код" : "Далее"}
              </Button>
            )}
          </div>
        )}

        <p className="text-sm text-center mt-6 text-gray-600">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="underline font-medium text-gray-900">
            Войти
          </Link>
        </p>
      </main>
      <Footer />
    </div>
  );
}
