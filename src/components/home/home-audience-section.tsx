import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HOME_AUDIENCE_BLOCKS } from "@/constants/home-content";
import styles from "./home-page.module.css";

export function HomeAudienceSection() {
  return (
    <section className={styles.section}>
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
                    <div className={styles.audienceMedia}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={block.imageUrl} alt="" className={styles.audienceMediaPhoto} />
                    </div>
                    <div className={styles.audiencePanel}>
                      <h3 className={styles.audienceTitle}>{block.title}</h3>
                      <p className={styles.audienceText}>{block.text}</p>
                      <Link href={block.href} className={styles.audienceLink}>
                        {block.linkLabel}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.audiencePanel}>
                      <h3 className={styles.audienceTitle}>{block.title}</h3>
                      <p className={styles.audienceText}>{block.text}</p>
                      <Link href={block.href} className={styles.audienceLink}>
                        {block.linkLabel}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                    <div className={styles.audienceMedia}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={block.imageUrl} alt="" className={styles.audienceMediaPhoto} />
                    </div>
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