import { HOME_HOW_IT_WORKS_STEPS } from "@/constants/home-content";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import styles from "./home-page.module.css";

export function HomeHowItWorksSection() {
  const [registrationStep, ...otherSteps] = HOME_HOW_IT_WORKS_STEPS;

  return (
    <section className={styles.howItWorksSection}>
      <div className={styles.container}>
        <div className={styles.howItWorks}>
            <h2 className={styles.howItWorksTitle}>Как работает сервис</h2>

            <div className={styles.howItWorksCards}>
              <article className={styles.howFeaturedCard}>
                <div className={styles.howFeaturedCopy}>
                  <h3 className={styles.howCardTitle}>{registrationStep.title}</h3>
                  <p className={styles.howCardText}>{registrationStep.text}</p>
                </div>
                <div className={styles.howFeaturedImage}>
                  <ResponsiveImage
                    src={registrationStep.imageUrl}
                    alt=""
                    width={800}
                    height={600}
                    sizes="(max-width: 767px) 100vw, 50vw"
                  />
                </div>
              </article>

              <div className={styles.howCardsGrid}>
                {otherSteps.map((step, index) => (
                  <article key={step.title} className={styles.howCard}>
                    <div className={styles.howCardCopy}>
                      <h3 className={styles.howCardTitle}>{step.title}</h3>
                      <p className={styles.howCardText}>{step.text}</p>
                    </div>
                    <div className={`${styles.howCardImage} ${styles[`howCardImage${index + 1}`]}`}>
                      <ResponsiveImage
                        src={step.imageUrl}
                        alt=""
                        width={640}
                        height={480}
                        sizes="(max-width: 767px) 100vw, 33vw"
                      />
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