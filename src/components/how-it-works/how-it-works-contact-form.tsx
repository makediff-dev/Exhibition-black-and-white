"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { FormErrorSummary } from "@/components/ui/form-status";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast-provider";
import {
  HOW_IT_WORKS_CONTACT_ROLES,
  HOW_IT_WORKS_CONTACT_TOPICS,
} from "@/constants/how-it-works";
import { validateEmail, validateRequired } from "@/lib/utils/validators";
import styles from "./how-it-works.module.css";

interface FormState {
  name: string;
  email: string;
  phone: string;
  role: string;
  topic: string;
  message: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  role: "customer",
  topic: "question",
  message: "",
};

export function HowItWorksContactForm() {
  const { showToast } = useToast();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    const nameError = validateRequired(form.name, "Имя");
    if (nameError) nextErrors.name = nameError;
    const emailError = validateEmail(form.email.trim());
    if (emailError) nextErrors.email = emailError;
    const messageError = validateRequired(form.message, "Сообщение");
    if (messageError) nextErrors.message = messageError;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      requestAnimationFrame(() => {
        document.querySelector<HTMLElement>("#contact [aria-invalid='true']")?.focus();
      });
      return;
    }

    setForm(EMPTY_FORM);
    setErrors({});
    showToast("Запрос отправлен менеджеру. Ответим на указанный email.");
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <FormErrorSummary errors={Object.values(errors)} />
      <div className={styles.formRow}>
        <Input
          label="Имя"
          name="name"
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
          error={errors.name}
          required
        />
        <Input
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={(event) => updateField("email", event.target.value)}
          error={errors.email}
          required
        />
      </div>
      <div className={styles.formRow}>
        <Input
          label="Телефон"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={(event) => updateField("phone", event.target.value)}
          help="Необязательно"
        />
        <Select
          label="Кто вы"
          name="role"
          value={form.role}
          onChange={(event) => updateField("role", event.target.value)}
          options={HOW_IT_WORKS_CONTACT_ROLES.map((item) => ({
            value: item.value,
            label: item.label,
          }))}
        />
      </div>
      <Select
        label="Тема"
        name="topic"
        value={form.topic}
        onChange={(event) => updateField("topic", event.target.value)}
        options={HOW_IT_WORKS_CONTACT_TOPICS.map((item) => ({
          value: item.value,
          label: item.label,
        }))}
      />
      <div className={styles.textareaField}>
        <label className={styles.textareaLabel} htmlFor="how-it-works-message">
          Сообщение <span aria-hidden="true">*</span>
        </label>
        <textarea
          id="how-it-works-message"
          name="message"
          className={`${styles.textarea} ${errors.message ? styles.textareaError : ""}`}
          value={form.message}
          onChange={(event) => updateField("message", event.target.value)}
          aria-invalid={errors.message ? true : undefined}
          aria-required
          required
        />
        {errors.message ? <span className={styles.fieldError}>{errors.message}</span> : null}
      </div>
      <p className={styles.formHint}>
        Для спора по сделке укажите номер заказа или название компании. Менеджер подключается до выплаты.
      </p>
      <div>
        <Button type="submit" variant="green">
          Отправить менеджеру
        </Button>
      </div>
    </form>
  );
}
