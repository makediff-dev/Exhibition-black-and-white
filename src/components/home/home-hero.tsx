import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { HOME_IMAGES } from "@/constants/home-images";
import styles from "./home-page.module.css";

export function HomeHero() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>
            Маркетплейс выставочной
            <br />
            индустрии и не только
          </h1>
          <p className={styles.heroSubtitle}>
            Все мероприятия России, выставки, исполнители и сопутствующие услуги на одном сайте.
            Найдите исполнителей, услуги и мероприятия для участия в выставках
          </p>
          <form action="/events" className={styles.heroSearch}>
            <div className={styles.heroSearchField}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/home/hero-search-icon.svg" alt="" className={styles.heroSearchIcon} aria-hidden="true" />
              <input
                name="q"
                className={styles.heroSearchInput}
                placeholder="Поиск мероприятий, услуг, исполнителей..."
                aria-label="Поиск"
              />
            </div>
            <button type="submit" className={styles.heroSearchButton}>
              Найти
            </button>
          </form>
        </div>

        <div className={styles.heroBannerWrap}>
          <div className={styles.heroBanner}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={HOME_IMAGES.heroBanner} alt="" className={styles.heroBannerPhoto} />
          </div>
          <Link href="/events" className={styles.heroBannerArrow} aria-label="К мероприятиям">
            <span className={styles.heroBannerArrowButton}>
              <ChevronRight className="h-5 w-5" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}