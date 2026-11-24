import Link from "next/link";
import { HOME_HOW_IT_WORKS_STEPS } from "@/constants/home-content";
import styles from "./home-page.module.css";

export function HomeHowItWorksSection() {
  return (
    <section id="how-it-works" className={styles.howItWorksSection}>
      <div className={styles.container}>
        <div className={styles.howItWorks}>
          <h2 className={styles.howItWorksTitle}>Как работает сервис</h2>
          <div className={styles.howStepsGrid}>
            {HOME_HOW_IT_WORKS_STEPS.map((step, index) => (
              <article key={step.title} className={styles.howStepCard}>
                <div className={styles.howStepMeta}>
                  <span className={styles.howStepNumber}>{String(index + 1).padStart(2, "0")}</span>
                  <span className={styles.howStepDivider} aria-hidden="true" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={step.icon} alt="" className={styles.howStepIcon} width={28} height={28} />
                </div>
                <h3 className={styles.howStepCardTitle}>{step.title}</h3>
                <p className={styles.howStepCardText}>{step.text}</p>
              </article>
            ))}
          </div>
          <Link href="/how-it-works" className={styles.howMoreLink}>
            Подробнее о сервисе
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/home/how-it-works/more-arrow.svg" alt="" width={14} height={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
