import Link from "next/link";
import styles from "./footer.module.css";

const SECTION_LINKS = [
  { href: "/events", label: "Мероприятия" },
  { href: "/contractors", label: "Исполнители" },
  { href: "/services", label: "Услуги" },
  { href: "/venues", label: "Площадки" },
  { href: "/how-it-works", label: "Как работает сервис" },
] as const;

const LEGAL_LINKS = [
  { href: "/legal/terms", label: "Условия использования" },
  { href: "/legal/privacy", label: "Политика конфиденциальности" },
  { href: "/contacts", label: "Контакты" },
] as const;

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.columns}>
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              <span className={styles.logoMark}>Э</span>
              <span className={styles.logoText}>ЭКСПО</span>
            </Link>
            <p className={styles.description}>
              Маркетплейс выставочной индустрии — мероприятия, исполнители, услуги и площадки на одной
              платформе.
            </p>
          </div>

          <nav className={styles.column} aria-labelledby="footer-sections">
            <p id="footer-sections" className={styles.columnTitle}>
              Разделы
            </p>
            <ul className={styles.list}>
              {SECTION_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className={styles.column} aria-labelledby="footer-legal">
            <p id="footer-legal" className={styles.columnTitle}>
              Правовая информация
            </p>
            <ul className={styles.list}>
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <p className={styles.copyright}>© 2026 Маркетплейс выставочной индустрии</p>
      </div>
    </footer>
  );
}
