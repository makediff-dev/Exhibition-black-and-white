import Link from "next/link";
import { SERVICE_CATEGORIES } from "@/constants/categories";
import { HOME_IMAGES, pickHomeImage } from "@/constants/home-images";
import { ResponsiveImage } from "@/components/ui/responsive-image";
import { HomeScrollSection } from "./home-scroll-section";
import styles from "./home-page.module.css";

export function HomeCategoriesSection() {
  return (
    <HomeScrollSection
      title="Популярные категории услуг"
      linkHref="/services"
      linkLabel="Все услуги"
      showFilters={false}
      mobileCount={4}
    >
      {SERVICE_CATEGORIES.map((category, index) => (
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
              sizes="(max-width: 767px) 50vw, 20vw"
            />
          </div>
          <p className={styles.categoryLabel}>{category}</p>
        </Link>
      ))}
    </HomeScrollSection>
  );
}
