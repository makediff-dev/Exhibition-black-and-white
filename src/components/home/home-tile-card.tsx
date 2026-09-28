import Link from "next/link";
import {
  HOME_TILE_BUTTON_VARIANTS,
  type HomeTileButtonVariant,
} from "@/constants/home-button-variants";
import { ResponsiveImage } from "@/components/ui/responsive-image";
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
}

export function HomeTileCard({
  title,
  meta = [],
  buttonLabel,
  buttonHref,
  onButtonClick,
  buttonVariant = "primary",
  imageUrl,
}: HomeTileCardProps) {
  const buttonClass = BUTTON_CLASS_MAP[buttonVariant];
  const buttonColors = HOME_TILE_BUTTON_VARIANTS[buttonVariant];
  const buttonStyle = { backgroundColor: buttonColors.background };

  return (
    <article className={styles.tileCard}>
      <div className={styles.tileImageWrap}>
        <div className={styles.tileImage}>
          {imageUrl ? (
            <ResponsiveImage
              src={imageUrl}
              alt=""
              fill
              className={styles.tileImagePhoto}
              sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 25vw"
            />
          ) : null}
          <div className={styles.tileImageDots} aria-hidden="true">
            <span className={`${styles.tileImageDot} ${styles.tileImageDotActive}`} />
            <span className={styles.tileImageDot} />
            <span className={styles.tileImageDot} />
          </div>
        </div>
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
            <Link href={buttonHref} className={buttonClass} style={buttonStyle}>
              {buttonLabel}
            </Link>
          ) : (
            <button type="button" className={buttonClass} style={buttonStyle} onClick={onButtonClick}>
              {buttonLabel}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}