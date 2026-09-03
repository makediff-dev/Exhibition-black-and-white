import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
      <ArrowRight className={styles.sectionLinkIcon} aria-hidden="true" />
    </Link>
  );
}