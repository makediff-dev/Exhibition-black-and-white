import { ChevronDown } from "lucide-react";
import { CITIES, EVENT_INDUSTRIES } from "@/constants/categories";
import styles from "./home-page.module.css";

export function HomeCardsFilters() {
  return (
    <div className={styles.filtersRow}>
      <div className={styles.filterSelectWrap}>
        <select className={styles.filterSelect} defaultValue="" aria-label="Выбрать диапазон">
          <option value="">Выбрать диапазон</option>
          <option value="week">Ближайшая неделя</option>
          <option value="month">Ближайший месяц</option>
          <option value="quarter">Ближайшие 3 месяца</option>
        </select>
        <ChevronDown className={styles.filterSelectIcon} aria-hidden="true" />
      </div>
      <div className={styles.filterSelectWrap}>
        <select className={styles.filterSelect} defaultValue="moscow" aria-label="Город">
          <option value="moscow">Мероприятия в Москве</option>
          {CITIES.filter((city) => city !== "Москва").map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
        <ChevronDown className={styles.filterSelectIcon} aria-hidden="true" />
      </div>
      <div className={styles.filterSelectWrap}>
        <select className={styles.filterSelect} defaultValue="" aria-label="Отрасль">
          <option value="">По отраслям</option>
          {EVENT_INDUSTRIES.map((industry) => (
            <option key={industry} value={industry}>
              {industry}
            </option>
          ))}
        </select>
        <ChevronDown className={styles.filterSelectIcon} aria-hidden="true" />
      </div>
    </div>
  );
}