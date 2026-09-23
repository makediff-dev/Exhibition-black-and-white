"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle, Clock, RefreshCw } from "lucide-react";
import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StepIndicator, FileUpload } from "@/components/ui/file-upload";
import { usePrototypeStore, useAuthStore } from "@/lib/store";
import { useToast } from "@/components/ui/toast-provider";
import {
  validateEmail,
  validatePasswordMatch,
  validatePasswordStrength,
  validatePhone,
  validateRequired,
  validateWebsite,
} from "@/lib/utils/validators";
import {
  CITIES,
  EVENT_INDUSTRIES,
  FEDERAL_DISTRICT_OPTIONS,
  TEST_COMPANY_DATA,
  TEST_INN,
  getCitiesByDistrict,
} from "@/constants/categories";
import { ROLE_LABELS } from "@/constants/statuses";
import { parseRegisterRole } from "@/lib/auth/session";
import { CONTRACTOR_REGISTRATION_INTENT_KEY } from "@/constants/home-orders";
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

const ROLES: { id: UserRole; title: string; description: string; extraNote?: string }[] = [
  {
    id: "customer",
    title: "Заказчик",
    description: "Размещайте заявки, находите исполнителей и управляйте сделками",
  },
  {
    id: "contractor",
    title: "Исполнитель",
    description: "Предлагайте услуги, откликайтесь на заявки и получайте заказы",
    extraNote:
      "Вы также сможете искать и привлекать соисполнителей в рамках реализации комплексной услуги через личный кабинет",
  },
  {
    id: "venue",
    title: "Площадка",
    description: "Управляйте залами, бронированием и участниками мероприятий",
    extraNote:
      "Привлекайте организаторов, оказывайте услуги экспонентам, застройщикам и другим участникам процесса из своего личного кабинета",
  },
  {
    id: "organizer",
    title: "Организатор",
    description: "Создавайте выставки, форумы и конференции на платформе",
    extraNote:
      "Осуществляйте распределение площадей для аренды, оказывайте услуги экспонентам, застройщикам и другим участникам процесса из своего кабинета",
  },
];

const EDO_OPERATORS = [
  { value: "", label: "Выберите оператора" },
  { value: "diadoc", label: "Диадок" },
  { value: "sbis", label: "СБИС" },
  { value: "kontur", label: "Контур" },
  { value: "other", label: "Другой оператор" },
];

const TEST_CODE = "123456";
const RESEND_SECONDS = 60;

interface RegistrationDraft {
  step?: number;
  registrationPhase?: "individual" | "individual-sent" | "company";
  individualEmailSent?: boolean;
  individualEmailConfirmed?: boolean;
  role?: UserRole;
  inn?: string;
  companyName?: string;
  ogrn?: string;
  address?: string;
  actualAddress?: string;
  website?: string;
  companyPhone?: string;
  director?: string;
  mainOkved?: string;
  additionalOkved?: string[];
  edoOperator?: string;
  edoId?: string;
  edoVerified?: boolean | null;
  edoSkipped?: boolean;
  edoRequestStatus?: "idle" | "pending" | "confirmed" | "rejected";
  edoAuthorityScan?: string;
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
  experienceYears?: string;
  completedProjects?: string;
  productionAddress?: string;
  permanentStaff?: string;
  temporaryStaff?: string;
  freightVehicles?: string;
  designerPartners?: string;
  productionPhotos?: string[];
  postPaymentAvailable?: boolean;
  trademark?: string;
  venueName?: string;
  hallCapacity?: string;
  industries?: string[];
  termsAccepted?: boolean;
  privacyAccepted?: boolean;
  serviceNotificationsAccepted?: boolean;
  marketingAccepted?: boolean;
  messengerNotificationsAccepted?: boolean;
}

