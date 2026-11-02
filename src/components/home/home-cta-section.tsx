"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/store";
import styles from "./home-page.module.css";

export function HomeCtaSection() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const showBecomeContractor = !isAuthenticated;

  return (
    <section className={styles.ctaSection}>
      <div className={styles.container}>
        <div className={styles.containerInner}>
          <div className={styles.ctaCard}>
            <div className={styles.ctaContent}>
              <h2 className={styles.ctaTitle}>
                Готовы собрать команду
                <br />
                для вашей выставки?
              </h2>
              <p className={styles.ctaText}>
                Разместите заказ бесплатно и&nbsp;получите первые предложения.
              </p>
              <div className={styles.ctaActions}>
                <Link href="/requests/new" className={styles.ctaPrimaryButton}>
                  Разместить заказ
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/home/cta-arrow.svg"
                    alt=""
                    width={16}
                    height={16}
                    className={styles.ctaPrimaryIcon}
                  />
                </Link>
                {showBecomeContractor ? (
                  <Link href="/register?role=contractor" className={styles.ctaSecondaryButton}>
                    Стать исполнителем
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
