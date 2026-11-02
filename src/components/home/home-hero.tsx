"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { loginHref, registerHref } from "@/lib/auth/session";
import { useAuthStore } from "@/lib/store";
import { cn } from "@/lib/utils/cn";
import styles from "./home-page.module.css";

export function HomeHero() {
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <section className={cn(styles.hero, isAuthenticated && styles.heroAuth)}>
      <div className={styles.container}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>Маркетплейс выставочной индустрии</h1>
          <p className={styles.heroSubtitle}>
            Заказчики, исполнители, организаторы и площадки в одном месте. Находите и ведите проекты
            от заказа и переписки до оплаты и документов
          </p>
          {!isAuthenticated ? (
            <div className={styles.heroGuestActions}>
              <Link href={registerHref()} className={styles.heroRegisterButton}>
                Зарегистрироваться
              </Link>
              <Link href={loginHref(pathname)} className={styles.heroLoginButton}>
                Войти
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
