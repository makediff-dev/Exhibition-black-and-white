export interface NavItem {
  href: string;
  label: string;
  slug: string;
}

export const CUSTOMER_NAV: NavItem[] = [
  { slug: "", href: "/account/customer", label: "Дашборд" },
      { slug: "profile", href: "/account/customer/profile", label: "Профиль компании" },
  { slug: "messages", href: "/messages", label: "Сообщения" },
  { slug: "edo", href: "/account/customer/edo", label: "ЭДО и документооборот" },
  { slug: "requests", href: "/requests", label: "Мои заявки" },
  { slug: "my-events", href: "/account/customer/my-events", label: "Мои мероприятия" },
  { slug: "favorites", href: "/account/customer/favorites", label: "Избранное" },
  { slug: "cart", href: "/account/customer/cart", label: "Корзина" },
  { slug: "responses", href: "/account/customer/responses", label: "Отклики и предложения" },
  { slug: "active-projects", href: "/account/customer/active-projects", label: "Проекты" },
  { slug: "checks", href: "/account/customer/checks", label: "Проверки исполнителей" },
  { slug: "payments", href: "/account/customer/payments", label: "Оплаты" },
  { slug: "settings", href: "/account/customer/settings", label: "Настройки" },
];

export const CONTRACTOR_NAV: NavItem[] = [
  { slug: "", href: "/account/contractor", label: "Дашборд" },
  { slug: "profile", href: "/account/contractor/profile", label: "Профиль компании" },
  { slug: "messages", href: "/messages", label: "Сообщения" },
  { slug: "services", href: "/account/contractor/services", label: "Услуги" },
  { slug: "available-requests", href: "/account/contractor/available-requests", label: "Доступные заявки" },
  { slug: "my-responses", href: "/account/contractor/my-responses", label: "Мои отклики" },
  { slug: "active-projects", href: "/account/contractor/active-projects", label: "Проекты" },
  { slug: "payouts", href: "/account/contractor/payouts", label: "Выплаты" },
  { slug: "documents", href: "/account/contractor/documents", label: "Документы" },
  { slug: "settings", href: "/account/contractor/settings", label: "Настройки" },
];

export const VENUE_NAV: NavItem[] = [
  { slug: "", href: "/account/venue", label: "Дашборд" },
  { slug: "profile", href: "/account/venue/profile", label: "Профиль площадки" },
  { slug: "messages", href: "/messages", label: "Сообщения" },
  { slug: "halls", href: "/account/venue/halls", label: "Залы и площади" },
  { slug: "events", href: "/account/venue/events", label: "Мероприятия" },
  { slug: "venue-services", href: "/account/venue/venue-services", label: "Услуги площадки" },
  { slug: "bookings", href: "/account/venue/bookings", label: "Бронирования" },
  { slug: "orders", href: "/account/venue/orders", label: "Заказы" },
  { slug: "payments", href: "/account/venue/payments", label: "Оплаты и начисления" },
  { slug: "documents", href: "/account/venue/documents", label: "Документы" },
  { slug: "settings", href: "/account/venue/settings", label: "Настройки" },
];

export const ORGANIZER_NAV: NavItem[] = [
  { slug: "", href: "/account/organizer", label: "Дашборд" },
  { slug: "profile", href: "/account/organizer/profile", label: "Профиль компании" },
  { slug: "messages", href: "/messages", label: "Сообщения" },
  { slug: "events", href: "/account/organizer/events", label: "Мероприятия" },
  { slug: "venues", href: "/account/organizer/venues", label: "Площадки проведения" },
  { slug: "orders", href: "/account/organizer/orders", label: "Заказы" },
  { slug: "payments", href: "/account/organizer/payments", label: "Оплаты" },
  { slug: "documents", href: "/account/organizer/documents", label: "Документы" },
  { slug: "settings", href: "/account/organizer/settings", label: "Настройки" },
];

export function getNavForRole(role: string): NavItem[] {
  switch (role) {
    case "customer":
      return CUSTOMER_NAV;
    case "contractor":
      return CONTRACTOR_NAV;
    case "venue":
      return VENUE_NAV;
    case "organizer":
      return ORGANIZER_NAV;
    default:
      return [];
  }
}

function normalizePathname(pathname: string): string {
  const path = pathname.split("#")[0].split("?")[0];
  if (path.length > 1 && path.endsWith("/")) {
    return path.slice(0, -1);
  }
  return path;
}

function matchAccountSlug(path: string, role: string): string | undefined {
  const prefix = `/account/${role}`;
  if (path === prefix) return "";
  if (!path.startsWith(`${prefix}/`)) return undefined;
  return path.slice(prefix.length + 1).split("/")[0];
}

function pickNavSlug(role: string, slug: string): string | undefined {
  const nav = getNavForRole(role);
  return nav.some((item) => item.slug === slug) ? slug : undefined;
}

