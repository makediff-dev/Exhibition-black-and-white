"use client";

import Link from "next/link";
import { Fragment, useCallback, useEffect, useMemo, useState, type CSSProperties, type FormEvent, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Check } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { useCabinetSession } from "@/lib/hooks/use-cabinet-session";
import { addCompanyHref, registerHref } from "@/lib/auth/session";
import styles from "./how-it-works-figma.module.css";

const roles = [
  {
    id: "customer",
    label: "Заказчик",
    title: "Заказчикам",
    description: "Экспонентам и компаниям, которым нужен стенд, услуги к мероприятию или место на выставке.",
    image: "/how-it-works/role-detail-customer-exact.svg",
    cardImage: "/how-it-works/role-card-customer.svg",
    cardArrow: "/how-it-works/role-card-customer-arrow.svg",
    flat: "/how-it-works/role-tab-customer-exact.svg",
    color: "#28b5b3",
    linkColor: "#1a7d7b",
    softColor: "#eaf8f7",
    steps: ["Зарегистрируйте компанию и подключите ЭДО.", "Разместите заказ через конструктор или добавьте готовые услуги из каталога в корзину.", "Сравните отклики исполнителей в таблице: цена, срок, условия, рейтинг.", "Выберите исполнителя — заказ станет сделкой с этапами.", "Оплатите счёт этапа — после оплаты исполнитель начинает работу.", "Примите этапы, подпишите акты и УПД в ЭДО и оставьте отзыв."],
    partners: [
      ["Исполнители", "Заказ в одном из трёх форматов или услуга из каталога"],
      ["Организатор мероприятия", "Аренда площади под стенд и услуги организатора"],
      ["Площадка", "Услуги площадки: пропуска, аккредитация, электричество"],
    ],
    sections: ["Заказы", "Корзина", "Отклики", "Проекты", "Оплаты", "Документы", "Проверки исполнителей", "Избранное", "Отзывы", "Сотрудники"],
    secondaryLabel: "Смотреть исполнителей",
    secondaryHref: "/contractors",
  },
  {
    id: "contractor",
    label: "Исполнитель",
    title: "Исполнителям",
    description: "Застройщикам стендов и подрядчикам выставочных услуг.",
    image: "/how-it-works/role-detail-contractor-exact.svg",
    cardImage: "/how-it-works/role-card-contractor.svg",
    cardArrow: "/how-it-works/role-card-contractor-arrow.svg",
    flat: "/how-it-works/role-tab-contractor-exact.svg",
    color: "#0aaee4",
    linkColor: "#0a7ba3",
    softColor: "#e7f7fc",
    steps: ["Зарегистрируйте компанию и подключите ЭДО.", "Заполните профиль: услуги с ценами, портфолио, города и производственные мощности.", "Откликайтесь на заказы из ленты по вашим категориям и городам: цена, срок, условия.", "Заказчик выбрал вас — заказ стал сделкой с этапами.", "Начинайте этап после оплаты его счёта и передавайте результат в сделке.", "Банк перечисляет вашу долю в момент оплаты счёта, документы приходят в ЭДО."],
    partners: [
      ["Заказчики", "Отклики на заказы и продажа услуг из каталога"],
      ["Организаторы", "Заказы на застройку и услуги к мероприятию, услуги организатора для застройщиков"],
      ["Площадки", "Услуги для монтажа: пропуска, электричество, аренда техники"],
      ["Другие исполнители", "Наём подрядчиков и соисполнителей: разместите заказ или купите их услуги в каталоге"],
    ],
    sections: ["Профиль", "Услуги", "Портфолио", "Доступные заказы", "Отклики", "Проекты", "График работ", "Выплаты", "Мои заказы", "Корзина", "Оплаты", "Документы", "Отзывы"],
    secondaryLabel: "Смотреть заказы",
    secondaryHref: "/requests",
  },
  {
    id: "organizer",
    label: "Организатор",
    title: "Организаторам",
    description: "Организаторам выставок, форумов и конференций.",
    image: "/how-it-works/role-detail-organizer-exact.svg",
    cardImage: "/how-it-works/role-card-organizer.svg",
    cardArrow: "/how-it-works/role-card-organizer-arrow.svg",
    flat: "/how-it-works/role-tab-organizer-exact.svg",
    color: "#2939eb",
    linkColor: "#2939eb",
    softColor: "#eaebfd",
    steps: ["Зарегистрируйте компанию и подключите ЭДО.", "Создайте мероприятие или заберите своё из каталога — он наполнен заранее.", "Найдите площадку: свободные даты, залы и планировки — и отправьте запрос брони.", "Площадка подтверждает бронь — сервис создаёт заказ и счёт.", "Нарежьте площадь на лоты и продавайте места и услуги экспонентам.", "Ведите входящие заказы экспонентов и исходящие — площадке и подрядчикам."],
    partners: [
      ["Площадка", "Аренда зала: бронь на монтаж, проведение и демонтаж"],
      ["Экспоненты", "Продажа площади под стенды и услуг организатора"],
      ["Исполнители", "Заказы на застройку и выставочные услуги, услуги организатора для застройщиков"],
    ],
    sections: ["Мероприятия", "Аренда площадки", "Забрать мероприятие", "Заказы", "Оплаты", "Документы"],
    secondaryLabel: "Смотреть площадки",
    secondaryHref: "/venues",
  },
  {
    id: "venue",
    label: "Площадка",
    title: "Площадкам",
    description: "Выставочным центрам, павильонам и залам.",
    image: "/how-it-works/role-detail-venue-exact.svg",
    cardImage: "/how-it-works/role-card-venue.svg",
    cardArrow: "/how-it-works/role-card-venue-arrow.svg",
    flat: "/how-it-works/role-tab-venue-exact.svg",
    color: "#683bd9",
    linkColor: "#683bd9",
    softColor: "#f0ebfb",
    steps: ["Зарегистрируйте компанию и подключите ЭДО.", "Добавьте залы с характеристиками, PDF-планировки, лоты и календарь занятости.", "Получайте запросы брони от организаторов — подтверждайте или отклоняйте с причиной.", "После подтверждения сервис создаёт заказ и счёт организатору.", "Принимайте заказы услуг площадки: пропуска, аккредитация, аренда техники, электричество.", "Следите за оплатами и начислениями, документы приходят в ЭДО."],
    partners: [
      ["Организаторы", "Аренда залов и площади на период мероприятия"],
      ["Экспоненты и застройщики", "Заказ услуг площадки"],
      ["Исполнители", "Наём подрядчиков для своих задач: разместите заказ или купите их услуги в каталоге"],
    ],
    sections: ["Залы", "Свободные площади", "Планировки и лоты", "Мероприятия", "Услуги площадки", "Бронирования", "Заказы", "Оплаты", "Документы"],
    secondaryLabel: "Смотреть мероприятия",
    secondaryHref: "/events",
  },
] as const;

const navigation = [
  ["overview", "Коротко о сервисе"],
  ["registration", "Регистрация и допуск"],
  ["roles", "Работа по ролям"],
  ["order", "Как разместить заказ"],
  ["responses", "Отклики и сделка"],
  ["payment", "Оплата"],
  ["documents", "Документы и ЭДО"],
  ["trust", "Проверка и рейтинг"],
  ["disputes", "Если что-то пошло не так"],
  ["faq", "Частые вопросы"],
  ["contact", "Связаться с менеджером"],
] as const;

