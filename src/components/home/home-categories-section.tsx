import Link from "next/link";
import { POPULAR_SERVICE_CATEGORIES } from "@/constants/categories";
import { HOME_IMAGES, pickHomeImage } from "@/constants/home-images";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { HomeScrollSection } from "./home-scroll-section";
import styles from "./home-page.module.css";

export function HomeCategoriesSection() {
  const categories = POPULAR_SERVICE_CATEGORIES.filter((cat) => cat !== "Больше услуг");

  return (
    <HomeScrollSection
      title="Популярные категории услуг"
      mobileTitle="Категории услуг"
      linkHref="/services"
      linkLabel="Все услуги"
      showFilters={false}
      showActions={false}
      variant="slider"
      minCardWidth={190}
    >
      {categories.map((category, index) => (
        <Link
          key={category}
          href={`/services?category=${encodeURIComponent(category)}`}
          className={styles.categoryCard}
        >
          <div className={styles.categoryImage}>
            <ResponsiveImage
              src={pickHomeImage(HOME_IMAGES.categories, index)}
              alt=""
              fill
              className={styles.categoryImagePhoto}
              sizes="(max-width: 767px) 70vw, 190px"
            />
          </div>
          <p className={styles.categoryLabel}>{category}</p>
        </Link>
      ))}
      <Link href="/services" className={styles.categoryCard}>
        <div className={styles.categoryImage}>
          <ResponsiveImage
            src={HOME_IMAGES.categoryMore}
            alt=""
            fill
            className={styles.categoryImagePhoto}
            sizes="(max-width: 767px) 70vw, 190px"
          />
        </div>
        <p className={styles.categoryLabel}>Больше услуг</p>
      </Link>
    </HomeScrollSection>
  );
}