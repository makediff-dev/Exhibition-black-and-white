"use client";

import { ChevronDown } from "lucide-react";
import { HOME_FAQ_ITEMS } from "@/constants/home-content";
import styles from "./home-page.module.css";

export function HomeFaqSection() {
  return (
    <section className={styles.faqSection}>
      <div className={styles.container}>
        <div className={styles.containerInner}>
          <div className={styles.faqWrap}>
            <h2 className={styles.faqTitle}>Часто задаваемые вопросы</h2>
            <div className={styles.faqList}>
              {HOME_FAQ_ITEMS.map((item) => (
                <details key={item.title} className={styles.faqItem}>
                  <summary className={styles.faqSummary}>
                    <span>{item.title}</span>
                    <ChevronDown className={styles.faqSummaryIcon} aria-hidden="true" />
                  </summary>
                  <div className={styles.faqContent}>{item.content}</div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}