/** Maps any cabinet route to exactly one sidebar slug for the user's role. */
export function resolveActiveNavSlug(pathname: string, role: string): string | undefined {
  const path = normalizePathname(pathname);
  const nav = getNavForRole(role);
  if (nav.length === 0) return undefined;

  if (path === "/messages" || path.startsWith("/messages/")) {
    return pickNavSlug(role, "messages");
  }

  if (path === "/documents" || path.startsWith("/documents/")) {
    return pickNavSlug(role, role === "customer" ? "edo" : "documents");
  }

  switch (role) {
    case "customer": {
      if (path.startsWith("/requests")) return pickNavSlug(role, "requests");
      if (
        path.includes("/check") &&
        (path.startsWith("/contractors") || path.includes("/contractors/"))
      ) {
        return pickNavSlug(role, "checks");
      }
      if (
        path === "/cart" ||
        path.startsWith("/cart/") ||
        path.startsWith("/checkout")
      ) {
        return pickNavSlug(role, "cart");
      }
      if (path.startsWith("/payments")) return pickNavSlug(role, "payments");

      const accountSlug = matchAccountSlug(path, role);
      if (accountSlug !== undefined) {
        if (accountSlug === "repeat-order" || accountSlug === "completed-projects") {
          return pickNavSlug(role, "active-projects");
        }
        if (accountSlug === "legal") return pickNavSlug(role, "profile");
        if (accountSlug === "documents") return pickNavSlug(role, "edo");
        if (accountSlug === "cart" || accountSlug === "checkout") return undefined;
        return pickNavSlug(role, accountSlug);
      }
      break;
    }
    case "contractor": {
      if (path.startsWith("/requests")) return pickNavSlug(role, "available-requests");
      if (path.startsWith("/services")) return pickNavSlug(role, "services");
      if (path.startsWith("/payments")) return pickNavSlug(role, "payouts");
      if (path.includes("/portfolio")) return pickNavSlug(role, "profile");

      const accountSlug = matchAccountSlug(path, role);
      if (accountSlug !== undefined) {
        if (accountSlug === "completed-projects" || accountSlug === "gantt") {
          return pickNavSlug(role, "active-projects");
        }
        if (
          accountSlug === "cities" ||
          accountSlug === "production" ||
          accountSlug === "portfolio" ||
          accountSlug === "reviews"
        ) {
          return pickNavSlug(role, "profile");
        }
        return pickNavSlug(role, accountSlug);
      }
      break;
    }
    case "venue": {
      if (path.startsWith("/events")) return pickNavSlug(role, "events");
      if (path.startsWith("/venues")) return pickNavSlug(role, "halls");
      if (path === "/orders" || path.startsWith("/orders/")) return pickNavSlug(role, "orders");
      if (path.startsWith("/payments")) return pickNavSlug(role, "payments");

      const accountSlug = matchAccountSlug(path, role);
      if (accountSlug === "spaces" || accountSlug === "floor-plan") {
        return pickNavSlug(role, "halls");
      }
      if (accountSlug !== undefined) return pickNavSlug(role, accountSlug);
      break;
    }
    case "organizer": {
      if (path.startsWith("/events")) return pickNavSlug(role, "events");
      if (path.startsWith("/venues")) return pickNavSlug(role, "venues");
      if (path === "/orders" || path.startsWith("/orders/")) return pickNavSlug(role, "orders");
      if (path.startsWith("/payments")) return pickNavSlug(role, "payments");
      if (path.startsWith("/account/organizer/contractors")) return pickNavSlug(role, "events");

      const accountSlug = matchAccountSlug(path, role);
      if (accountSlug !== undefined) return pickNavSlug(role, accountSlug);
      break;
    }
  }

  const matched = nav.find((item) => matchNavItemPath(path, item, role));
  return matched?.slug;
}

export function isNavItemActive(pathname: string, item: NavItem, role?: string): boolean {
  const path = normalizePathname(pathname);

  if (role) {
    const resolved = resolveActiveNavSlug(path, role);
    if (resolved !== undefined) return item.slug === resolved;
  }

  return matchNavItemPath(path, item, role);
}

function matchNavItemPath(path: string, item: NavItem, role?: string): boolean {
  if (path === item.href) return true;
  if (item.href === "/messages") return path.startsWith("/messages");
  if (item.slug === "edo" && role === "customer") {
    return (
      path.startsWith("/account/customer/edo") ||
      path.startsWith("/account/customer/documents") ||
      path === "/documents" ||
      path.startsWith("/documents/") ||
      path.includes("/reminders") ||
      path.includes("/closing-docs")
    );
  }
  if (!item.slug) return path === item.href;
  if (
    item.slug === "events" &&
    (path.includes("/create-event") ||
      path.includes("/edit-event") ||
      path.startsWith("/events/"))
  ) {
    return true;
  }
  if (item.slug === "active-projects" && (path.includes("/repeat-order") || path.includes("/completed-projects"))) {
    return true;
  }
  if (item.href.startsWith("/account/")) {
    return path === item.href || path.startsWith(`${item.href}/`);
  }
  if (item.slug === "requests") return path.startsWith("/requests");
  if (item.slug === "cart") {
    return (
      path === "/cart" ||
      path.startsWith("/cart/") ||
      path.startsWith("/checkout") ||
      path.includes("/checkout") ||
      path === "/account/customer/cart" ||
      path.startsWith("/account/customer/checkout")
    );
  }
  if (item.slug === "favorites") {
    return path === "/account/customer/favorites" || path.startsWith("/account/customer/favorites/");
  }
  if (item.slug === "my-events") {
    return path === "/account/customer/my-events" || path.startsWith("/account/customer/my-events/");
  }
  if (item.slug === "checks") {
    return (
      (path.startsWith("/contractors") || path.includes("/contractors/")) &&
      path.includes("/check")
    );
  }
  if (item.slug === "available-requests") return path.startsWith("/requests");
  if (item.slug === "services") return path.startsWith("/services");
  if (item.slug === "payouts") return path.startsWith("/payments");
  if (item.slug === "halls") return path.startsWith("/venues");
  if (item.slug === "venues" && role === "organizer") return path.startsWith("/venues");

  return false;
}
