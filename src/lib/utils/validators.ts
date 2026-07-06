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

export function validatePasswordMatch(password: string, confirm: string): string | null {
  if (password !== confirm) return "Пароли не совпадают";
  if (password.length < 6) return "Пароль должен быть не менее 6 символов";
  return null;
}
