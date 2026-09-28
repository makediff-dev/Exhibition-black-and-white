import Link from "next/link";
import { HOME_WORK_FORMATS } from "@/constants/home-content";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import styles from "./home-page.module.css";

export function HomeWorkFormatsSection() {
  return (
    <section className={styles.workFormatsSection}>
      <div className={styles.container}>
        <div className={styles.containerInner}>
          <div className={styles.workFormatsGrid}>
            <div className={styles.workFormatsRow}>
              {HOME_WORK_FORMATS.slice(0, 2).map((format) => (
                <article key={format.title} className={styles.workFormatCard}>
                  <div className={styles.workFormatImageWrap}>
                    <ResponsiveImage
                      src={format.imageUrl}
                      alt=""
                      className={styles.workFormatImage}
                      width={800}
                      height={520}
                      sizes="(max-width: 767px) 100vw, 50vw"
                    />
                  </div>
                  <div className={styles.workFormatBody}>
                    <div className={styles.workFormatCopy}>
                      <h3 className={styles.workFormatTitle}>{format.title}</h3>
                      <p className={styles.workFormatText}>{format.text}</p>
                    </div>
                    <Link href={format.href} className={styles.workFormatButton}>
                      {format.buttonLabel}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
            <div className={styles.workFormatsRow}>
              {HOME_WORK_FORMATS.slice(2).map((format) => (
                <article key={format.title} className={styles.workFormatCard}>
                  <div className={styles.workFormatImageWrap}>
                    <ResponsiveImage
                      src={format.imageUrl}
                      alt=""
                      className={styles.workFormatImage}
                      width={800}
                      height={520}
                      sizes="(max-width: 767px) 100vw, 50vw"
                    />
                  </div>
                  <div className={styles.workFormatBody}>
                    <div className={styles.workFormatCopy}>
                      <h3 className={styles.workFormatTitle}>{format.title}</h3>
                      <p className={styles.workFormatText}>{format.text}</p>
                    </div>
                    <Link href={format.href} className={styles.workFormatButton}>
                      {format.buttonLabel}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
