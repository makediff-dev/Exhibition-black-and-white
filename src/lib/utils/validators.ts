export function validateEmail(email: string): string | null {
  if (!email) return "Email обязателен";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Некорректный формат email";
  return null;
}

export function validatePhone(phone: string): string | null {
  if (!phone) return "Телефон обязателен";
  if (!/^\+?[\d\s()-]{10,}$/.test(phone)) return "Некорректный формат телефона";
  return null;
}

export function validateRequired(value: string, label: string): string | null {
  if (!value?.trim()) return `${label} обязательно`;
  return null;
}

export function validatePasswordStrength(password: string): string | null {
  if (!password) return "Пароль обязателен";
  if (password.length < 6) return "Пароль должен быть не менее 6 символов";
  if (!/[a-zA-Z]/.test(password)) return "Пароль должен содержать латинские буквы";
  if (!/[^a-zA-Z0-9]/.test(password)) return "Пароль должен содержать специальный символ";
  return null;
}

export function validateWebsite(website: string): string | null {
  const trimmed = website.trim();
  if (!trimmed) return "Укажите сайт компании";
  const normalized = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(normalized);
    if (!url.hostname.includes(".")) return "Укажите корректный адрес сайта";
    return null;
  } catch {
    return "Укажите корректный адрес сайта";
  }
}

export function validatePasswordMatch(password: string, confirm: string): string | null {
  if (password !== confirm) return "Пароли не совпадают";
  return null;
}
