import styles from "./home-page.module.css";

interface HomeArrowIconProps {
  className?: string;
}

export function HomeArrowIcon({ className }: HomeArrowIconProps) {
  return (
    <svg
      className={`${styles.homeArrow} ${className ?? ""}`.trim()}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M7.6 0C7.6 3.88571 9.66667 5.94286 12.3778 6.72V6.85714H0V9.14286H12.3778V9.25714C9.66667 10.0571 7.6 12.1143 7.6 16H10.0444C10.0444 12.5486 12.6222 10.5143 16 8.82286V7.2C12.6222 5.50857 10.0444 3.47429 10.0444 0H7.6Z"
        fill="currentColor"
      />
    </svg>
  );
}
