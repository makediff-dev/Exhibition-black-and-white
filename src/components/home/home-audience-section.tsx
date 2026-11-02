"use client";

import Link from "next/link";
import { HOME_AUDIENCE_BLOCKS } from "@/constants/home-content";
import { addCompanyHref } from "@/lib/auth/session";
import { useAuthStore } from "@/lib/store";
import { ExpandableText } from "@/components/ui/expandable-text";
import type { UserRole } from "@/data/types";
import { HomeArrowIcon } from "./home-arrow-icon";
import styles from "./home-page.module.css";

function AudiencePanel({
  title,
  text,
  href,
  moreHref,
  linkLabel,
  role,
  isAuthenticated,
}: {
  title: string;
  text: string;
  href: string;
  moreHref: string;
  linkLabel: string;
  role: Exclude<UserRole, null>;
  isAuthenticated: boolean;
}) {
  return (
    <div className={styles.audiencePanel}>
      <div>
        <h3 className={styles.audienceTitle}>{title}</h3>
        <ExpandableText text={text} className={styles.audienceText} />
      </div>
      <div className={styles.audienceActions}>
        {isAuthenticated ? (
          <Link href={addCompanyHref(role)} className={styles.audienceAddCompany}>
            Добавить компанию
          </Link>
        ) : (
          <Link href={href} className={styles.audienceRegister}>
            {linkLabel}
          </Link>
        )}
        <Link href={moreHref} className={styles.audienceLink}>
          Узнать подробнее
          <HomeArrowIcon />
        </Link>
      </div>
    </div>
  );
}

export function HomeAudienceSection() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <section className={styles.audienceSection}>
      <div className={styles.container}>
        <div className={styles.containerInner}>
          <h2 className={styles.audienceSectionTitle}>Для кого подойдёт наш сервис</h2>
          <div className={styles.audienceGrid}>
            {HOME_AUDIENCE_BLOCKS.map((block) => (
              <div
                key={block.title}
                className={`${styles.audienceRow} ${block.reverse ? styles.audienceRowReverse : ""}`}
              >
                {block.reverse ? (
                  <>
                    <AudiencePanel {...block} isAuthenticated={isAuthenticated} />
                    <div className={styles.audienceMedia}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={block.imageUrl} alt="" className={styles.audienceMediaPhoto} />
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.audienceMedia}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={block.imageUrl} alt="" className={styles.audienceMediaPhoto} />
                    </div>
                    <AudiencePanel {...block} isAuthenticated={isAuthenticated} />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
