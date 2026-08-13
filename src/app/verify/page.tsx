"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CheckCircle, Clock, Mail, Phone, RefreshCw } from "lucide-react";
import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast-provider";
import { usePrototypeStore } from "@/lib/store";
import { validateEmail, validatePhone } from "@/lib/utils/validators";

const TEST_CODE = "123456";
const RESEND_SECONDS = 60;

type VerifyState = "input" | "success" | "error";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showToast } = useToast();
  const registrationDraft = usePrototypeStore((s) => s.registrationDraft);
  const setRegistrationDraft = usePrototypeStore((s) => s.setRegistrationDraft);

  const initialType = searchParams.get("type") === "phone" ? "phone" : "email";
  const initialContact = searchParams.get("contact") ?? "";
  const fromRegister = searchParams.get("from") === "register";

  const [activeTab, setActiveTab] = useState(initialType);
  const [contact, setContact] = useState(initialContact);
  const [code, setCode] = useState("");
  const [state, setState] = useState<VerifyState>("input");
  const [contactError, setContactError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [timer, setTimer] = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (!codeSent || canResend) return;
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
  }, [codeSent, canResend]);

  const validateContact = () => {
    const error =
      activeTab === "email"
        ? validateEmail(contact)
        : validatePhone(contact);
    setContactError(error ?? "");
    return !error;
  };

  const handleSendCode = () => {
    if (!validateContact()) return;
    setCodeSent(true);
    setTimer(RESEND_SECONDS);
    setCanResend(false);
    setState("input");
    setCodeError("");
    showToast(
      activeTab === "email"
        ? "Код отправлен на email"
        : "Код отправлен по SMS"
    );
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codeSent && !validateContact()) return;

    if (!codeSent) {
      handleSendCode();
      return;
    }

    if (code !== TEST_CODE) {
      setState("error");
      setCodeError("Неверный код. Для демо используйте 123456");
      showToast("Неверный код подтверждения", "error");
      return;
    }

    if (fromRegister) {
      setRegistrationDraft({
        ...registrationDraft,
        individualEmailSent: true,
        individualEmailConfirmed: true,
        registrationPhase: "company",
        step: 0,
      });
      router.push("/register?confirmed=1");
      showToast("Email подтверждён");
      return;
    }

    setCodeError("");
    showToast("Контакт успешно подтверждён");
    setState("success");
  };

  const handleResend = () => {
    setTimer(RESEND_SECONDS);
    setCanResend(false);
    setCodeError("");
    setState("input");
    showToast("Код отправлен повторно");
  };

  const ContactIcon = activeTab === "email" ? Mail : Phone;

  return (
    <main className="flex-1 mx-auto max-w-site w-full px-4 py-8">
      <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-2">Подтверждение контакта</h1>
      <p className="text-sm text-gray-600 mb-6">
        Подтвердите email или телефон для продолжения работы
      </p>

      {state === "success" ? (
        <div className="flex flex-col items-center py-8 text-center border border-gray-900">
          <CheckCircle className="h-12 w-12 text-gray-900 mb-4" />
          <h2 className="text-lg font-semibold mb-2">Контакт подтверждён</h2>
          <p className="text-sm text-gray-600 mb-6">
            {activeTab === "email" ? "Email" : "Телефон"}{" "}
            <strong>{contact}</strong> успешно верифицирован
          </p>
          {fromRegister && (
            <p className="text-sm text-gray-600 mb-6 max-w-sm">
              Теперь вы можете войти в сервис и зарегистрировать компанию. Без регистрации
              юридического лица многие функции будут недоступны.
            </p>
          )}
          <Link href={fromRegister ? "/login?registered=1" : "/login"}>
            <Button>Перейти ко входу</Button>
          </Link>
        </div>
      ) : (
        <>
          <Tabs
            tabs={[
              { id: "email", label: "Email" },
              { id: "phone", label: "Телефон" },
            ]}
            activeTab={activeTab}
            onChange={(id) => {
              setActiveTab(id);
              setContact("");
              setContactError("");
              setCodeSent(false);
              setCode("");
              setCodeError("");
              setState("input");
            }}
            className="mb-6"
          />

          <form onSubmit={handleVerify} className="space-y-4">
            <Input
              label={activeTab === "email" ? "Email" : "Телефон"}
              type={activeTab === "email" ? "email" : "tel"}
              value={contact}
              onChange={(e) => {
                setContact(e.target.value);
                setContactError("");
              }}
              error={contactError}
              disabled={codeSent}
              placeholder={
                activeTab === "email"
                  ? "example@mail.ru"
                  : "+7 900 000-00-00"
              }
            />

            {codeSent && (
              <>
                <div className="border border-gray-300 bg-gray-50 p-4 text-sm flex gap-3">
                  <ContactIcon className="h-5 w-5 shrink-0 text-gray-500" />
                  <p>
                    Код отправлен на <strong>{contact}</strong>
                  </p>
                </div>
                <Input
                  label="Код подтверждения"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, ""));
                    setCodeError("");
                    setState("input");
                  }}
                  error={codeError}
                  placeholder="6 цифр"
                />
                <p className="text-xs text-gray-500">Демо-код: 123456</p>

                {state === "error" && (
                  <p className="text-sm text-gray-700 border border-gray-900 px-3 py-2">
                    Код неверен. Проверьте ввод или запросите новый код.
                  </p>
                )}

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
              </>
            )}

            <Button type="submit" className="w-full">
              {codeSent ? "Подтвердить" : "Отправить код"}
            </Button>

            {codeSent && (
              <button
                type="button"
                className="w-full text-sm underline text-gray-600"
                onClick={() => {
                  setCodeSent(false);
                  setCode("");
                  setCodeError("");
                  setState("input");
                }}
              >
                Изменить {activeTab === "email" ? "email" : "телефон"}
              </button>
            )}
          </form>
        </>
      )}
      </div>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <Suspense fallback={<div className="flex-1 py-8 text-center text-sm text-gray-600">Загрузка...</div>}>
        <VerifyContent />
      </Suspense>
      <Footer />
    </div>
  );
}
