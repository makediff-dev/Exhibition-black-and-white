"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { HomeTileButtonVariant } from "@/constants/home-button-variants";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { AdBadge } from "./ad-badge";
import styles from "./home-page.module.css";

export interface HomeTileCardMetaItem {
  label: string;
  value: string;
}

const BUTTON_CLASS_MAP: Record<HomeTileButtonVariant, string> = {
  primary: styles.tileButtonFilled,
  blue: styles.tileButtonBlue,
  green: styles.tileButtonGreen,
  purple: styles.tileButtonPurple,
  violet: styles.tileButtonViolet,
  pink: styles.tileButtonPink,
};

interface HomeTileCardProps {
  title: string;
  meta?: HomeTileCardMetaItem[];
  buttonLabel: string;
  buttonHref?: string;
  onButtonClick?: () => void;
  buttonVariant?: HomeTileButtonVariant;
  imageUrl?: string;
  imageUrls?: string[];
  imageAlt?: string;
  sponsored?: boolean;
  enableCarousel?: boolean;
}

export function HomeTileCard({
  title,
  meta = [],
  buttonLabel,
  buttonHref,
  onButtonClick,
  buttonVariant = "primary",
  imageUrl,
  imageUrls,
  imageAlt = "",
  sponsored = false,
  enableCarousel = true,
}: HomeTileCardProps) {
  const router = useRouter();
  const sourceSlides = imageUrls && imageUrls.length > 0 ? imageUrls : imageUrl ? [imageUrl] : [];
  const slides = enableCarousel ? sourceSlides : sourceSlides.slice(0, 1);
  const [index, setIndex] = useState(0);
  const [adMenuOpen, setAdMenuOpen] = useState(false);
  const buttonClass = BUTTON_CLASS_MAP[buttonVariant];
  const current = slides[index] ?? slides[0];
  const canCycle = slides.length > 1;

  const goTo = (next: number) => {
    if (!canCycle) return;
    setIndex((next + slides.length) % slides.length);
  };

  const handlePhotoClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (!canCycle) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const clickedLeft = event.clientX - rect.left < rect.width / 2;
    goTo(index + (clickedLeft ? -1 : 1));
  };

  const handleCardClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!buttonHref) return;
    const target = event.target as HTMLElement;
    if (target.closest("a, button, [role='tab']")) return;
    router.push(buttonHref);
  };

  return (
    <article
      className={styles.tileCard}
      onClick={handleCardClick}
      style={buttonHref ? { cursor: "pointer" } : undefined}
    >
      <div className={styles.tileImageWrap}>
        <div
          className={`${styles.tileImage} ${canCycle ? styles.tileImageInteractive : ""}`}
          onClick={canCycle ? handlePhotoClick : undefined}
          role={canCycle ? "group" : undefined}
          aria-label={canCycle ? "Фото карточки. Нажмите, чтобы переключить." : undefined}
        >
          {current ? (
            <ResponsiveImage
              src={current}
              alt={imageAlt}
              fill
              className={styles.tileImagePhoto}
              sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 25vw"
            />
          ) : null}

          {slides.length > 1 ? (
            <div className={styles.tileCarousel} role="tablist" aria-label="Фото карточки">
              {slides.map((slide, slideIndex) => (
                <button
                  key={`${slide}-${slideIndex}`}
                  type="button"
                  role="tab"
                  aria-label={`Фото ${slideIndex + 1}`}
                  aria-selected={slideIndex === index}
                  className={`${styles.tileCarouselDot} ${
                    slideIndex === index ? styles.tileCarouselDotActive : ""
                  }`}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    goTo(slideIndex);
                  }}
                />
              ))}
            </div>
          ) : null}
        </div>

        {sponsored ? <AdBadge onOpenChange={setAdMenuOpen} /> : null}
      </div>

      <div className={styles.tileContent}>
        <div className={styles.tileContentMain}>
          <h3 className={styles.tileTitle}>{title}</h3>
          {meta.length > 0 ? (
            <div className={styles.tileMetaRow}>
              {meta.map((item) => (
                <p key={item.label} className={styles.tileMeta}>
                  <span className={styles.tileMetaLabel}>{item.label}:</span>{" "}
                  <span className={styles.tileMetaValue}>{item.value}</span>
                </p>
              ))}
            </div>
          ) : null}
        </div>

        <div className={styles.tileButtonWrap}>
          {buttonHref ? (
            <Link href={buttonHref} className={buttonClass}>
              {buttonLabel}
            </Link>
          ) : (
            <button type="button" className={buttonClass} onClick={onButtonClick}>
              {buttonLabel}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
