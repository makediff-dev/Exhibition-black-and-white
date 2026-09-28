import Link from "next/link";
import { HOME_AUDIENCE_BLOCKS } from "@/constants/home-content";
import { ExpandableText } from "@/components/ui/expandable-text";
import { ResponsiveImage } from "@/components/ui/responsive-image";
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
        <ExpandableText text={text} className={styles.audienceText} />
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
                      <ResponsiveImage
                        src={block.imageUrl}
                        alt=""
                        width={1200}
                        height={800}
                        className={styles.audienceMediaPhoto}
                        sizes="(max-width: 767px) 100vw, 50vw"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.audienceMedia}>
                      <ResponsiveImage
                        src={block.imageUrl}
                        alt=""
                        width={1200}
                        height={800}
                        className={styles.audienceMediaPhoto}
                        sizes="(max-width: 767px) 100vw, 50vw"
                      />
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