const approvalRows = [
  ["Аккаунт создан, компании нет", "Публичные разделы, личный профиль, «Добавить компанию»"],
  ["ИНН указан, заявление не подписано", "Черновик компании со статусом «Ожидает подписи»"],
  ["Заявление подписано, идёт модерация", "Профиль компании и документы в ЭДО"],
  ["Компания одобрена, ЭДО подключён", "Полный кабинет роли"],
  ["Подпись или ЭДО отозваны", "Профиль и повторное подтверждение. Новые сделки и выплаты — после восстановления"],
] as const;

const faqs = [
  ["general", "Чем сервис лучше привычных способов поиска?", "Исполнителей не нужно искать по сайтам застройщиков, спискам организаторов и тендерам: компании с рейтингом, отзывами и проверкой собраны в одном каталоге. Один заказ уходит всем подходящим исполнителям, отклики сравниваются в таблице. Договор, один счёт и закрывающие документы в ЭДО — внутри сделки."],
  ["general", "Почему стоит зарегистрироваться сейчас?", "Ранний доступ к заказам, исполнителям и мероприятиям. Вы одними из первых начнёте вести сделки и документы в сервисе."],
  ["general", "Преимущества для заказчиков", "Размещение заказов, сравнение предложений, один счёт и управление документами в одном месте."],
  ["general", "Преимущества сервиса для исполнителей", "Заказы по вашим категориям и городам, отклики, управление проектами и выплата в момент оплаты счёта."],
  ["general", "Как работает система рейтингов?", "Рейтинг складывается из оценок в отзывах. Отзыв можно оставить только после завершения сделки, поэтому оценки ставят компании, которые действительно работали с исполнителем."],
  ["registration", "Как зарегистрироваться?", "Создайте личный аккаунт, добавьте компанию по ИНН и выберите роль. Затем руководитель или сотрудник с доверенностью подписывает заявление в ЭДО, и компания проходит модерацию."],
  ["registration", "Зачем подписывать заявление в ЭДО?", "Подпись руководителя или сотрудника с доверенностью подтверждает, что вы вправе действовать от имени компании. Без неё никто не сможет зарегистрировать чужой ИНН и получить доступ к кабинету."],
  ["registration", "Нужно ли подключать ЭДО?", "Да. Без ЭДО компания не может публиковать заказы, откликаться, вести сделки и получать выплаты."],
  ["registration", "Можно ли вести несколько компаний в одном аккаунте?", "Да. Добавьте компанию в настройках или в списке компаний в шапке и пройдите подтверждение для неё. Между кабинетами компаний переключайтесь в шапке."],
  ["registration", "Как пригласить сотрудников?", "Администратор компании приглашает сотрудников в настройках и выдаёт доступ к разделам. Сотрудник регистрирует личный аккаунт и подтверждает полномочия через ЭДО."],
  ["orders", "Какие форматы заказов есть?", "Открытый запрос — заказ видят все подходящие исполнители, принимаются первые 10 откликов. Закрытый запрос — только приглашённые, не больше 5 исполнителей. Срочная сделка — короткая форма и быстрый подбор."],
  ["orders", "Чем заказ отличается от услуги из каталога?", "В заказе вы описываете задачу, и исполнители присылают предложения. Услуга из каталога — готовое предложение с ценой: добавляете её в корзину и оформляете сделку."],
  ["orders", "Как сравнить отклики?", "Выберите два отклика или больше — сервис покажет их в одной таблице: цена, срок, условия, подход, рейтинг и срок действия предложения."],
  ["orders", "Видит ли гость контакты заказчика?", "Нет. Гость видит заказ без контактов заказчика. Откликнуться можно после регистрации компании и подключения ЭДО."],
  ["payment", "Как проходит оплата?", "Сервис выставляет один счёт на этап или на всю сделку. Вы оплачиваете его, а банк сам перечисляет сумму исполнителю и комиссию сервису."],
  ["payment", "Когда исполнитель получает деньги?", "В момент оплаты счёта: банк сразу распределяет платёж, и начисление появляется в разделе «Выплаты» кабинета исполнителя."],
  ["payment", "Что делать, если работа выполнена некачественно?", "Оставьте замечания к этапу — он вернётся в работу. Если договориться не получится, откройте спор в сделке: решение примет администрация сервиса."],
  ["documents", "Какие документы формирует сервис?", "Договор, счёт, акт и УПД. Они привязаны к сделке и уходят на подпись в ваш ЭДО."],
  ["documents", "Где найти закрывающие документы?", "В разделе «Документы» кабинета и во вкладке «Документы» сделки. Если документа не хватает, отправьте контрагенту запрос закрывающих через ЭДО."],
  ["organizers", "Как организатору забрать своё мероприятие из каталога?", "Найдите выставку в разделе «Забрать мероприятие» кабинета и нажмите «Это моё мероприятие». Администрация сверит компанию и передаст карточку вам — после этого её можно редактировать."],
  ["organizers", "Как арендовать зал?", "Выберите площадку в каталоге, посмотрите свободные даты, залы и планировки и отправьте запрос брони на монтаж, проведение и демонтаж. После подтверждения сервис создаст заказ и счёт."],
  ["organizers", "Как площадке принимать брони?", "Заполните залы, планировки и календарь занятости — тогда организаторы увидят свободные даты. Запросы приходят в раздел «Бронирования», где их можно подтвердить или отклонить с причиной."],
] as const;

const faqCategories = [
  ["general", "Общие"],
  ["registration", "Регистрация и ЭДО"],
  ["orders", "Заказы и отклики"],
  ["payment", "Оплата и споры"],
  ["documents", "Документы"],
  ["organizers", "Организаторам и площадкам"],
] as const;

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <header className={styles.sectionHeader}>
      {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
      <div className={styles.sectionHeading}>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
    </header>
  );
}

function SemanticStatus({
  children,
  tone,
}: {
  children: ReactNode;
  tone: "done" | "waiting" | "problem" | "work";
}) {
  const toneClass = {
    done: styles.semanticStatusDone,
    waiting: styles.semanticStatusWaiting,
    problem: styles.semanticStatusProblem,
    work: styles.semanticStatusWork,
  }[tone];

  return <span className={`${styles.semanticStatus} ${toneClass}`}>{children}</span>;
}

function FaqItem({
  answer,
  initialOpen,
  question,
}: {
  answer: string;
  initialOpen: boolean;
  question: string;
}) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  return (
    <details
      className={styles.faqItem}
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
      open={isOpen}
    >
      <summary>
        {question}
        <span className={styles.faqAssetIcons}>
          <img className={styles.faqIconDown} src="/how-it-works/faq-chevron-down-rule-exact.svg" alt="" width={20} height={20} />
          <img className={styles.faqIconUp} src="/how-it-works/faq-chevron-up-rule-exact.svg" alt="" width={20} height={20} />
        </span>
      </summary>
      <p>{answer}</p>
    </details>
  );
}

function NumberedList({ items }: { items: readonly string[] }) {
  return (
    <ol className={styles.numberedList}>
      {items.map((item, index) => (
        <li key={item}>
          <span>{index + 1}</span>
          <p>{item}</p>
        </li>
      ))}
    </ol>
  );
}

