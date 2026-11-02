"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getActiveHomePromoBanners,
  HOME_PROMO_AUTOPLAY_MS,
} from "@/constants/home-promo-banners";
import { AdBadge } from "./ad-badge";
import styles from "./home-page.module.css";
import adStyles from "./ad-badge.module.css";

export function HomePromoSlider() {
  const slides = getActiveHomePromoBanners();
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [adMenuOpen, setAdMenuOpen] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const count = slides.length;
  const canCycle = count > 1;
  const slide = slides[index] ?? slides[0];
  const paused = hovered || adMenuOpen || reduceMotion || !canCycle;

  const goTo = useCallback(
    (next: number) => {
      if (!canCycle) return;
      setAdMenuOpen(false);
      setIndex((next + count) % count);
    },
    [canCycle, count],
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (index < count) return;
    setIndex(0);
  }, [count, index]);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, HOME_PROMO_AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [paused, count]);

  if (!slide) return null;

  return (
    <section className={styles.promoSection} aria-roledescription="carousel" aria-label="Рекламный баннер">
      <div className={styles.container}>
        <div
          className={styles.promoSlide}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocusCapture={() => setHovered(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setHovered(false);
            }
          }}
        >
          <Link
            href={slide.href}
            className={styles.promoLink}
            aria-label={`Реклама: ${slide.title}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={slide.imageUrl} alt="" className={styles.promoPhoto} />
            <div className={styles.promoOverlay}>
              <p className={styles.promoTitle}>{slide.title}</p>
              <span className={styles.promoCta}>{slide.ctaLabel}</span>
            </div>
          </Link>

          <AdBadge
            key={slide.id}
            className={adStyles.banner}
            advertiser={slide.advertiser.name}
            inn={slide.advertiser.inn}
            erid={slide.advertiser.erid}
            showAdvertiserName
            onOpenChange={setAdMenuOpen}
          />

          {canCycle ? (
            <>
              <button
                type="button"
                className={`${styles.promoArrow} ${styles.promoArrowPrev}`}
                aria-label="Предыдущий слайд"
                onClick={() => goTo(index - 1)}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                className={`${styles.promoArrow} ${styles.promoArrowNext}`}
                aria-label="Следующий слайд"
                onClick={() => goTo(index + 1)}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className={styles.promoDots} role="tablist" aria-label="Слайды рекламы">
                {slides.map((item, slideIndex) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-label={`Слайд ${slideIndex + 1}`}
                    aria-selected={slideIndex === index}
                    className={`${styles.promoDot} ${slideIndex === index ? styles.promoDotActive : ""}`}
                    onClick={() => goTo(slideIndex)}
                  />
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
