import Link from "next/link";
import { HomeArrowIcon } from "./home-arrow-icon";
import styles from "./home-page.module.css";

interface HomeSectionLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function HomeSectionLink({ href, children, className }: HomeSectionLinkProps) {
  return (
    <Link href={href} className={`${styles.sectionLink} ${className ?? ""}`.trim()}>
      <span>{children}</span>
      <HomeArrowIcon className={styles.sectionLinkIcon} />
    </Link>
  );
}
