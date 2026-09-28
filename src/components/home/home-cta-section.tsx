import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import styles from "./home-page.module.css";

export function HomeCtaSection() {
  return (
    <section className={styles.ctaSection}>
      <div className={styles.container}>
        <div className={styles.containerInner}>
          <div className={styles.ctaCard}>
            <div className={styles.ctaGlow} aria-hidden="true" />
            <div className={styles.ctaContent}>
              <h2 className={styles.ctaTitle}>
                <span className={styles.ctaTitleDesktop}>
                  Готовы собрать команду
                  <br />
                  для вашей выставки?
                </span>
                <span className={styles.ctaTitleMobile}>Соберите команду для выставки</span>
              </h2>
              <p className={styles.ctaText}>
                Разместите заявку бесплатно и получите первые предложения уже через полчаса.
              </p>
              <div className={styles.ctaActions}>
                <Link href="/requests/new" className={styles.ctaPrimaryButton}>
                  Разместить заявку
                  <ArrowUpRight className={styles.ctaPrimaryIcon} aria-hidden="true" />
                </Link>
                <Link href="/register" className={styles.ctaSecondaryButton}>
                  Стать исполнителем
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}