import Link from "next/link";
import { POPULAR_SERVICE_CATEGORIES } from "@/constants/categories";
import { HOME_IMAGES, pickHomeImage } from "@/constants/home-images";
import { HomeScrollSection } from "./home-scroll-section";
import styles from "./home-page.module.css";

export function HomeCategoriesSection() {
  const categories = POPULAR_SERVICE_CATEGORIES.filter((cat) => cat !== "Больше услуг");

  return (
    <HomeScrollSection
      title="Популярные категории услуг"
      linkHref="/services"
      linkLabel="Все услуги"
      showFilters={false}
      showActions={false}
      variant="slider"
    >
      {categories.map((category, index) => (
        <Link
          key={category}
          href={`/services?category=${encodeURIComponent(category)}`}
          className={styles.categoryCard}
        >
          <div className={styles.categoryImage}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pickHomeImage(HOME_IMAGES.categories, index)}
              alt=""
              className={styles.categoryImagePhoto}
            />
          </div>
          <p className={styles.categoryLabel}>{category}</p>
        </Link>
      ))}
      <Link href="/services" className={styles.categoryCard}>
        <div className={styles.categoryImage}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={HOME_IMAGES.categoryMore} alt="" className={styles.categoryImagePhoto} />
        </div>
        <p className={styles.categoryLabel}>Больше услуг</p>
      </Link>
    </HomeScrollSection>
  );
}