"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export interface PhoneCountry {
  id: string;
  label: string;
  dial: string;
  nationalLength: number;
}

export const PHONE_COUNTRIES: PhoneCountry[] = [
  { id: "RU", label: "Россия +7", dial: "+7", nationalLength: 10 },
  { id: "BY", label: "Беларусь +375", dial: "+375", nationalLength: 9 },
  { id: "KZ", label: "Казахстан +7", dial: "+7", nationalLength: 10 },
];

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function formatNationalNumber(digits: string, country: PhoneCountry) {
  const trimmed = digits.slice(0, country.nationalLength);
  if (country.dial === "+375") {
    const a = trimmed.slice(0, 2);
    const b = trimmed.slice(2, 5);
    const c = trimmed.slice(5, 7);
    const d = trimmed.slice(7, 9);
    return [a, b, c, d].filter(Boolean).join(" ");
  }
  const a = trimmed.slice(0, 3);
  const b = trimmed.slice(3, 6);
  const c = trimmed.slice(6, 8);
  const d = trimmed.slice(8, 10);
  return [a, b, c, d].filter(Boolean).join(" ");
}

export function composePhoneValue(countryId: string, nationalDigits: string) {
  const country = PHONE_COUNTRIES.find((item) => item.id === countryId) ?? PHONE_COUNTRIES[0];
  const national = digitsOnly(nationalDigits).slice(0, country.nationalLength);
  if (!national) return "";
  return `${country.dial} ${formatNationalNumber(national, country)}`.trim();
}

export function parsePhoneValue(value: string): { countryId: string; national: string } {
  const digits = digitsOnly(value);
  if (digits.startsWith("375")) {
    return { countryId: "BY", national: digits.slice(3) };
  }
  if (digits.startsWith("7")) {
    return { countryId: "RU", national: digits.slice(1) };
  }
  return { countryId: "RU", national: digits };
}

interface PhoneFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  autoComplete?: string;
}

export function PhoneField({
  label = "Номер телефона",
  value,
  onChange,
  error,
  required,
  autoComplete = "tel",
}: PhoneFieldProps) {
  const parsed = parsePhoneValue(value);
  const country = PHONE_COUNTRIES.find((item) => item.id === parsed.countryId) ?? PHONE_COUNTRIES[0];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-[minmax(0,180px)_1fr]">
      <Select
        label="Страна"
        value={parsed.countryId}
        onChange={(event) => onChange(composePhoneValue(event.target.value, parsed.national))}
        options={PHONE_COUNTRIES.map((item) => ({ value: item.id, label: item.label }))}
        required={required}
      />
      <Input
        label={label}
        type="tel"
        inputMode="tel"
        autoComplete={autoComplete}
        value={formatNationalNumber(parsed.national, country)}
        onChange={(event) => onChange(composePhoneValue(parsed.countryId, event.target.value))}
        error={error}
        required={required}
        placeholder={country.dial === "+375" ? "29 123 45 67" : "900 000 00 00"}
      />
    </div>
  );
}
