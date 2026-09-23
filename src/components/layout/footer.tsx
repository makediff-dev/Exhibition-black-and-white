import Link from "next/link";
import styles from "./footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div>
            <Link href="/" className={styles.logo}>
              <span className={styles.logoMark}>Э</span>
              <span className={styles.logoText}>ЭКСПО</span>
            </Link>
            <p className={styles.description}>
              Маркетплейс выставочной индустрии — мероприятия, исполнители, услуги и площадки на одной
              платформе.
            </p>
          </div>
          <div>
            <h4 className={styles.columnTitle}>Разделы</h4>
            <ul className={styles.list}>
              <li>
                <Link href="/events">Мероприятия</Link>
              </li>
              <li>
                <Link href="/contractors">Исполнители</Link>
              </li>
              <li>
                <Link href="/services">Услуги</Link>
              </li>
              <li>
                <Link href="/venues">Площадки</Link>
              </li>
              <li>
                <Link href="/how-it-works">Как работает сервис</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className={styles.columnTitle}>Правовая информация</h4>
            <ul className={styles.list}>
              <li>
                <Link href="/legal/terms">Условия использования</Link>
                <span className="ml-1 text-xs text-gray-500">(документ ещё не опубликован)</span>
              </li>
              <li>
                <Link href="/legal/privacy">Политика конфиденциальности</Link>
                <span className="ml-1 text-xs text-gray-500">(документ ещё не опубликован)</span>
              </li>
              <li>
                <Link href="/contacts">Контакты</Link>
                <span className="ml-1 text-xs text-gray-500">(поддержка в прототипе недоступна)</span>
              </li>
            </ul>
          </div>
        </div>
        <p className={styles.bottom}>© 2026 Маркетплейс выставочной индустрии. UX-прототип.</p>
      </div>
    </footer>
  );
}