function isValidContact(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.includes("@")) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  }
  return trimmed.replace(/\D/g, "").length >= 10;
}

function ManagerContactForm({
  modal = false,
  initialTopic = "",
  onSubmit,
}: {
  modal?: boolean;
  initialTopic?: string;
  onSubmit?: () => void;
}) {
  const { hydrated, inCabinet, user } = useCabinetSession();
  const profileDefaults = {
    name: user?.displayName?.trim() || user?.director?.trim() || "",
    company: user?.name?.trim() || "",
    contact: user?.phone?.trim() || "",
  };
  const [profileSeed, setProfileSeed] = useState(inCabinet ? user?.id ?? "guest" : "guest");
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [name, setName] = useState(inCabinet ? profileDefaults.name : "");
  const [company, setCompany] = useState(inCabinet ? profileDefaults.company : "");
  const [contact, setContact] = useState(inCabinet ? profileDefaults.contact : "");
  const [message, setMessage] = useState("");
  const [topic, setTopic] = useState(initialTopic);
  const [topicOpen, setTopicOpen] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);
  const [topicSheetMounted, setTopicSheetMounted] = useState(false);
  const [mobileTopicSheet, setMobileTopicSheet] = useState(false);

  useEffect(() => {
    setTopicSheetMounted(true);
    const media = window.matchMedia("(max-width: 1180px)");
    const apply = () => setMobileTopicSheet(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!topicOpen || !mobileTopicSheet) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      setTopicOpen(false);
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [mobileTopicSheet, topicOpen]);

  const nextProfileSeed = hydrated ? (inCabinet ? user?.id ?? "cabinet" : "guest") : profileSeed;
  if (nextProfileSeed !== profileSeed) {
    setProfileSeed(nextProfileSeed);
    setName(inCabinet ? profileDefaults.name : "");
    setCompany(inCabinet ? profileDefaults.company : "");
    setContact(inCabinet ? profileDefaults.contact : "");
  }
  const topicOptions = [
    ["registration", "Регистрация и ЭДО"],
    ["orders", "Заказы и отклики"],
    ["payment", "Оплата"],
    ["documents", "Документы"],
    ["dispute", "Спор по сделке"],
    ["other", "Другое"],
  ] as const;
  const errorMessages: Record<string, string> = {
    name: "Заполните поле",
    contact: "Проверьте почту или телефон",
    topic: "Выберите тему",
    message: "Напишите, с чем помочь",
    consent: "Нужно согласие, чтобы отправить сообщение",
  };

  const setFieldError = (field: string, invalid: boolean) => {
    setErrors((current) => {
      if (invalid) return { ...current, [field]: errorMessages[field] };
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const resetForm = () => {
    setSent(false);
    setErrors({});
    setName(inCabinet ? profileDefaults.name : "");
    setCompany(inCabinet ? profileDefaults.company : "");
    setContact(inCabinet ? profileDefaults.contact : "");
    setMessage("");
    setTopic(initialTopic);
    setTopicOpen(false);
    setConsentChecked(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!name.trim()) nextErrors.name = errorMessages.name;
    if (!isValidContact(contact)) nextErrors.contact = errorMessages.contact;
    if (!topic) nextErrors.topic = errorMessages.topic;
    if (!message.trim()) nextErrors.message = errorMessages.message;
    if (!consentChecked) nextErrors.consent = errorMessages.consent;

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSent(true);
    onSubmit?.();
  };

  const error = (field: string) =>
    errors[field] ? (
      <span className={styles.contactFieldError}>
        <img src="/how-it-works/contact-alert-exact.svg" alt="" width={14} height={14} />
        <span>{errors[field]}</span>
      </span>
    ) : null;

  if (sent) {
    return (
      <div className={`${styles.contactForm} ${styles.contactSuccess} ${modal ? styles.contactModalForm : ""}`}>
        <img src="/how-it-works/contact-sent.svg" alt="" width={40} height={40} />
        <strong>Сообщение отправлено</strong>
        <p>Ответим на почту или телефон, который вы указали.</p>
        <button className={styles.contactSuccessAgain} onClick={resetForm} type="button">
          Написать ещё
        </button>
      </div>
    );
  }

  return (
    <form
      className={`${styles.contactForm} ${modal ? styles.contactModalForm : ""}`}
      noValidate
      onSubmit={handleSubmit}
    >
      <label className={errors.name ? styles.contactInvalid : undefined}>
        Имя
        <input
          aria-invalid={Boolean(errors.name)}
          name="name"
          onBlur={(event) => setFieldError("name", !event.currentTarget.value.trim())}
          onChange={(event) => {
            setName(event.currentTarget.value);
            if (event.currentTarget.value.trim()) setFieldError("name", false);
          }}
          placeholder="Как к вам обращаться"
          required
          value={name}
        />
        {error("name")}
      </label>
      <label>
        <span className={styles.optionalLabel}>Компания или ИНН <small>необязательно</small></span>
        <input
          name="company"
          onChange={(event) => setCompany(event.currentTarget.value)}
          placeholder="Если уже регистрировались"
          value={company}
        />
      </label>
      <label className={`${styles.contactWide} ${errors.contact ? styles.contactInvalid : ""}`}>
        Почта или телефон
        <input
          aria-invalid={Boolean(errors.contact)}
          name="contact"
          onBlur={(event) => setFieldError("contact", !isValidContact(event.currentTarget.value))}
          onChange={(event) => {
            setContact(event.currentTarget.value);
            if (isValidContact(event.currentTarget.value)) setFieldError("contact", false);
          }}
          placeholder="Для ответа"
          required
          value={contact}
        />
        {error("contact")}
      </label>
      <div
        className={`${styles.contactField} ${styles.contactWide} ${errors.topic ? styles.contactInvalid : ""}`}
        onBlur={(event) => {
          if (mobileTopicSheet) return;
          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setTopicOpen(false);
            setFieldError("topic", !topic);
          }
        }}
      >
        <span id={`contact-topic-label-${modal ? "modal" : "page"}`}>Тема</span>
        <div className={styles.topicSelect}>
          <input name="topic" type="hidden" value={topic} />
          <button
            aria-controls={`contact-topic-options-${modal ? "modal" : "page"}`}
            aria-expanded={topicOpen}
            aria-haspopup="listbox"
            aria-invalid={Boolean(errors.topic)}
            aria-labelledby={`contact-topic-label-${modal ? "modal" : "page"}`}
            className={`${styles.topicSelectTrigger} ${topicOpen ? styles.topicSelectOpen : ""}`}
            onClick={() => setTopicOpen((current) => !current)}
            role="combobox"
            type="button"
          >
            <span className={topic ? undefined : styles.topicPlaceholder}>
              {topicOptions.find(([value]) => value === topic)?.[1] ?? "Выберите тему"}
            </span>
            <img
              aria-hidden="true"
              className={topicOpen ? styles.topicChevronOpen : undefined}
              src="/how-it-works/contact-chevron.svg"
              alt=""
              width={20}
              height={20}
            />
          </button>
          {topicOpen && !mobileTopicSheet ? (
            <div
              className={styles.topicOptions}
              id={`contact-topic-options-${modal ? "modal" : "page"}`}
              role="listbox"
            >
              {topicOptions.map(([value, label]) => (
                <button
                  aria-selected={topic === value}
                  className={topic === value ? styles.topicOptionSelected : undefined}
                  key={value}
                  onClick={() => {
                    setTopic(value);
                    setTopicOpen(false);
                    setFieldError("topic", false);
                  }}
                  role="option"
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          ) : null}
          {topicSheetMounted && topicOpen && mobileTopicSheet
            ? createPortal(
                <div className={styles.topicSheetLayer}>
                  <button
                    aria-label="Закрыть список тем"
                    className={styles.topicSheetBackdrop}
                    onClick={() => setTopicOpen(false)}
                    type="button"
                  />
                  <div
                    aria-labelledby={`contact-topic-sheet-title-${modal ? "modal" : "page"}`}
                    className={styles.topicSheet}
                    id={`contact-topic-options-${modal ? "modal" : "page"}`}
                    role="dialog"
                  >
                    <div className={styles.topicSheetHandle} />
                    <div className={styles.topicSheetHead}>
                      <p id={`contact-topic-sheet-title-${modal ? "modal" : "page"}`}>Тема</p>
                      <button
                        aria-label="Закрыть"
                        className={styles.topicSheetClose}
                        onClick={() => setTopicOpen(false)}
                        type="button"
                      >
                        <img src="/how-it-works/mobile-toc-close.svg" alt="" width={24} height={24} />
                      </button>
                    </div>
                    <div className={styles.topicSheetList} role="listbox">
                      {topicOptions.map(([value, label]) => {
                        const selected = topic === value;
                        return (
                          <button
                            aria-selected={selected}
                            className={selected ? styles.topicSheetOptionSelected : styles.topicSheetOption}
                            key={value}
                            onClick={() => {
                              setTopic(value);
                              setTopicOpen(false);
                              setFieldError("topic", false);
                            }}
                            role="option"
                            type="button"
                          >
                            <span>{label}</span>
                            {selected ? (
                              <img src="/how-it-works/topic-sheet-check.svg" alt="" width={20} height={20} />
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>,
                document.body,
              )
            : null}
        </div>
        {topic === "dispute" ? (
          <p className={styles.topicHint}>
            Если спор по конкретной сделке, откройте его в самой сделке — менеджер сразу
            увидит переписку, этапы и счета.
          </p>
        ) : null}
        {error("topic")}
      </div>
      <label className={`${styles.contactWide} ${errors.message ? styles.contactInvalid : ""}`}>
        Сообщение
        <textarea
          aria-invalid={Boolean(errors.message)}
          name="message"
          onBlur={(event) => setFieldError("message", !event.currentTarget.value.trim())}
          onChange={(event) => {
            setMessage(event.currentTarget.value);
            if (event.currentTarget.value.trim()) setFieldError("message", false);
          }}
          placeholder="Опишите вопрос"
          required
          value={message}
        />
        {error("message")}
      </label>
      <div
        className={`${styles.consent} ${styles.contactWide} ${consentChecked ? styles.consentChecked : ""} ${errors.consent ? styles.contactInvalid : ""}`}
      >
        <label className={styles.consentRow}>
          <input
            aria-invalid={Boolean(errors.consent)}
            checked={consentChecked}
            name="consent"
            onBlur={(event) => setFieldError("consent", !event.currentTarget.checked)}
            onChange={(event) => {
              setConsentChecked(event.currentTarget.checked);
              setFieldError("consent", !event.currentTarget.checked);
            }}
            type="checkbox"
            required
          />
          <span>
            Согласен на обработку <Link href="/legal/privacy">персональных данных</Link>
          </span>
        </label>
        {errors.consent ? (
          <span className={styles.consentError}>
            <img src="/how-it-works/contact-alert-exact.svg" alt="" width={14} height={14} />
            <span>{errors.consent}</span>
          </span>
        ) : null}
      </div>
      <button type="submit">Отправить</button>
    </form>
  );
}

export function HowItWorksFigmaPage() {
  const { inCabinet } = useCabinetSession();
  const [activeSection, setActiveSection] = useState("overview");
  const [activeRole, setActiveRole] = useState<(typeof roles)[number]["id"]>("customer");
  const [faqFilter, setFaqFilter] = useState("all");
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactModalTopic, setContactModalTopic] = useState("");
  const [contactModalNonce, setContactModalNonce] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sheetMounted, setSheetMounted] = useState(false);
  const activeNavLabel = navigation.find(([id]) => id === activeSection)?.[1] ?? "Коротко о сервисе";

  const openContactModal = (topic = "") => {
    setContactModalTopic(topic);
    setContactModalNonce((current) => current + 1);
    setContactModalOpen(true);
  };

  const stickyOffset = useCallback(() => {
    const compact = window.matchMedia("(max-width: 1180px)").matches;
    const headerHidden = document.documentElement.classList.contains("how-it-works-header-hidden");
    const phone = window.matchMedia("(max-width: 767px)").matches;
    const headerH = compact ? (headerHidden ? 0 : phone ? 56 : 62) : 0;
    const toc = document.querySelector<HTMLElement>(`.${styles.mobileTocTrigger}`);
    const tocH = compact ? toc?.offsetHeight ?? 60 : 0;
    return headerH + tocH;
  }, []);

  const scrollToPageSection = useCallback(
    (id: string) => {
      setActiveSection(id);
      setMobileNavOpen(false);
      if (typeof history.replaceState === "function") {
        history.replaceState(null, "", `#${id}`);
      }
      window.setTimeout(() => {
        const el = document.getElementById(id);
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY - stickyOffset() - 8;
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      }, 80);
    },
    [stickyOffset],
  );

  useEffect(() => {
    setSheetMounted(true);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(max-width: 1180px)");
    let lastY = window.scrollY;
    let hidden = false;

    const apply = (nextHidden: boolean) => {
      hidden = nextHidden;
      if (!media.matches) {
        root.classList.remove("how-it-works-header-hidden");
        root.style.removeProperty("--how-it-works-header-offset");
        return;
      }
      root.classList.toggle("how-it-works-header-hidden", hidden);
      const headerOffset = hidden ? "0px" : window.matchMedia("(max-width: 767px)").matches ? "56px" : "62px";
      root.style.setProperty("--how-it-works-header-offset", headerOffset);
    };

    const onScroll = () => {
      if (!media.matches) {
        apply(false);
        lastY = window.scrollY;
        return;
      }
      const y = window.scrollY;
      if (y < 8) apply(false);
      else if (y > lastY + 6 && y > 56) apply(true);
      else if (y < lastY - 6) apply(false);
      lastY = y;
    };

    apply(false);
    window.addEventListener("scroll", onScroll, { passive: true });
    media.addEventListener("change", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      media.removeEventListener("change", onScroll);
      root.classList.remove("how-it-works-header-hidden");
      root.style.removeProperty("--how-it-works-header-offset");
    };
  }, []);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const root = document.documentElement;
    root.classList.add("how-it-works-sheet-open");
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      root.classList.remove("how-it-works-sheet-open");
      window.removeEventListener("keydown", onKey);
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    const sections = navigation
      .map(([id]) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries
          .filter((item) => item.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (entry) setActiveSection(entry.target.id);
      },
      { rootMargin: "-18% 0px -70% 0px", threshold: [0, 0.25] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const currentRole = roles.find((role) => role.id === activeRole) ?? roles[0];
  const filteredFaq = useMemo(
    () => (faqFilter === "all" ? faqs : faqs.filter(([category]) => category === faqFilter)),
    [faqFilter],
  );

  return (
    <div className={styles.page}>
      <div className={styles.heroWrap}>
        <div className={styles.container}>
          <div className={styles.breadcrumbs}>
            <Link href="/">Главная</Link>
            <span>/</span>
            <span>Как работает сервис</span>
          </div>
          <div className={styles.heroCopy}>
            <h1>Как работает сервис</h1>
            <p>
              Здесь — понятная, короткая инструкция о том, как устроена платформа:
              быстро поймёте сервис. На этой странице вы найдёте путь каждой роли,
              правила оплаты и документов и ответы на частые вопросы.
            </p>
          </div>
          <p className={styles.roleCardsLabel}>Перейти к своей роли</p>
          <div className={styles.roleCards}>
            {roles.map((role) => (
              <button
                className={styles.roleCard}
                key={role.id}
                onClick={() => {
                  setActiveRole(role.id);
                  scrollToPageSection("roles");
                }}
                style={
                  {
                    "--role-color": role.color,
                    "--role-link-color": role.linkColor,
                  } as CSSProperties
                }
                type="button"
              >
                <span className={styles.roleCardTop}>
                  <span className={styles.roleCardHeader}>
                    <img src={role.cardImage} alt="" height={48} width={48} />
                    <strong>{role.title}</strong>
                  </span>
                  <small>{role.description}</small>
                </span>
                <span className={styles.roleCardLink}>
                  Порядок работы
                  <img src={role.cardArrow} alt="" width={14} height={14} />
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={`${styles.container} ${styles.contentLayout}`}>
        <div className={styles.mobileToc}>
          <button
            aria-expanded={mobileNavOpen}
            className={styles.mobileTocTrigger}
            onClick={() => setMobileNavOpen(true)}
            type="button"
          >
            <span>
              <small>На этой странице</small>
              <strong>{activeNavLabel}</strong>
            </span>
            <img src="/how-it-works/mobile-toc-chevron.svg" alt="" width={20} height={20} />
          </button>
          {sheetMounted && mobileNavOpen
            ? createPortal(
                <div className={styles.mobileTocLayer}>
                  <button
                    aria-label="Закрыть навигацию по странице"
                    className={styles.mobileTocBackdrop}
                    onClick={() => setMobileNavOpen(false)}
                    type="button"
                  />
                  <div
                    aria-labelledby="mobile-toc-sheet-title"
                    className={styles.mobileTocSheet}
                    role="dialog"
                  >
                    <div className={styles.mobileTocHandle} />
                    <div className={styles.mobileTocSheetHead}>
                      <p id="mobile-toc-sheet-title">На этой странице</p>
                      <button
                        aria-label="Закрыть"
                        className={styles.mobileTocClose}
                        onClick={() => setMobileNavOpen(false)}
                        type="button"
                      >
                        <img src="/how-it-works/mobile-toc-close.svg" alt="" width={24} height={24} />
                      </button>
                    </div>
                    <nav aria-label="Разделы страницы">
                      {navigation.map(([id, label]) => {
                        const isSectionActive = activeSection === id && id !== "roles";
                        const onSectionClick = (event: MouseEvent<HTMLAnchorElement>) => {
                          event.preventDefault();
                          scrollToPageSection(id);
                        };

                        return (
                          <Fragment key={id}>
                            <a
                              className={isSectionActive ? styles.mobileTocLinkActive : styles.mobileTocLink}
                              href={`#${id}`}
                              onClick={onSectionClick}
                            >
                              {label}
                            </a>
                            {id === "roles"
                              ? roles.map((role) => {
                                  const isRoleActive = activeSection === "roles" && activeRole === role.id;
                                  return (
                                    <a
                                      className={isRoleActive ? styles.mobileTocRoleActive : styles.mobileTocRole}
                                      href="#roles"
                                      key={role.id}
                                      onClick={(event) => {
                                        event.preventDefault();
                                        setActiveRole(role.id);
                                        scrollToPageSection("roles");
                                      }}
                                    >
                                      <img
                                        src={
                                          isRoleActive
                                            ? "/how-it-works/sidebar-rule-active-dot.svg"
                                            : `/how-it-works/sidebar-rule-${role.id}-dot.svg`
                                        }
                                        alt=""
                                        width={8}
                                        height={8}
                                      />
                                      <span>{role.title}</span>
                                    </a>
                                  );
                                })
                              : null}
                          </Fragment>
                        );
                      })}
                    </nav>
                    <div className={styles.mobileTocDivider} />
                    <button
                      className={styles.mobileTocManager}
                      onClick={() => {
                        setMobileNavOpen(false);
                        openContactModal();
                      }}
                      type="button"
                    >
                      Написать менеджеру
                      <img src="/how-it-works/mobile-toc-manager-arrow.svg" alt="" width={14} height={14} />
                    </button>
                  </div>
                </div>,
                document.body,
              )
            : null}
        </div>
        <aside className={styles.sideNav} aria-label="Навигация по странице">
          <div className={styles.sideNavGroup}>
            <strong>На этой странице</strong>
            <nav>
              {navigation.map(([id, label]) => (
                <Fragment key={id}>
                  <a
                    className={activeSection === id ? styles.sideLinkActive : styles.sideLink}
                    href={`#${id}`}
                    onClick={() => setActiveSection(id)}
                  >
                    <span>{label}</span>
                  </a>
                  {id === "roles" ? (
                    <div className={styles.roleNavLinks}>
                      {roles.map((role) => {
                        const isRoleActive = activeSection === "roles" && activeRole === role.id;

                        return (
                          <a
                            aria-current={isRoleActive ? "true" : undefined}
                            className={isRoleActive ? styles.roleNavLinkActive : styles.roleNavLink}
                            href="#roles"
                            key={role.id}
                            onClick={() => {
                              setActiveRole(role.id);
                              setActiveSection("roles");
                            }}
                            style={{ "--role-color": role.color } as CSSProperties}
                          >
                            <img
                              src={
                                isRoleActive
                                  ? "/how-it-works/sidebar-rule-active-dot.svg"
                                  : `/how-it-works/sidebar-rule-${role.id}-dot.svg`
                              }
                              alt=""
                              width={8}
                              height={8}
                            />
                            <span>{role.title}</span>
                          </a>
                        );
                      })}
                    </div>
                  ) : null}
                </Fragment>
              ))}
            </nav>
          </div>
          <div className={styles.sideHelp}>
            <strong>Остались вопросы?</strong>
            <p>Менеджер поможет с регистрацией, ЭДО, оплатой и спорными ситуациями.</p>
            <button type="button" onClick={() => openContactModal()}>
              Написать менеджеру
            </button>
          </div>
        </aside>

        <main className={styles.mainContent}>
          <section className={styles.section} id="overview">
            <SectionTitle
              eyebrow="Коротко о сервисе"
              title="Пять шагов от регистрации до закрывающих документов"
              description="Шаги одинаковые для заказа услуг и для аренды площадки. При аренде вместо заказа — запрос брони, вместо откликов — ответ площадки."
            />
            <div className={styles.serviceSteps}>
              {[
                ["Регистрация компании", "Личный аккаунт, компания по ИНН и подпись заявления в ЭДО. Затем модерация.", "Регистрация и допуск", "#registration"],
                ["Поиск или заказ", "Услуга из каталога в корзину, заказ исполнителям или запрос брони площадки.", "Как разместить заказ", "#order"],
                ["Отклики и выбор", "Исполнители присылают предложения, вы сравниваете их в таблице. Площадка подтверждает или отклоняет бронь.", "Отклики и сделка", "#responses"],
                ["Оплата одним счётом", "Вы оплачиваете счёт, банк сам делит платёж между исполнителем и сервисом.", "Оплата", "#payment"],
                ["Приёмка и документы", "Вы принимаете этапы работ, акты и УПД уходят в ваш ЭДО на подпись.", "Документы и ЭДО", "#documents"],
              ].map(([title, text, action, href], index) => (
                <div key={title}>
                  <span className={styles.stepIndex}>{index + 1}</span>
                  <span className={styles.stepCopy}><strong>{title}</strong><small>{text}</small></span>
                  <a href={href}>
                    {action}
                    <img src="/how-it-works/service-step-arrow-exact.svg" alt="" width={14} height={14} />
                  </a>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.section} id="registration">
            <SectionTitle
              eyebrow="Регистрация и доступ"
              title="Компанию регистрирует только тот, кто вправе её представлять"
              description="Сервис открывает компанию в ЭДО кабинете, а вам показывают инструменты, если сотрудник с доверенностью. Приглашённый человек не получает кабинет, даже если у компании есть права."
            />
            <div className={styles.registrationContent}>
              <div className={styles.registrationCards}>
                {[
                  ["Личный аккаунт", "ФИО, почта и телефон. Аккаунт ваш личный — к нему можно привязать несколько компаний."],
                  ["Компания и роль", "Введите ИНН — реквизиты подтянутся из ЕГРЮЛ или ЕГРИП. Выберите роль: заказчик, исполнитель, организатор или площадка."],
                  ["Подпись в ЭДО", "Подпишите заявление о присоединении квалифицированной электронной подписью у своего оператора ЭДО."],
                  ["Модерация", "Администрация сервиса проверяет компанию. После одобрения открывается кабинет роли."],
                ].map(([title, text], index) => (
                  <article key={title}>
                    <span>{index + 1}</span>
                    <div className={styles.registrationCardCopy}>
                      <h3>{title}</h3>
                      <p>{text}</p>
                    </div>
                  </article>
                ))}
              </div>
              <div className={styles.registrationSupport}>
                <div className={styles.registrationHint}>
                  <img
                    src="/how-it-works/registration-info-exact.svg"
                    alt=""
                    width={20}
                    height={20}
                  />
                  <p>
                    По вопросам настройки связи с другим оператором ЭДО, пожалуйста, напишите в{" "}
                    <button
                      className={styles.inlineContactLink}
                      onClick={() => openContactModal("registration")}
                      type="button"
                    >
                      техподдержку сервиса
                    </button>
                    .
                  </p>
                </div>
                <details className={styles.registrationDisclosure}>
                  <summary>
                    <span>Что доступно до одобрения компании</span>
                    <span className={styles.approvalChevrons} aria-hidden="true">
                      <img
                        className={styles.approvalChevronDown}
                        src="/how-it-works/approval-chevron-down-exact.svg"
                        alt=""
                        width={20}
                        height={20}
                      />
                      <img
                        className={styles.approvalChevronUp}
                        src="/how-it-works/approval-chevron-up-exact.svg"
                        alt=""
                        width={20}
                        height={20}
                      />
                    </span>
                  </summary>
                  <div className={styles.approvalTable}>
                    <div className={styles.approvalTableHeader}>
                      <span>Состояние компании</span>
                      <span>Что доступно</span>
                    </div>
                    {approvalRows.map(([status, available]) => (
                      <div className={styles.approvalTableRow} key={status}>
                        <strong>{status}</strong>
                        <span>{available}</span>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
              <div className={styles.registrationInfo}>
                <article>
                  <h3>Несколько компаний в одном аккаунте</h3>
                  <p>
                    Добавьте компанию в настройках или в списке компаний в шапке. У каждой — своя
                    роль, ЭДО, сделки и документы, а переключаться между кабинетами можно в шапке.
                  </p>
                </article>
                <article>
                  <h3>Сотрудники</h3>
                  <p>
                    Администратор компании приглашает сотрудников и выдаёт доступ к разделам.
                    Полномочия сотрудника тоже подтверждаются через ЭДО.
                  </p>
                </article>
              </div>
            </div>
          </section>

          <section className={styles.section} id="roles">
            <SectionTitle
              eyebrow="Работа по ролям"
              title="У каждой роли свой кабинет и свой порядок работы"
              description="Роль выбирается при регистрации компании, у каждой компании одна роль. Если вы ведёте несколько компаний, переключайтесь между их кабинетами в меню."
            />
            <div className={styles.roleTabs} role="tablist" aria-label="Роли">
              {roles.map((role) => (
                <button
                  aria-selected={activeRole === role.id}
                  className={activeRole === role.id ? styles.roleTabActive : styles.roleTab}
                  key={role.id}
                  onClick={() => setActiveRole(role.id)}
                  role="tab"
                  style={{ "--role-color": role.color } as CSSProperties}
                  type="button"
                >
                  <img
                    alt=""
                    className={styles.roleTabIcon}
                    height={20}
                    src={role.flat}
                    width={20}
                  />
                  {role.title}
                </button>
              ))}
            </div>
            <div
              className={styles.roleDetail}
              style={{
                "--role-color": currentRole.color,
                "--role-number-color": currentRole.linkColor,
                "--role-soft-color": currentRole.softColor,
              } as CSSProperties}
            >
              <header className={styles.roleDetailHeader}>
                <img src={currentRole.cardImage} alt="" height={48} width={48} />
                <div>
                  <h3>{currentRole.title}</h3>
                  <p>{currentRole.description}</p>
                </div>
              </header>

              <div className={styles.roleDetailBody}>
                <div className={styles.roleWorkflow}>
                  <h4>Как проходит работа</h4>
                  <ol>
                    {currentRole.steps.map((step, index) => (
                      <li key={step}>
                        <span>{index + 1}</span>
                        <p>{step}</p>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className={styles.rolePartners}>
                  <h4>С кем работаете</h4>
                  <div>
                    {currentRole.partners.map(([title, description]) => (
                      <article key={title}>
                        <h5>{title}</h5>
                        <p>{description}</p>
                      </article>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.roleCabinet}>
                <h4>Разделы кабинета</h4>
                <div>
                  {currentRole.sections.map((item) => <span key={item}>{item}</span>)}
                </div>
              </div>

              <div className={styles.roleButtons}>
                <Link
                  className={styles.rolePrimaryButton}
                  href={inCabinet ? addCompanyHref(currentRole.id) : registerHref(currentRole.id)}
                >
                  {inCabinet ? "Добавить компанию" : `Зарегистрироваться как ${currentRole.label.toLowerCase()}`}
                </Link>
                <Link className={styles.roleSecondaryButton} href={currentRole.secondaryHref}>
                  {currentRole.secondaryLabel}
                  <img src="/how-it-works/role-detail-arrow-exact.svg" alt="" width={14} height={14} />
                </Link>
              </div>
            </div>
          </section>

          <section className={styles.section} id="order">
            <SectionTitle
              eyebrow="Как разместить заказ"
              title="Заказать можно двумя способами: описать задачу или выбрать готовую услугу"
            />
            <div className={styles.orderMethods}>
              <article>
                <div className={styles.orderMethodTop}>
                  <h3>Заказ через конструктор</h3>
                  <p>
                    Вы описываете задачу — исполнители присылают предложения. Для стенда
                    конструктор открывает подробное техническое задание из девяти разделов,
                    для остальных услуг хватит свободной формы.
                  </p>
                  <div className={styles.tagList}>
                    {["Формат", "Категория", "Мероприятие", "Описание", "Сроки", "Бюджет", "Файлы", "Публикация"].map((tag, index) => (
                      <span key={tag}>
                        <b>{index + 1}</b>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <button type="button">Разместить заказ</button>
              </article>
              <article>
                <div className={styles.orderMethodTop}>
                  <h3>Услуга из каталога</h3>
                  <p>
                    Готовое предложение исполнителя с ценой: фиксированной, «от», за м², день
                    или смену. Добавьте услуги в корзину, привяжите к мероприятию или заказу
                    и оформите сделку со счётом.
                  </p>
                </div>
                <Link href="/services">
                  Перейти в каталог услуг
                  <img src="/how-it-works/order-catalog-arrow-exact.svg" alt="" width={14} height={14} />
                </Link>
              </article>
            </div>
            <h3 className={styles.subsectionTitle}>Три формата заказа</h3>
            <div className={styles.orderTypes}>
              {[
                {
                  image: "/how-it-works/order-open.svg",
                  title: "Открытый запрос",
                  fields: [
                    ["Кто видит", "Все подходящие исполнители"],
                    ["Сколько откликов", "Первые 10"],
                    ["Когда выбирать", "Нужен широкий выбор и сравнение цен"],
                  ],
                },
                {
                  image: "/how-it-works/order-closed.svg",
                  title: "Закрытый запрос",
                  fields: [
                    ["Кто видит", "Только приглашённые исполнители"],
                    ["Сколько откликов", "До 5 исполнителей"],
                    ["Когда выбирать", "У вас уже есть исполнители на примете"],
                  ],
                },
                {
                  image: "/how-it-works/order-urgent.svg",
                  title: "Срочная сделка",
                  fields: [
                    ["Кто видит", "До 10 подходящих исполнителей"],
                    ["Сколько откликов", "Первые 5"],
                    ["Когда выбирать", "Работы нужны срочно: форма короче, подбор быстрее"],
                  ],
                },
              ].map((format) => (
                <article key={format.title}>
                  <div className={styles.orderTypeHeader}>
                    <img src={format.image} alt="" height={48} width={48} />
                    <h3>{format.title}</h3>
                  </div>
                  {format.fields.map(([label, value]) => (
                    <div className={styles.orderTypeField} key={label}>
                      <span>{label}</span>
                      <p>{value}</p>
                    </div>
                  ))}
                </article>
              ))}
            </div>
            <p className={styles.sectionFootnote}>
              Формат виден на карточке заказа бейджем. Гость видит заказ без контактов заказчика — откликнуться можно после регистрации.
            </p>
          </section>

          <section className={styles.section} id="responses">
            <SectionTitle
              eyebrow="Отклики и сделка"
              title="После выбора исполнителя заказ становится сделкой с этапами"
            />
            <div className={styles.dealOverview}>
              <ul>
                {[
                  "Отклик — это цена, срок, условия, подход и срок действия предложения.",
                  "Когда откликов два или больше, их можно сравнить в одной таблице.",
                  "Выбор исполнителя создаёт сделку, остальные отклики отклоняются автоматически.",
                  "Сделку делят на этапы — у каждого своя сумма, срок и счёт.",
                  "Переписка привязана к заказу, сделке или брони — история не теряется.",
                ].map((rule) => (
                  <li key={rule}>
                    <span>
                      <img src="/how-it-works/deal-check-exact.svg" alt="" width={18} height={18} />
                    </span>
                    <p>{rule}</p>
                  </li>
                ))}
              </ul>
              <article className={styles.dealCard}>
                <header>
                  <span>Сделка СД-2026-014</span>
                  <h3>Стенд 36 м² на выставке «Мебель-2026»</h3>
                </header>
                <div className={styles.dealTable}>
                  <div className={styles.dealTableHead}>
                    <span>Этап</span><span>Сумма</span><span>Статус</span>
                  </div>
                  {[
                    ["1. Дизайн-проект", "85 000 ₽", "Принят", "done"],
                    ["2. Производство", "250 000 ₽", "В работе", "work"],
                    ["3. Монтаж", "185 000 ₽", "Ожидает оплаты", "waiting"],
                  ].map(([stage, sum, status, tone]) => (
                    <div className={styles.dealTableRow} key={stage}>
                      <div className={styles.dealStageCopy}>
                        <span>{stage}</span>
                        <b>{sum}</b>
                      </div>
                      <span className={styles.dealStageStatus}>
                        <SemanticStatus tone={tone as "done" | "waiting" | "work"}>
                          {status}
                        </SemanticStatus>
                      </span>
                    </div>
                  ))}
                </div>
                <small>Пример. Этап начинается после оплаты своего счёта.</small>
              </article>
            </div>
          </section>

          <section className={styles.section} id="payment">
            <SectionTitle
              eyebrow="Оплата"
              title="Оплата одним счётом"
              description="Платёж автоматически распределяется между всеми участниками сделки."
            />
            <div className={styles.paymentFlow}>
              <div>
                <h3>Сервис выставляет счёт</h3>
                <p>На этап или на всю сделку</p>
              </div>
              <span className={styles.paymentArrow}>
                <img src="/how-it-works/payment-arrow-exact.svg" alt="" width={20} height={20} />
              </span>
              <div>
                <h3>Заказчик оплачивает</h3>
                <p>Одним платежом</p>
              </div>
              <span className={styles.paymentArrow}>
                <img src="/how-it-works/payment-arrow-exact.svg" alt="" width={20} height={20} />
              </span>
              <div className={styles.paymentProtected}>
                <h3>Банк делит платёж</h3>
                <p>Автоматически, в момент оплаты</p>
              </div>
              <span className={styles.paymentArrow}>
                <img src="/how-it-works/payment-arrow-exact.svg" alt="" width={20} height={20} />
              </span>
              <div className={styles.paymentReceivers}>
                <span><b>Исполнителю</b><small>Сумма по этапу</small></span>
                <span><b>Сервису</b><small>Комиссия</small></span>
              </div>
            </div>
            <ul className={styles.paymentFacts}>
              <li><Check size={17} /> В счёте видна сумма исполнителю и комиссия сервиса.</li>
              <li><Check size={17} /> Этап не начинается, пока его счёт не оплачен.</li>
              <li><Check size={17} /> Ставка комиссии фиксируется в момент выставления счёта — её изменение на выставленный счёт не влияет.</li>
              <li><Check size={17} /> Исполнитель видит начисления и статус выплаты в разделе «Выплаты».</li>
            </ul>
          </section>

          <section className={styles.section} id="documents">
            <SectionTitle
              eyebrow="Документы и ЭДО"
              title="Договор, счёт, акт и УПД формируются автоматически"
              description="Документы привязаны к сделке и хранятся не менее чем на 3 года. Подписываются в сервисе оператора."
            />
            <div className={styles.documentGrid}>
              {[
                ["Договор", "Условия сделки и этапы"],
                ["Счёт", "На этап или на всю сделку"],
                ["Акт", "Приёмка выполненного этапа"],
                ["УПД", "Универсальный передаточный документ"],
              ].map(([title, text]) => (
                <article key={title}>
                  <span>
                    <img src="/how-it-works/documents-file-exact.svg" alt="" width={20} height={20} />
                  </span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
            <div className={styles.documentStatuses}>
              <span>Статусы документа:</span>
              <SemanticStatus tone="work">Черновик</SemanticStatus>
              <img src="/how-it-works/documents-arrow-exact.svg" alt="" width={14} height={14} />
              <SemanticStatus tone="work">Отправлен</SemanticStatus>
              <img src="/how-it-works/documents-arrow-exact.svg" alt="" width={14} height={14} />
              <SemanticStatus tone="waiting">На подписи</SemanticStatus>
              <img src="/how-it-works/documents-arrow-exact.svg" alt="" width={14} height={14} />
              <SemanticStatus tone="done">Подписан</SemanticStatus>
              <span>или</span>
              <SemanticStatus tone="problem">Отклонён</SemanticStatus>
            </div>
            <div className={styles.infoBanner}>
              <img src="/how-it-works/documents-info-exact.svg" alt="" width={20} height={20} />
              <p>Чтобы подключить ЭДО, откройте в кабинете компании раздел «ЭДО», укажите идентификатор участника и нажмите «Проверить и подключить».</p>
            </div>
          </section>

          <section className={styles.section} id="trust">
            <SectionTitle
              eyebrow="Проверка и рейтинг"
              title="Исполнителя можно проверить до сделки, а рейтинг складывается из отзывов по сделкам"
            />
            <div className={styles.trustGrid}>
              <div className={styles.trustInfoCard}>
                <h3>Проверка контрагента</h3>
                <p>Отчёт о компании: реквизиты, признаки риска, арбитражные дела. Проверку можно заказать из карточки исполнителя или отклика, расширенная проверка — платная.</p>
              </div>
              <div className={styles.trustInfoCard}>
                <h3>Отзывы и рейтинг</h3>
                <p>Отзыв можно оставить только после завершения сделки. Рейтинг и число отзывов видны в каталоге и в откликах.</p>
                <b className={styles.ratingChip}>
                  <img src="/how-it-works/trust-star-exact.svg" alt="" width={16} height={16} />
                  4,8 · 42 отзыва
                </b>
              </div>
            </div>
            <div className={styles.trustBadgesCard}>
              <h3>Отметки в каталоге</h3>
              <p>По отметкам можно отфильтровать исполнителей в каталоге.</p>
              <div className={styles.badges}>
                {[
                  ["/how-it-works/trust-verified-exact.svg", "Проверенный"],
                  ["/how-it-works/trust-production-exact.svg", "Своё производство"],
                  ["/how-it-works/trust-xy-exact.svg", "Проверен XY"],
                  ["/how-it-works/trust-registry-exact.svg", "Проверен по открытым реестрам"],
                  ["/how-it-works/trust-urgent-exact.svg", "Срочный заказ"],
                ].map(([image, title]) => (
                  <div key={title}>
                    <img src={image} alt="" height={28} width={28} />
                    <span>{title}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className={styles.section} id="disputes">
            <SectionTitle
              eyebrow="Если что-то пошло не так"
              title="Замечания, спор и возврат идут по правилам сделки"
            />
            <div className={styles.issueSteps}>
              {[
                ["Замечания к этапу", "Заказчик возвращает этап в работу с комментарием. Исполнитель исправляет и снова передаёт результат."],
                ["Спор", "Если договориться не получилось, откройте спор в сделке. Его рассматривает администрация сервиса и фиксирует решение: выплата исполнителю, возврат заказчику или другой исход."],
                ["Возврат денег", "Если банк уже распределил платёж, возврат проводится отдельной банковской операцией."],
              ].map(([title, text], index) => (
                <article key={title}>
                  <span>{index + 1}</span>
                  <div><h3>{title}</h3><p>{text}</p></div>
                </article>
              ))}
            </div>
            <div className={styles.issueHelp}>
              <p>Сомневаетесь, нужен ли спор? Напишите менеджеру — подскажем, что делать.</p>
              <button type="button" onClick={() => openContactModal("dispute")}>
                Написать менеджеру
              </button>
            </div>
          </section>

          <section className={styles.section} id="faq">
            <SectionTitle
              eyebrow="Частые вопросы"
              title="Вопросы и ответы"
            />
            <div className={styles.faqFilters}>
              {[["all", "Все"] as const, ...faqCategories].map(([id, label]) => (
                <button
                  className={faqFilter === id ? styles.faqFilterActive : styles.faqFilter}
                  key={id}
                  onClick={() => setFaqFilter(id)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
            <div className={styles.faqGroups}>
              {faqCategories
                .filter(([category]) => faqFilter === "all" || faqFilter === category)
                .map(([category, label], categoryIndex) => (
                  <div className={styles.faqGroup} key={category}>
                    <h3>{label}</h3>
                    <div className={styles.faqList}>
                      {filteredFaq
                        .filter(([itemCategory]) => itemCategory === category)
                        .map(([, question, answer], itemIndex) => (
                          <FaqItem
                            answer={answer}
                            initialOpen={categoryIndex === 0 && itemIndex === 0}
                            key={`${faqFilter}-${question}`}
                            question={question}
                          />
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          </section>

          <section className={styles.section} id="contact">
            <SectionTitle
              eyebrow="Связаться с менеджером"
              title="Не нашли ответ — напишите менеджеру"
            />
            <div className={styles.contactSection}>
            <div>
              <p className={styles.contactLead}>
                Поможем с регистрацией и подключением ЭДО, ответим на вопросы о заказах,
                оплате и документах.
              </p>
              <div className={styles.contactHint}>
                <img src="/how-it-works/contact-info.svg" alt="" width={20} height={20} />
                <p>Спор по конкретной сделке лучше открыть в самой сделке — менеджер сразу увидит переписку, этапы и счета.</p>
              </div>
            </div>
            <ManagerContactForm />
            </div>
          </section>
        </main>
      </div>

      <Modal
        accent="teal"
        open={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        title="Написать менеджеру"
        variant="contact"
      >
        <ManagerContactForm
          key={contactModalNonce}
          initialTopic={contactModalTopic}
          modal
        />
      </Modal>

      <section className={styles.bottomCta}>
        <div>
          <h2>Начните с регистрации компании</h2>
          <p>Понадобятся ИНН и подключённый ЭДО. Заявление подпишет руководитель или сотрудник с доверенностью.</p>
          <div className={styles.bottomCtaActions}>
            <Link href="/auth/register">Зарегистрироваться</Link>
            <Link href="/orders/new">
              Разместить заказ
              <img src="/how-it-works/bottom-cta-arrow-exact.svg" alt="" width={14} height={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
