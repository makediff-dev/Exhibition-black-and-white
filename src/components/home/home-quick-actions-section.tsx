"use client";

import { useCallback, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HOME_QUICK_ACTIONS } from "@/constants/home-content";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import styles from "./home-page.module.css";

export function HomeQuickActionsSection() {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollByPage = useCallback((direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth, behavior: "smooth" });
  }, []);

  return (
    <section className={styles.sectionCompact}>
      <div className={styles.container}>
        <div className={styles.containerInner}>
          <h2 className={styles.quickActionsTitle}>
            <span className={styles.sectionTitleDesktop}>Как мы помогаем сделать ваш проект важным?</span>
            <span className={styles.sectionTitleMobile}>Как мы помогаем</span>
          </h2>
          <div className={styles.quickActionsViewport}>
            <button
              type="button"
              className={`${styles.scrollArrow} ${styles.quickActionsArrow} ${styles.quickActionsArrowPrev}`}
              aria-label="Предыдущие карточки"
              onClick={() => scrollByPage(-1)}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div ref={trackRef} className={styles.quickActionsGrid}>
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
                      <ResponsiveImage
                        src={action.imageUrl}
                        alt=""
                        className={styles.quickActionImagePhoto}
                        sizes="(max-width: 767px) 85vw, (max-width: 1280px) 40vw, 220px"
                        width={440}
                        height={312}
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
            <button
              type="button"
              className={`${styles.scrollArrow} ${styles.quickActionsArrow} ${styles.quickActionsArrowNext}`}
              aria-label="Следующие карточки"
              onClick={() => scrollByPage(1)}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
