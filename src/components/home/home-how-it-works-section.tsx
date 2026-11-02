import Link from "next/link";
import { HOME_HOW_IT_WORKS_STEPS } from "@/constants/home-content";
import { HomeArrowIcon } from "./home-arrow-icon";
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
                <span className={styles.howStepNumber}>{index + 1}</span>
                <h3 className={styles.howStepCardTitle}>{step.title}</h3>
                <p className={styles.howStepCardText}>{step.text}</p>
              </article>
            ))}
          </div>
          <Link href="/how-it-works" className={styles.howMoreLink}>
            Подробнее о сервисе
            <HomeArrowIcon />
          </Link>
        </div>
      </div>
    </section>
  );
}
