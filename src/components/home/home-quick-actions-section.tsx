import Link from "next/link";
import { HOME_QUICK_ACTIONS } from "@/constants/home-content";
import styles from "./home-page.module.css";

export function HomeQuickActionsSection() {
  return (
    <section className={styles.sectionCompact}>
      <div className={styles.container}>
        <div className={styles.containerInner}>
          <h2 className={styles.quickActionsTitle}>Как мы помогаем сделать ваш проект важным?</h2>
          <div className={styles.quickActionsGrid}>
            {HOME_QUICK_ACTIONS.map((action, index) => (
              <div key={action.title} className={styles.quickActionItem}>
                <Link
                  href={action.href}
                  className={`${styles.quickActionCard} ${styles[`quickActionCard${index + 1}`]}`}
                >
                  <div className={styles.quickActionTop}>
                    <h3 className={styles.quickActionTitle}>{action.title}</h3>
                    <p className={styles.quickActionText}>{action.text}</p>
                  </div>
                  <div className={styles.quickActionImage}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={action.imageUrl}
                      alt=""
                      className={`${styles.quickActionImagePhoto}${index === 0 ? ` ${styles.quickActionImagePhotoContain}` : ""}`}
                    />
                  </div>
                </Link>
                <Link
                  href={`/register?role=${action.registerRole}`}
                  className={`${styles.quickActionRegisterButton} ${styles[`quickActionRegisterButton${index + 1}`]}`}
                >
                  {action.registerLabel}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}