"use client";

import { useState } from "react";
import { HOME_HOW_IT_WORKS_STEPS } from "@/constants/home-content";
import { HOME_IMAGES } from "@/constants/home-images";
import styles from "./home-page.module.css";

export function HomeHowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section className={styles.howItWorksSection}>
      <div className={styles.container}>
        <div className={styles.containerInner}>
          <div className={styles.howItWorks}>
            <div className={styles.howItWorksContent}>
              <h2 className={styles.sectionTitle}>Как работает сервис</h2>

              <div className={styles.howItWorksBottom}>
                <div className={styles.howSteps}>
                  {HOME_HOW_IT_WORKS_STEPS.map((step, index) => {
                    const isActive = index === activeStep;

                    return (
                      <div key={step.title} className={styles.howStepGroup}>
                        <button
                          type="button"
                          className={`${styles.howStep} ${isActive ? styles.howStepActive : ""}`}
                          onClick={() => setActiveStep(index)}
                        >
                          <span className={styles.howStepDotWrap}>
                            <span className={styles.howStepDot} aria-hidden="true" />
                          </span>
                          <span className={styles.howStepHead}>
                            <p className={styles.howStepTitle}>{step.title}</p>
                          </span>
                        </button>
                        {isActive ? <p className={styles.howStepText}>{step.text}</p> : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className={styles.howImage}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={HOME_IMAGES.howItWorks} alt="" className={styles.howImagePhoto} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}