function createEmptyRegistrationForm(): RegistrationDraft {
  return {
    role: undefined,
    inn: "",
    companyName: "",
    ogrn: "",
    address: "",
    actualAddress: "",
    website: "",
    companyPhone: "",
    director: "",
    mainOkved: "",
    additionalOkved: [],
    edoOperator: "",
    edoId: "",
    edoVerified: null,
    edoSkipped: false,
    edoRequestStatus: "idle",
    edoAuthorityScan: "",
    contactName: "",
    position: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    cities: [],
    categories: [],
    hasProduction: false,
    description: "",
    experienceYears: "",
    completedProjects: "",
    productionAddress: "",
    permanentStaff: "",
    temporaryStaff: "",
    freightVehicles: "",
    designerPartners: "",
    productionPhotos: [],
    postPaymentAvailable: false,
    trademark: "",
    venueName: "",
    hallCapacity: "",
    industries: [],
    termsAccepted: false,
    privacyAccepted: false,
    serviceNotificationsAccepted: false,
    marketingAccepted: false,
    messengerNotificationsAccepted: false,
  };
}

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isRegistrationContinuation = searchParams.get("confirmed") === "1";
  const { showToast } = useToast();
  const storeDraft = usePrototypeStore((s) => s.registrationDraft) as RegistrationDraft;
  const setRegistrationDraft = usePrototypeStore((s) => s.setRegistrationDraft);
  const setShowCompanyRegistrationPrompt = useAuthStore((s) => s.setShowCompanyRegistrationPrompt);

  const draft = isRegistrationContinuation ? storeDraft : ({} as RegistrationDraft);
  const individualEmailConfirmed = draft.individualEmailConfirmed ?? false;
  const individualEmailSent = draft.individualEmailSent ?? false;
  const showCompanyFlow = individualEmailConfirmed;
  const awaitingEmailConfirmation = individualEmailSent && !individualEmailConfirmed;
  const [step, setStep] = useState(showCompanyFlow ? (draft.step ?? 0) : 0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [timer, setTimer] = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [citySearch, setCitySearch] = useState("");
  const [cityDistrict, setCityDistrict] = useState("");

  const [form, setForm] = useState<RegistrationDraft>(() => {
    const base = isRegistrationContinuation
      ? { ...createEmptyRegistrationForm(), ...storeDraft }
      : createEmptyRegistrationForm();

    if (
      typeof window !== "undefined" &&
      isRegistrationContinuation &&
      window.sessionStorage.getItem(CONTRACTOR_REGISTRATION_INTENT_KEY) === "1"
    ) {
      window.sessionStorage.removeItem(CONTRACTOR_REGISTRATION_INTENT_KEY);
      return { ...base, role: "contractor" };
    }

    const roleParam = parseRegisterRole(searchParams.get("role"));
    if (!isRegistrationContinuation && roleParam) {
      return { ...base, role: roleParam };
    }

    return base;
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

  const filteredCities = useMemo(() => {
    let list = cityDistrict ? getCitiesByDistrict(cityDistrict) : CITIES;
    const query = citySearch.trim().toLowerCase();
    if (query) {
      list = list.filter((city) => city.toLowerCase().includes(query));
    }
    return list;
  }, [citySearch, cityDistrict]);

  const allFilteredCitiesSelected =
    filteredCities.length > 0 &&
    filteredCities.every((city) => form.cities?.includes(city));

  const toggleAllCities = () => {
    setForm((prev) => {
      const current = prev.cities ?? [];
      if (allFilteredCitiesSelected) {
        return {
          ...prev,
          cities: current.filter((city) => !filteredCities.includes(city)),
        };
      }
      return { ...prev, cities: [...new Set([...current, ...filteredCities])] };
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

  const handleSendEdoRequest = () => {
    if (!form.edoOperator || !form.edoId?.trim()) {
      setErrors({
        edoOperator: !form.edoOperator ? "Выберите оператора" : undefined,
        edoId: !form.edoId?.trim() ? "Укажите ID в системе ЭДО" : undefined,
      } as Record<string, string>);
      return;
    }

    setErrors({});
    setForm((prev) => ({
      ...prev,
      edoSkipped: false,
      edoVerified: null,
      edoRequestStatus: "pending",
      edoAuthorityScan: "",
    }));
    showToast("Запрос отправлен в кабинет ЭДО компании");
  };

  const handleCheckEdoConfirmation = () => {
    if (form.edoRequestStatus !== "pending") return;

    const confirmed = form.edoId?.trim().endsWith("1");
    setForm((prev) => ({
      ...prev,
      edoRequestStatus: confirmed ? "confirmed" : "pending",
      edoVerified: confirmed ? true : null,
    }));

    showToast(
      confirmed
        ? "Полномочия подтверждены уполномоченным лицом в ЭДО"
        : "Подтверждение ещё не получено. Попросите подписанта принять запрос в кабинете оператора",
      confirmed ? "success" : "info",
    );
  };

  const handleEdoScanUpload = (fileName: string) => {
    setForm((prev) => ({
      ...prev,
      edoAuthorityScan: fileName,
      edoVerified: true,
      edoSkipped: false,
    }));
    showToast("Скан документа о полномочиях приложен");
  };

  const resetEdoVerification = () => {
    setForm((prev) => ({
      ...prev,
      edoVerified: null,
      edoRequestStatus: "idle",
      edoAuthorityScan: "",
      edoSkipped: false,
    }));
  };

  const isEdoStepComplete = () =>
    Boolean(form.edoSkipped) ||
    form.edoRequestStatus === "confirmed" ||
    Boolean(form.edoAuthorityScan?.trim());

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
        const actualAddressError = validateRequired(form.actualAddress ?? "", "Фактический адрес");
        if (actualAddressError) nextErrors.actualAddress = actualAddressError;
        const websiteError = validateWebsite(form.website ?? "");
        if (websiteError) nextErrors.website = websiteError;
        const companyPhoneError = validatePhone(form.companyPhone ?? "");
        if (companyPhoneError) nextErrors.companyPhone = companyPhoneError;
        break;
      }
      case 2:
        if (!isEdoStepComplete()) {
          nextErrors.edo =
            form.edoRequestStatus === "pending"
              ? "Дождитесь подтверждения запроса уполномоченным лицом в ЭДО"
              : "Подтвердите полномочия через ЭДО, приложите скан или пропустите шаг";
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
        const passwordError = validatePasswordStrength(form.password ?? "");
        if (passwordError) nextErrors.password = passwordError;
        const matchError = validatePasswordMatch(form.password ?? "", form.confirmPassword ?? "");
        if (matchError) nextErrors.confirmPassword = matchError;
        break;
      }
      case 4:
        if (form.role === "venue" && !form.venueName?.trim()) {
          nextErrors.venueName = "Укажите название площадки";
        }
        if (form.role === "organizer" && !(form.industries?.length ?? 0)) {
          nextErrors.industries = "Выберите отрасль";
        }
        if (!(form.cities?.length ?? 0)) {
          nextErrors.cities = "Выберите хотя бы один город";
        }
        if (form.role === "contractor") {
          if (!form.experienceYears?.trim()) {
            nextErrors.experienceYears = "Укажите опыт работы";
          }
          if (!form.completedProjects?.trim()) {
            nextErrors.completedProjects = "Укажите количество проектов";
          }
          if (!form.productionAddress?.trim()) {
            nextErrors.productionAddress = "Укажите адрес производства";
          }
          if (!form.permanentStaff?.trim()) {
            nextErrors.permanentStaff = "Укажите штат сотрудников";
          }
          if (!form.temporaryStaff?.trim()) {
            nextErrors.temporaryStaff = "Укажите временный персонал";
          }
          if (!form.freightVehicles?.trim()) {
            nextErrors.freightVehicles = "Укажите количество автотранспорта";
          }
          if (!form.designerPartners?.trim()) {
            nextErrors.designerPartners = "Укажите количество дизайнеров";
          }
        }
        break;
      case 5:
        if (!form.termsAccepted) nextErrors.terms = "Примите условия использования";
        if (!form.privacyAccepted) nextErrors.privacy = "Примите политику конфиденциальности";
        if (!form.serviceNotificationsAccepted) {
          nextErrors.serviceNotifications = "Подключите важные уведомления";
        }
        if (!form.messengerNotificationsAccepted) {
          nextErrors.messengerNotifications = "Подключите дублирование в мессенджер";
        }
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
    setShowCompanyRegistrationPrompt(false);
    router.push("/moderation");
  };

  const handleIndividualSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    const nameError = validateRequired(form.contactName ?? "", "ФИО");
    if (nameError) nextErrors.contactName = nameError;
    const emailError = validateEmail(form.email ?? "");
    if (emailError) nextErrors.email = emailError;
    const phoneError = validatePhone(form.phone ?? "");
    if (phoneError) nextErrors.phone = phoneError;
    if (!form.privacyAccepted) {
      nextErrors.privacy = "Необходимо согласие на обработку персональных данных";
    }
    if (!form.serviceNotificationsAccepted) {
      nextErrors.serviceNotifications = "Необходимо согласие на получение уведомлений";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const merged = {
      ...form,
      individualEmailSent: true,
      registrationPhase: "individual-sent" as const,
    };
    setForm(merged);
    setRegistrationDraft(merged as Record<string, unknown>);
    showToast("Письмо для завершения регистрации отправлено");
    router.push(
      `/verify?from=register&type=email&contact=${encodeURIComponent(form.email ?? "")}`,
    );
  };

  return (
    <div className="register-accent flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1 mx-auto max-w-site w-full px-4 py-8">
        <div className="mx-auto mb-8 w-full max-w-3xl text-center">
          <h1 className="text-2xl font-bold mb-2">Регистрация</h1>
          <p className="text-sm text-gray-600">
            {showCompanyFlow
              ? "Создайте аккаунт компании на маркетплейсе"
              : "Сначала создайте личный аккаунт физического лица"}
          </p>
          {form.role && (
            <p className="mt-3 rounded-button border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-800">
              Вы регистрируетесь как{" "}
              <strong>{ROLE_LABELS[form.role as keyof typeof ROLE_LABELS]}</strong>.
              Роль сохранится после подтверждения email. Её можно изменить до создания компании.
            </p>
          )}
          {!form.role && !showCompanyFlow && (
            <p className="mt-3 text-sm text-gray-600">
              Роль на платформе выбирается после подтверждения email, перед созданием компании.
            </p>
          )}
        </div>

        {showCompanyFlow && (
          <div className="mb-8 w-full">
            <StepIndicator steps={REGISTRATION_STEPS} currentStep={step} centered wide />
          </div>
        )}

        <div className="register-accent mx-auto w-full max-w-3xl">

        {!showCompanyFlow && !individualEmailSent && !awaitingEmailConfirmation && (
          <div className="mx-auto max-w-lg space-y-4 text-left">
            <div className="rounded-button border border-gray-300 bg-gray-50 p-4 text-sm text-gray-700">
              Регистрацию компании и выбор роли на платформе можно пройти только после
              подтверждения email личного аккаунта.
            </div>

            <form onSubmit={handleIndividualSubmit} className="space-y-4" noValidate>
              <Input
                label="ФИО"
                value={form.contactName}
                onChange={(e) => updateField("contactName", e.target.value)}
                error={errors.contactName}
                autoComplete="name"
                required
              />
              <Input
                label="Почта"
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                error={errors.email}
                autoComplete="email"
                required
              />
              <Input
                label="Мобильный"
                type="tel"
                value={form.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                error={errors.phone}
                autoComplete="tel"
                required
              />

              <label className="flex items-start gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.privacyAccepted}
                  onChange={(e) => updateField("privacyAccepted", e.target.checked)}
                  className="mt-1"
                />
                <span>Согласие на обработку персональных данных</span>
              </label>
              {errors.privacy && <p className="text-xs text-gray-700">{errors.privacy}</p>}

              <label className="flex items-start gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.serviceNotificationsAccepted}
                  onChange={(e) => updateField("serviceNotificationsAccepted", e.target.checked)}
                  className="mt-1"
                />
                <span>Согласие на получение уведомлений от сервиса</span>
              </label>
              {errors.serviceNotifications && (
                <p className="text-xs text-gray-700">{errors.serviceNotifications}</p>
              )}

              <Button type="submit" variant="teal" className="w-full">
                Отправить
              </Button>
            </form>
          </div>
        )}

        {awaitingEmailConfirmation && (
          <div className="mx-auto max-w-lg rounded-button border border-gray-300 bg-gray-50 p-6 text-sm text-center">
            <h2 className="text-lg font-semibold mb-2">Подтвердите email</h2>
            <p className="text-gray-700 mb-6">
              Мы отправили письмо на <strong>{form.email}</strong>. Подтвердите адрес, чтобы
              продолжить регистрацию. Если письма нет — проверьте папку «Спам».
            </p>
            <div className="flex justify-center">
              <Link
                href={`/verify?from=register&type=email&contact=${encodeURIComponent(form.email ?? "")}`}
              >
                <Button variant="teal">Подтвердить email</Button>
              </Link>
            </div>
          </div>
        )}

        {showCompanyFlow && (
          <>
        {step === 0 && (
          <div className="space-y-4 text-left">
            <p className="text-sm text-gray-700 text-center">Выберите роль на платформе</p>
            {errors.role && <p className="text-xs text-gray-700">{errors.role}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ROLES.map((role) => (
                <Card
                  key={role.id}
                  onClick={() => updateField("role", role.id)}
                  className={`h-full cursor-pointer ${
                    form.role === role.id ? "border-gray-900 ring-1 ring-gray-900" : ""
                  }`}
                >
                  <CardTitle>{role.title}</CardTitle>
                  <CardDescription className="leading-relaxed">
                    {role.description}
                    {role.extraNote && ` ${role.extraNote}`}
                  </CardDescription>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="company-inn" className="text-sm font-medium text-gray-900">
                ИНН компании
              </label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="min-w-0 flex-1">
                  <Input
                    id="company-inn"
                    value={form.inn}
                    onChange={(e) => updateField("inn", e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="10 цифр"
                  />
                </div>
                <Button
                  type="button"
                  variant="teal"
                  onClick={handleFindCompany}
                  className="shrink-0"
                >
                  Найти компанию
                </Button>
              </div>
              {errors.inn && <span className="text-xs text-gray-700">{errors.inn}</span>}
            </div>
            {form.companyName && (
              <div className="rounded-button border border-gray-300 p-4 space-y-2 text-sm">
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
            {form.companyName && (
              <div className="space-y-4 rounded-button border border-gray-300 p-4">
                <div>
                  <p className="text-sm font-medium">Данные для верификации компании</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Обязательные поля для проверки компании модерацией
                  </p>
                </div>
                <Input
                  label="Фактический адрес"
                  value={form.actualAddress ?? ""}
                  onChange={(e) => updateField("actualAddress", e.target.value)}
                  error={errors.actualAddress}
                  placeholder="г. Москва, ул. Производственная, д. 12"
                />
                <Input
                  label="Сайт"
                  value={form.website ?? ""}
                  onChange={(e) => updateField("website", e.target.value)}
                  error={errors.website}
                  placeholder="https://company.ru"
                />
                <Input
                  label="Телефон компании"
                  type="tel"
                  value={form.companyPhone ?? ""}
                  onChange={(e) => updateField("companyPhone", e.target.value)}
                  error={errors.companyPhone}
                  placeholder="+7 900 000-00-00"
                />
              </div>
            )}
            {errors.companyName && <p className="text-xs text-gray-700">{errors.companyName}</p>}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 text-left">
            <p className="text-sm text-gray-600 text-center">
              Подключите электронный документооборот для подписания договоров
            </p>

            <div className="rounded-button border border-gray-300 bg-gray-50 p-4 text-sm text-gray-700">
              ID в ЭДО можно узнать у любой компании, поэтому одного номера недостаточно.
              После отправки запроса уполномоченное лицо должно подтвердить его в кабинете
              оператора ЭДО — так мы проверяем, что регистрируется представитель компании.
            </div>

            <Select
              label="Оператор ЭДО"
              options={EDO_OPERATORS}
              value={form.edoOperator}
              onChange={(e) => {
                updateField("edoOperator", e.target.value);
                resetEdoVerification();
              }}
              error={errors.edoOperator}
            />
            <Input
              label="ID в системе ЭДО"
              value={form.edoId}
              onChange={(e) => {
                updateField("edoId", e.target.value);
                resetEdoVerification();
              }}
              error={errors.edoId}
              placeholder="Идентификатор организации у оператора"
            />

            {form.edoRequestStatus === "pending" && (
              <div className="rounded-button border border-gray-900 bg-white p-4 text-sm space-y-2">
                <p className="font-medium">Запрос отправлен в ЭДО компании</p>
                <p className="text-gray-600">
                  Подписант с правом подписи должен принять приглашение в кабинете{" "}
                  {EDO_OPERATORS.find((item) => item.value === form.edoOperator)?.label ?? "оператора"}.
                  Это подтверждает согласие на регистрацию и работу через сервис.
                </p>
                <p className="text-xs text-gray-500">
                  Демо: подтверждение считается полученным, если ID заканчивается на «1».
                </p>
              </div>
            )}

            {form.edoRequestStatus === "confirmed" && (
              <Badge variant="solid">Полномочия подтверждены в ЭДО</Badge>
            )}
            {form.edoAuthorityScan && (
              <Badge variant="outline">Скан документа о полномочиях приложён</Badge>
            )}

            <div className="flex flex-wrap gap-2">
              {form.edoRequestStatus !== "confirmed" && !form.edoAuthorityScan && (
                <Button
                  type="button"
                  variant="teal"
                  onClick={
                    form.edoRequestStatus === "pending"
                      ? handleCheckEdoConfirmation
                      : handleSendEdoRequest
                  }
                >
                  {form.edoRequestStatus === "pending"
                    ? "Проверить подтверждение"
                    : "Отправить запрос в ЭДО"}
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setForm((prev) => ({
                    ...prev,
                    edoSkipped: true,
                    edoVerified: true,
                    edoRequestStatus: "idle",
                    edoAuthorityScan: "",
                  }));
                  showToast("ЭДО пропущено — можно подключить позже", "info");
                }}
              >
                Пропустить
              </Button>
            </div>

            {!form.edoSkipped && form.edoRequestStatus !== "confirmed" && (
              <div className="border-t border-gray-200 pt-4 space-y-3">
                <p className="text-sm text-gray-700">
                  Если подтверждение в ЭДО сейчас недоступно, приложите скан доверенности
                  или приказа о полномочиях представителя.
                </p>
                <FileUpload
                  label="Прикрепить скан документа"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onUpload={handleEdoScanUpload}
                />
              </div>
            )}

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
            <PasswordInput
              label="Пароль"
              value={form.password}
              onChange={(e) => updateField("password", e.target.value)}
              error={errors.password}
              hint="Латинские буквы, не менее 6 символов, специальный символ"
              autoComplete="new-password"
            />
            <PasswordInput
              label="Подтверждение пароля"
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
              <p className="text-sm font-medium mb-2">Города проведения</p>
              {errors.cities && <p className="text-xs text-gray-700 mb-1">{errors.cities}</p>}
              <Input
                value={citySearch}
                onChange={(e) => setCitySearch(e.target.value)}
                placeholder="Поиск города"
                className="mb-3"
              />
              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  type="button"
                  onClick={toggleAllCities}
                  className={`rounded-button text-xs border px-2 py-1 ${
                    allFilteredCitiesSelected
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-300 hover:border-gray-900"
                  }`}
                >
                  Все города
                </button>
                {filteredCities.map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => toggleArrayItem("cities", city)}
                    className={`rounded-button text-xs border px-2 py-1 ${
                      form.cities?.includes(city)
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-300 hover:border-gray-900"
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
              <Select
                label="Федеральный округ"
                value={cityDistrict}
                onChange={(e) => setCityDistrict(e.target.value)}
                options={[
                  { value: "", label: "Все федеральные округа" },
                  ...FEDERAL_DISTRICT_OPTIONS.map((district) => ({
                    value: district,
                    label: district,
                  })),
                ]}
              />
            </div>

            <div>
              <p className="text-sm font-medium mb-2">
                Интересующие отраслевые мероприятия по тематикам
              </p>
              {errors.industries && <p className="text-xs text-gray-700 mb-1">{errors.industries}</p>}
              <div className="flex flex-wrap gap-2">
                {EVENT_INDUSTRIES.map((ind) => (
                  <button
                    key={ind}
                    type="button"
                    onClick={() => toggleArrayItem("industries", ind)}
                    className={`rounded-button text-xs border px-2 py-1 ${
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

            {form.role === "contractor" && (
              <div className="space-y-4 rounded-button border border-gray-300 p-4">
                <p className="text-sm font-medium">Данные исполнителя</p>
                <Input
                  label="Укажите опыт работы в сфере, полных лет"
                  type="number"
                  min={0}
                  value={form.experienceYears}
                  onChange={(e) => updateField("experienceYears", e.target.value.replace(/\D/g, ""))}
                  error={errors.experienceYears}
                />
                <Input
                  label="Укажите количество реализованных проектов"
                  type="number"
                  min={0}
                  value={form.completedProjects}
                  onChange={(e) => updateField("completedProjects", e.target.value.replace(/\D/g, ""))}
                  error={errors.completedProjects}
                />
                <Input
                  label="Укажите фактический адрес производства"
                  value={form.productionAddress}
                  onChange={(e) => updateField("productionAddress", e.target.value)}
                  error={errors.productionAddress}
                />
                <Input
                  label="Укажите количество постоянного штата сотрудников"
                  type="number"
                  min={0}
                  value={form.permanentStaff}
                  onChange={(e) => updateField("permanentStaff", e.target.value.replace(/\D/g, ""))}
                  error={errors.permanentStaff}
                />
                <Input
                  label="Укажите количество возможных для привлечения временного персонала"
                  type="number"
                  min={0}
                  value={form.temporaryStaff}
                  onChange={(e) => updateField("temporaryStaff", e.target.value.replace(/\D/g, ""))}
                  error={errors.temporaryStaff}
                />
                <Input
                  label="Укажите наличие собственного грузового автотранспорта в единицах"
                  type="number"
                  min={0}
                  value={form.freightVehicles}
                  onChange={(e) => updateField("freightVehicles", e.target.value.replace(/\D/g, ""))}
                  error={errors.freightVehicles}
                />
                <Input
                  label="Количество дизайнеров, с которыми вы сотрудничаете"
                  type="number"
                  min={0}
                  value={form.designerPartners}
                  onChange={(e) => updateField("designerPartners", e.target.value.replace(/\D/g, ""))}
                  error={errors.designerPartners}
                />
                <Input
                  label="Укажите товарный знак, если он отличается от официального наименования"
                  value={form.trademark}
                  onChange={(e) => updateField("trademark", e.target.value)}
                />
                <div>
                  <FileUpload
                    label="Загрузите фотографии с производства"
                    accept="image/*"
                    onUpload={(name) =>
                      updateField("productionPhotos", [...(form.productionPhotos ?? []), name])
                    }
                  />
                  <p className="text-xs text-gray-600 mt-2">
                    Это повысит доверие заказчиков
                  </p>
                  {(form.productionPhotos?.length ?? 0) > 0 && (
                    <ul className="mt-2 space-y-1">
                      {form.productionPhotos?.map((file) => (
                        <li key={file} className="text-xs text-gray-600 flex items-center gap-1">
                          <span className="border border-gray-300 px-1">📷</span> {file}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.postPaymentAvailable}
                    onChange={(e) => updateField("postPaymentAvailable", e.target.checked)}
                  />
                  Возможна работа по постоплате.
                </label>
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
              </div>
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
              <Textarea
                label="Описание организатора"
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
              />
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
                checked={form.serviceNotificationsAccepted}
                onChange={(e) => updateField("serviceNotificationsAccepted", e.target.checked)}
                className="mt-1"
              />
              <span>
                Получать важные уведомления от организаторов, площадки проведения, исполнителей
                и сервиса
              </span>
            </label>
            {errors.serviceNotifications && (
              <p className="text-xs text-gray-700">{errors.serviceNotifications}</p>
            )}

            <label className="flex items-start gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.marketingAccepted}
                onChange={(e) => updateField("marketingAccepted", e.target.checked)}
                className="mt-1"
              />
              <span>Получать новости и предложения сервиса (необязательно)</span>
            </label>

            <label className="flex items-start gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.messengerNotificationsAccepted}
                onChange={(e) => updateField("messengerNotificationsAccepted", e.target.checked)}
                className="mt-1"
              />
              <span>Дублировать важные и срочные уведомления в мессенджер</span>
            </label>
            {errors.messengerNotifications && (
              <p className="text-xs text-gray-700">{errors.messengerNotifications}</p>
            )}
          </div>
        )}

        {step === 6 && (
          <div className="space-y-4">
            <div className="rounded-button border border-gray-300 bg-gray-50 p-4 text-sm">
              Код подтверждения отправлен на <strong>{form.email}</strong>. Можете ещё
              проверить папку «Спам».
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
            <Button type="button" variant="teal" className="w-full" onClick={handleCodeSubmit}>
              Подтвердить email
            </Button>
          </div>
        )}

        {step === 7 && (
          <div className="flex flex-col items-center rounded-button py-8 text-center border border-gray-300">
            <CheckCircle className="h-12 w-12 text-gray-900 mb-4" />
            <h2 className="text-lg font-semibold mb-2">Заявка отправлена на модерацию</h2>
            <p className="text-sm text-gray-600 mb-2 max-w-md">
              Мы проверим данные компании{" "}
              <strong>{form.companyName || "вашей организации"}</strong> и уведомим вас о результате.
            </p>
            <p className="text-xs text-gray-500 mb-6">
              Обычно модерация занимает до 24 часов. Вы получите уведомление на e-mail,
              указанный при регистрации.
            </p>
            <Button variant="teal" onClick={handleComplete}>Перейти к статусу модерации</Button>
          </div>
        )}

        {showCompanyFlow && step < 7 && (
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="soft-outline"
              onClick={goBack}
              disabled={step === 0}
            >
              Назад
            </Button>
            {step < 6 && (
              <Button type="button" variant="teal" onClick={goNext}>
                {step === 5 ? "Отправить код на почту" : "Далее"}
              </Button>
            )}
          </div>
        )}
          </>
        )}

        <p className="text-sm text-center mt-6 text-gray-600">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="underline font-medium text-gray-900">
            Войти
          </Link>
        </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterPageContent />
    </Suspense>
  );
}