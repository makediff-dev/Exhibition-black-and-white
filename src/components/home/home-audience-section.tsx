import Link from "next/link";
import { HOME_AUDIENCE_BLOCKS } from "@/constants/home-content";
import styles from "./home-page.module.css";

function AudiencePanel({
  title,
  text,
  href,
  linkLabel,
}: {
  title: string;
  text: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className={styles.audiencePanel}>
      <div>
        <h3 className={styles.audienceTitle}>{title}</h3>
        <p className={styles.audienceText}>{text}</p>
      </div>
      <Link href={href} className={styles.audienceLink}>
        {linkLabel}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/home/audience/arrow-right.svg" alt="" className={styles.audienceLinkIcon} />
      </Link>
    </div>
  );
}

export function HomeAudienceSection() {
  return (
    <section className={styles.audienceSection}>
      <div className={styles.container}>
        <div className={styles.containerInner}>
          <div className={styles.audienceGrid}>
            {HOME_AUDIENCE_BLOCKS.map((block) => (
              <div
                key={block.title}
                className={`${styles.audienceRow} ${block.reverse ? styles.audienceRowReverse : ""}`}
              >
                {block.reverse ? (
                  <>
                    <AudiencePanel {...block} />
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
                    <AudiencePanel {...block} />
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