"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  HOW_IT_WORKS_AUDIENCES,
  HOW_IT_WORKS_CAPABILITIES,
  HOW_IT_WORKS_FAQ,
  HOW_IT_WORKS_NAV,
  HOW_IT_WORKS_RULES,
} from "@/constants/how-it-works";
import { HowItWorksContactForm } from "./how-it-works-contact-form";
import styles from "./how-it-works.module.css";

const SECTION_IDS = HOW_IT_WORKS_NAV.map((item) => item.id);

function hashId(hash: string) {
  return hash.replace(/^#/, "");
}

function scrollToHash(hash: string) {
  const id = hashId(hash);
  if (!id) return;
  const target = document.getElementById(id);
  target?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function HowItWorksPage() {
  const [activeId, setActiveId] = useState(SECTION_IDS[0]);
  const ignoreObserverUntil = useRef(0);

  useEffect(() => {
    const applyHash = () => {
      const id = hashId(window.location.hash);
      if (id && SECTION_IDS.includes(id as (typeof SECTION_IDS)[number])) {
        ignoreObserverUntil.current = Date.now() + 700;
        setActiveId(id);
      }
      scrollToHash(window.location.hash);
    };

    const frame = window.requestAnimationFrame(applyHash);
    window.addEventListener("hashchange", applyHash);

    const nodes = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (node): node is HTMLElement => Boolean(node),
    );
    const observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < ignoreObserverUntil.current) return;
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveId(visible.target.id);
      },
      { rootMargin: "-90px 0px -55% 0px", threshold: [0.12, 0.35, 0.6] },
    );
    nodes.forEach((node) => observer.observe(node));

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", applyHash);
      observer.disconnect();
    };
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.hero}>
          <h1 className={styles.heroTitle}>Как работает сервис</h1>
          <p className={styles.heroLead}>
            Функционал для каждой роли, общие правила сделки и документы. Если вопрос не закрыт — напишите
            менеджеру, в том числе по спорной ситуации.
          </p>
        </header>

        <div className={styles.layout}>
          <nav className={styles.nav} aria-label="Содержание">
            {HOW_IT_WORKS_NAV.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`${styles.navLink} ${activeId === item.id ? styles.navLinkActive : ""}`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className={styles.main}>
            {HOW_IT_WORKS_AUDIENCES.map((audience) => (
              <section
                key={audience.id}
                id={audience.id}
                className={`${styles.section} ${styles.audienceCard}`}
              >
                <h2 className={styles.sectionTitle}>{audience.title}</h2>
                <p className={styles.sectionLead}>{audience.lead}</p>
                <ul className={styles.list}>
                  {audience.capabilities.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className={styles.flowTitle}>Как это проходит</p>
                <ol className={styles.flow}>
                  {audience.flow.map((step, index) => (
                    <li key={step} className={styles.flowItem}>
                      <span className={styles.flowIndex}>{index + 1}</span>
                      <p className={styles.flowText}>{step}</p>
                    </li>
                  ))}
                </ol>
                <div className={styles.actions}>
                  <Link href={audience.ctaHref} className={styles.primaryLink}>
                    {audience.ctaLabel}
                  </Link>
                  <Link href={audience.catalogHref} className={styles.secondaryLink}>
                    {audience.catalogLabel}
                  </Link>
                  <a href="#contact" className={styles.ghostLink}>
                    Вопрос менеджеру
                  </a>
                </div>
              </section>
            ))}

            <section id="rules" className={styles.section}>
              <h2 className={styles.sectionTitle}>Общие правила</h2>
              <p className={styles.sectionLead}>
                Одинаково для всех ролей: кто видит заявку, когда уходят деньги и что происходит при споре.
              </p>
              <div className={styles.rulesGrid}>
                {HOW_IT_WORKS_RULES.map((rule) => (
                  <article key={rule.title} className={styles.ruleCard}>
                    <h3 className={styles.ruleTitle}>{rule.title}</h3>
                    <p className={styles.ruleText}>{rule.text}</p>
                  </article>
                ))}
              </div>
            </section>

            <section id="capabilities" className={styles.section}>
              <h2 className={styles.sectionTitle}>Возможности сервиса</h2>
              <p className={styles.sectionLead}>
                То, что уже собрано в одном контуре: поиск, сделка, оплата, бронь и документы.
              </p>
              <div className={styles.capabilitiesGrid}>
                {HOW_IT_WORKS_CAPABILITIES.map((item) => (
                  <article key={item.title} className={styles.capabilityCard}>
                    <h3 className={styles.capabilityTitle}>{item.title}</h3>
                    <p className={styles.capabilityText}>{item.text}</p>
                  </article>
                ))}
              </div>
            </section>

            <section id="faq" className={styles.section}>
              <h2 className={styles.sectionTitle}>Частые вопросы</h2>
              <p className={styles.sectionLead}>
                Полнее, чем на главной: форматы заказа, бронь, выплата, спор и регистрация.
              </p>
              <div className={styles.faqList}>
                {HOW_IT_WORKS_FAQ.map((item, index) => (
                  <details key={item.title} className={styles.faqItem} open={index === 0}>
                    <summary className={styles.faqSummary}>
                      <span>{item.title}</span>
                      <ChevronDown className={styles.faqIcon} aria-hidden="true" />
                    </summary>
                    <div className={styles.faqContent}>{item.content}</div>
                  </details>
                ))}
              </div>
            </section>

            <section id="contact" className={`${styles.section} ${styles.contactCard}`}>
              <h2 className={styles.sectionTitle}>Связаться с менеджером</h2>
              <p className={styles.sectionLead}>
                Вопрос по работе сервиса или спор по сделке до выплаты. Ответ придёт на email.
              </p>
              <HowItWorksContactForm />
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
