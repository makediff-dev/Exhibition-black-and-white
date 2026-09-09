export function pluralizeRu(count: number, forms: [string, string, string]): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) return `${count} ${forms[0]}`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${count} ${forms[1]}`;
  return `${count} ${forms[2]}`;
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatServicePrice(service: { price: number; priceFormat: string }): string {
  if (service.priceFormat === "фиксированная") {
    return formatPrice(service.price);
  }
  if (service.priceFormat === "от") {
    return `от ${formatPrice(service.price)}`;
  }
  if (service.priceFormat === "от за кв.м.") {
    return `от ${formatPrice(service.price)} за кв.м.`;
  }
  if (service.priceFormat.startsWith("от / ")) {
    return `от ${formatPrice(service.price)}${service.priceFormat.slice(2)}`;
  }
  return `${formatPrice(service.price)} / ${service.priceFormat}`;
}

function formatWithDate(date: string, options: Intl.DateTimeFormatOptions): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat("ru-RU", options).format(parsed);
}

export function formatDate(date: string): string {
  return formatWithDate(date, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatShortDate(date: string): string {
  return formatWithDate(date, {
    day: "numeric",
    month: "short",
  });
}

export function formatExecutionRange(start: string, end: string): string {
  if (!start && !end) return "";
  if (start && end) return `${formatShortDate(start)} — ${formatShortDate(end)}`;
  return formatShortDate(start || end);
}

export function formatDateTime(date: string): string {
  return formatWithDate(date, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRequestDeadline(deadline: string): string {
  if (deadline.includes("/")) {
    const [start, end] = deadline.split("/");
    return formatExecutionRange(start, end);
  }
  return formatDate(deadline);
}

export function formatRequestDeadlineShort(deadline: string): string {
  if (deadline.includes("/")) {
    const [start, end] = deadline.split("/");
    return formatExecutionRange(start, end);
  }
  return formatShortDate(deadline);
}
