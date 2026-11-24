"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";
import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  Banknote,
  Check,
  ChevronDown,
  CircleCheck,
  CircleDollarSign,
  CircleHelp,
  Clock3,
  FileCheck2,
  FileText,
  Handshake,
  Info,
  LockKeyhole,
  Mail,
  MessageSquareText,
  Search,
  Send,
  ShieldCheck,
  Star,
  UserRoundCheck,
  UsersRound,
} from "lucide-react";
import { useToast } from "@/components/ui/toast-provider";
import styles from "./how-it-works-figma.module.css";

const roles = [
  {
    id: "customer",
    label: "Заказчик",
    title: "Заказчик",
    description: "Находит исполнителей и размещает заказы",
    image: "/how-it-works/role-customer-volume.svg",
    flat: "/how-it-works/role-customer-flat.svg",
    color: "#28b5b3",
    steps: ["Разместить заказ", "Получить отклики", "Выбрать исполнителя", "Принять работу"],
  },
  {
    id: "contractor",
    label: "Исполнитель",
    title: "Исполнитель",
    description: "Находит проекты и предлагает свои услуги",
    image: "/how-it-works/role-contractor-volume.svg",
    flat: "/how-it-works/role-contractor-flat.svg",
    color: "#0aaee4",
    steps: ["Заполнить профиль", "Найти заказ", "Отправить отклик", "Выполнить работу"],
  },
  {
    id: "organizer",
    label: "Организатор",
    title: "Организатор",
    description: "Публикует мероприятия и привлекает участников",
    image: "/how-it-works/role-organizer-volume.svg",
    flat: "/how-it-works/role-organizer-flat.svg",
    color: "#2939eb",
    steps: ["Добавить событие", "Открыть регистрацию", "Собрать участников", "Провести мероприятие"],
  },
  {
    id: "venue",
    label: "Площадка",
    title: "Площадка",
    description: "Размещает пространства и получает заявки",
    image: "/how-it-works/role-venue-volume.svg",
    flat: "/how-it-works/role-venue-flat.svg",
    color: "#683bd9",
    steps: ["Добавить площадку", "Указать условия", "Получить запрос", "Подтвердить бронь"],
  },
] as const;

const navigation = [
  ["overview", "Обзор"],
  ["registration", "Регистрация"],
  ["roles", "Роли на платформе"],
  ["order", "Размещение заказа"],
  ["responses", "Отклики и сделка"],
  ["payment", "Оплата"],
  ["documents", "Документы"],
  ["trust", "Проверка и рейтинг"],
  ["disputes", "Споры и возвраты"],
  ["faq", "Вопросы и ответы"],
  ["contact", "Связаться с менеджером"],
] as const;

const faqs = [
  ["start", "Сколько стоит регистрация?", "Регистрация и базовые возможности платформы бесплатны. Комиссия возникает только в рамках защищённой сделки."],
  ["start", "Можно ли совмещать несколько ролей?", "Да. Один аккаунт может работать как заказчик, исполнитель, организатор и площадка. Роли переключаются в личном кабинете."],
  ["start", "Что доступно до проверки профиля?", "Можно заполнить профиль, изучать каталог и сохранять интересные предложения. Для сделок потребуется пройти проверку."],
  ["orders", "Как разместить заказ?", "Заполните короткую форму: опишите задачу, сроки, бюджет и выберите открытый или закрытый формат публикации."],
  ["orders", "Чем открытый заказ отличается от закрытого?", "Открытый заказ виден подходящим исполнителям. В закрытом заказе вы сами выбираете, кого пригласить к отклику."],
  ["orders", "Можно ли изменить заказ после публикации?", "Да, пока не выбран исполнитель. После начала сделки важные изменения согласуются обеими сторонами."],
  ["deal", "Как выбрать исполнителя?", "Сравните предложение, рейтинг, портфолио и подтверждённые компетенции. Затем обсудите детали в чате сделки."],
  ["deal", "Где проходит общение по заказу?", "Все договорённости фиксируются в чате заказа. Это помогает защитить обе стороны при разногласиях."],
  ["deal", "Как работает безопасная сделка?", "Оплата резервируется до выполнения работы. После подтверждения результата деньги перечисляются исполнителю."],
  ["payment", "Какими способами можно оплатить?", "Доступна оплата картой и по счёту для юридических лиц. Набор способов зависит от типа аккаунта."],
  ["payment", "Когда исполнитель получает деньги?", "После того как заказчик примет работу, либо автоматически по окончании установленного срока проверки."],
  ["documents", "Какие документы формируются?", "Сервис хранит счёт, акт и закрывающие документы. Их можно скачать в карточке завершённой сделки."],
  ["documents", "Подходит ли сервис для юридических лиц?", "Да. Можно указать реквизиты компании и получать комплект документов для бухгалтерии."],
  ["trust", "Как проверяются компании?", "Мы сверяем регистрационные данные, реквизиты, профиль и подтверждения выполненных проектов."],
  ["trust", "Из чего складывается рейтинг?", "На рейтинг влияют завершённые сделки, отзывы, соблюдение сроков и качество заполнения профиля."],
  ["disputes", "Что делать, если возник спор?", "Не закрывайте сделку и обратитесь к менеджеру из карточки заказа. Команда изучит переписку и материалы."],
  ["disputes", "Можно ли вернуть оплату?", "Да, если работа не выполнена или стороны согласовали отмену. Условия возврата зависят от статуса сделки."],
  ["support", "Как быстро отвечает менеджер?", "Обычно мы отвечаем в течение одного рабочего дня. Для активных сделок обращения обрабатываются приоритетно."],
] as const;

const sectionIcon = {
  overview: Search,
  registration: UserRoundCheck,
  roles: UsersRound,
  order: FileText,
  responses: MessageSquareText,
  payment: CircleDollarSign,
  documents: FileCheck2,
  trust: BadgeCheck,
  disputes: ShieldCheck,
  faq: CircleHelp,
  contact: Mail,
};

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
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </header>
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

export function HowItWorksFigmaPage() {
  const { showToast } = useToast();
  const [activeSection, setActiveSection] = useState("overview");
  const [activeRole, setActiveRole] = useState<(typeof roles)[number]["id"]>("customer");
  const [faqFilter, setFaqFilter] = useState("all");

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

  const handleContact = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.currentTarget.reset();
    showToast("Запрос отправлен. Менеджер свяжется с вами в течение рабочего дня.");
  };

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
              Всё необходимое для работы в выставочной индустрии — от поиска партнёров
              до безопасной оплаты и закрывающих документов.
            </p>
          </div>
          <div className={styles.roleCards}>
            {roles.map((role) => (
              <button
                className={styles.roleCard}
                key={role.id}
                onClick={() => {
                  setActiveRole(role.id);
                  document.getElementById("roles")?.scrollIntoView({ behavior: "smooth" });
                }}
                style={{ "--role-color": role.color } as CSSProperties}
                type="button"
              >
                <Image src={role.image} alt="" width={90} height={82} priority />
                <span>
                  <strong>{role.title}</strong>
                  <small>{role.description}</small>
                </span>
                <ArrowDown aria-hidden="true" size={20} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={`${styles.container} ${styles.contentLayout}`}>
        <aside className={styles.sideNav} aria-label="Навигация по странице">
          <strong>Содержание</strong>
          <nav>
            {navigation.map(([id, label]) => {
              const Icon = sectionIcon[id];
              return (
                <a
                  className={activeSection === id ? styles.sideLinkActive : styles.sideLink}
                  href={`#${id}`}
                  key={id}
                  onClick={() => setActiveSection(id)}
                >
                  <Icon size={17} aria-hidden="true" />
                  <span>{label}</span>
                </a>
              );
            })}
          </nav>
          <div className={styles.sideHelp}>
            <CircleHelp size={19} />
            <p>Остались вопросы?</p>
            <a href="#contact">Написать менеджеру</a>
          </div>
        </aside>

        <main className={styles.mainContent}>
          <section className={styles.section} id="overview">
            <SectionTitle
              title="Весь цикл работы в одном сервисе"
              description="Платформа объединяет участников выставочного рынка и помогает провести сделку от первой заявки до закрывающих документов."
            />
            <div className={styles.stats}>
              {[
                ["4", "роли на платформе"],
                ["1", "единый профиль"],
                ["24/7", "доступ к заказам"],
                ["100%", "защищённая оплата"],
              ].map(([value, label]) => (
                <div key={label}>
                  <strong>{value}</strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>
            <div className={styles.processLine}>
              {["Регистрация", "Поиск партнёра", "Сделка", "Оплата", "Документы"].map(
                (item, index) => (
                  <div key={item}>
                    <span>{index + 1}</span>
                    <p>{item}</p>
                    {index < 4 ? <ArrowRight size={18} /> : null}
                  </div>
                ),
              )}
            </div>
            <div className={styles.greenNotice}>
              <ShieldCheck size={23} />
              <div>
                <strong>Сделка под защитой платформы</strong>
                <p>Деньги резервируются и переводятся исполнителю только после приёмки работы.</p>
              </div>
            </div>
          </section>

          <section className={styles.section} id="registration">
            <SectionTitle
              eyebrow="Шаг 1"
              title="Регистрация занимает несколько минут"
              description="Создайте единый аккаунт и выберите роли, в которых планируете работать."
            />
            <div className={styles.split}>
              <div className={styles.whiteCard}>
                <h3>Что нужно сделать</h3>
                <NumberedList
                  items={[
                    "Указать имя, email и телефон",
                    "Подтвердить контактные данные",
                    "Выбрать одну или несколько ролей",
                    "Заполнить профиль компании",
                  ]}
                />
                <Link className={styles.primaryButton} href="/auth/register">
                  Зарегистрироваться <ArrowRight size={17} />
                </Link>
              </div>
              <div className={styles.profileCard}>
                <div className={styles.profileAvatar}>АМ</div>
                <div>
                  <span className={styles.status}>Профиль заполнен на 80%</span>
                  <h3>Алексей Морозов</h3>
                  <p>Продакшн и монтаж выставочных стендов</p>
                </div>
                <div className={styles.progress}>
                  <span />
                </div>
                <ul>
                  <li><Check size={16} /> Контакты подтверждены</li>
                  <li><Check size={16} /> Реквизиты добавлены</li>
                  <li><Clock3 size={16} /> Портфолио на проверке</li>
                </ul>
              </div>
            </div>
            <details className={styles.disclosure}>
              <summary>
                <Info size={19} />
                Что доступно до одобрения профиля
                <ChevronDown size={19} />
              </summary>
              <p>
                Вы можете изучать каталог, сохранять предложения и заполнять профиль.
                Для публикации заказов и начала сделок потребуется подтверждение данных.
              </p>
            </details>
          </section>

          <section className={styles.section} id="roles">
            <SectionTitle
              title="Выберите роль и начните работу"
              description="У каждого участника свой сценарий, инструменты и цветовая маркировка. Роли можно совмещать."
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
                  <Image src={role.flat} alt="" width={28} height={28} />
                  {role.label}
                </button>
              ))}
            </div>
            <div
              className={styles.roleDetail}
              style={{ "--role-color": currentRole.color } as CSSProperties}
            >
              <div>
                <span className={styles.rolePill}>{currentRole.label}</span>
                <h3>{currentRole.description}</h3>
                <p>
                  Работайте в одном кабинете: профиль, сообщения, сделки, оплата и документы
                  всегда находятся под рукой.
                </p>
                <NumberedList items={currentRole.steps} />
                <Link className={styles.roleAction} href="/auth/register">
                  Начать как {currentRole.label.toLowerCase()} <ArrowRight size={17} />
                </Link>
              </div>
              <Image src={currentRole.image} alt="" width={230} height={210} />
            </div>
          </section>

          <section className={styles.section} id="order">
            <SectionTitle
              eyebrow="Для заказчика"
              title="Разместите заказ и получите отклики"
              description="Опишите задачу один раз — сервис покажет её подходящим специалистам."
            />
            <div className={styles.orderTypes}>
              <article>
                <Image src="/how-it-works/order-open.svg" alt="" width={54} height={54} />
                <h3>Открытый заказ</h3>
                <p>Виден всем подходящим исполнителям. Получайте и сравнивайте отклики.</p>
                <span>Больше предложений</span>
              </article>
              <article>
                <Image src="/how-it-works/order-closed.svg" alt="" width={54} height={54} />
                <h3>Закрытый заказ</h3>
                <p>Пригласите выбранные компании и обсудите проект конфиденциально.</p>
                <span>Точный выбор</span>
              </article>
              <article>
                <Image src="/how-it-works/order-urgent.svg" alt="" width={54} height={54} />
                <h3>Срочный заказ</h3>
                <p>Выделяется в каталоге и быстрее попадает к свободным исполнителям.</p>
                <span>Быстрый старт</span>
              </article>
            </div>
            <div className={styles.formPreview}>
              <div>
                <span className={styles.mutedLabel}>Новый заказ</span>
                <h3>Разработка и монтаж стенда 48 м²</h3>
                <p>Москва · Экспоцентр · монтаж до 18 сентября</p>
              </div>
              <div className={styles.formPreviewFields}>
                <span>Категория <b>Застройка стендов</b></span>
                <span>Бюджет <b>от 900 000 ₽</b></span>
                <span>Срок откликов <b>5 дней</b></span>
              </div>
              <button type="button">Опубликовать заказ</button>
            </div>
          </section>

          <section className={styles.section} id="responses">
            <SectionTitle
              title="Сравнивайте отклики и заключайте сделку"
              description="Цена — не единственный критерий. Смотрите рейтинг, опыт, портфолио и подтверждённые компетенции."
            />
            <div className={styles.responseTable}>
              <div className={styles.tableHeader}>
                <span>Исполнитель</span><span>Стоимость</span><span>Срок</span><span>Рейтинг</span>
              </div>
              {[
                ["Expo Build", "920 000 ₽", "21 день", "4.9"],
                ["Forma Space", "875 000 ₽", "24 дня", "4.8"],
                ["Stand Pro", "1 030 000 ₽", "18 дней", "5.0"],
              ].map((row, index) => (
                <div className={index === 0 ? styles.tableRowSelected : styles.tableRow} key={row[0]}>
                  <span><b>{row[0]}</b><small>{18 + index * 7} завершённых проектов</small></span>
                  <span>{row[1]}</span>
                  <span>{row[2]}</span>
                  <span><Star size={15} fill="currentColor" /> {row[3]}</span>
                </div>
              ))}
            </div>
            <div className={styles.dealSteps}>
              {[
                [MessageSquareText, "Обсуждение", "Уточните детали в чате"],
                [Handshake, "Согласование", "Зафиксируйте условия"],
                [LockKeyhole, "Резерв оплаты", "Средства защищены"],
                [CircleCheck, "Приёмка", "Подтвердите результат"],
              ].map(([Icon, title, text], index) => (
                <div key={String(title)}>
                  <span><Icon size={21} /></span>
                  <small>0{index + 1}</small>
                  <h3>{String(title)}</h3>
                  <p>{String(text)}</p>
                </div>
              ))}
            </div>
            <div className={styles.greenNotice}>
              <FileCheck2 size={23} />
              <div>
                <strong>Все договорённости сохраняются</strong>
                <p>Чат, файлы и этапы сделки остаются в карточке заказа и доступны обеим сторонам.</p>
              </div>
            </div>
          </section>

          <section className={styles.section} id="payment">
            <SectionTitle
              title="Безопасная оплата"
              description="Заказчик оплачивает работу через платформу, а исполнитель получает деньги после приёмки."
            />
            <div className={styles.paymentFlow}>
              <div>
                <span className={styles.paymentIcon}><Banknote /></span>
                <small>01</small>
                <h3>Заказчик оплачивает</h3>
                <p>Картой или по счёту для юридического лица.</p>
              </div>
              <ArrowRight className={styles.paymentArrow} />
              <div className={styles.paymentProtected}>
                <span className={styles.paymentIcon}><ShieldCheck /></span>
                <small>02</small>
                <h3>Средства резервируются</h3>
                <p>Исполнитель видит подтверждение и начинает работу.</p>
              </div>
              <ArrowRight className={styles.paymentArrow} />
              <div>
                <span className={styles.paymentIcon}><CircleDollarSign /></span>
                <small>03</small>
                <h3>Исполнитель получает оплату</h3>
                <p>Сразу после подтверждения результата заказчиком.</p>
              </div>
            </div>
            <div className={styles.summaryCard}>
              <div>
                <span>Сумма сделки</span>
                <strong>920 000 ₽</strong>
              </div>
              <div>
                <span>Статус оплаты</span>
                <b><ShieldCheck size={17} /> Средства защищены</b>
              </div>
              <div>
                <span>Выплата исполнителю</span>
                <strong>После приёмки</strong>
              </div>
            </div>
          </section>

          <section className={styles.section} id="documents">
            <SectionTitle
              title="Документы всегда под рукой"
              description="Сервис помогает вести сделки прозрачно и хранит все файлы в одном месте."
            />
            <div className={styles.documentGrid}>
              {[
                ["Счёт на оплату", "Формируется автоматически по реквизитам сделки"],
                ["Акт выполненных работ", "Становится доступен после завершения заказа"],
                ["Файлы и приложения", "Брифы, сметы и результаты хранятся в карточке"],
              ].map(([title, text]) => (
                <article key={title}>
                  <Image src="/how-it-works/file.svg" alt="" width={44} height={44} />
                  <h3>{title}</h3>
                  <p>{text}</p>
                  <a href="#contact">Подробнее <ArrowRight size={15} /></a>
                </article>
              ))}
            </div>
            <div className={styles.infoBanner}>
              <Info size={21} />
              <p><strong>Для юридических лиц</strong> — укажите реквизиты один раз, и они будут подставляться в документы автоматически.</p>
            </div>
          </section>

          <section className={styles.section} id="trust">
            <SectionTitle
              title="Проверка, рейтинг и доверие"
              description="Мы помогаем принимать решение на основе реального опыта и подтверждённых данных."
            />
            <div className={styles.trustGrid}>
              <div className={styles.ratingCard}>
                <span>Рейтинг исполнителя</span>
                <strong>4.9</strong>
                <div>{Array.from({ length: 5 }, (_, index) => <Star key={index} size={21} fill="currentColor" />)}</div>
                <p>На основе 38 завершённых сделок</p>
              </div>
              <div className={styles.reviewCard}>
                <div><b>Точно соблюли сроки</b><span>5.0 <Star size={14} fill="currentColor" /></span></div>
                <p>Команда быстро включилась, предложила понятную смету и отлично справилась с монтажом.</p>
                <small>Отзыв подтверждён сделкой</small>
              </div>
            </div>
            <div className={styles.badges}>
              {[
                ["/how-it-works/mark-verified.svg", "Компания проверена", "Реквизиты подтверждены"],
                ["/how-it-works/mark-production.svg", "Своё производство", "Данные проверены"],
                ["/how-it-works/mark-xy.svg", "Проверено платформой", "Ручная модерация"],
                ["/how-it-works/mark-registry.svg", "В реестре поставщиков", "Статус подтверждён"],
                ["/how-it-works/mark-urgent.svg", "Быстро отвечает", "Среднее время до 1 часа"],
              ].map(([image, title, text]) => (
                <div key={title}>
                  <Image src={image} alt="" width={38} height={38} />
                  <span><b>{title}</b><small>{text}</small></span>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.section} id="disputes">
            <SectionTitle
              title="Если что-то пошло не так"
              description="Менеджер подключится к ситуации, изучит материалы сделки и поможет найти решение."
            />
            <div className={styles.disputeGrid}>
              <div>
                <h3>Когда можно открыть спор</h3>
                <ul>
                  <li><Check size={16} /> Работа не соответствует согласованному заданию</li>
                  <li><Check size={16} /> Нарушены сроки выполнения</li>
                  <li><Check size={16} /> Исполнитель перестал выходить на связь</li>
                  <li><Check size={16} /> Стороны не могут согласовать результат</li>
                </ul>
              </div>
              <div className={styles.managerCard}>
                <div className={styles.managerAvatar}>XY</div>
                <span><b>Персональный менеджер</b><small>Подключится к спору до выплаты</small></span>
                <a href="#contact">Получить помощь</a>
              </div>
            </div>
            <div className={styles.refundLine}>
              {["Обращение", "Проверка материалов", "Решение", "Выплата или возврат"].map((item, index) => (
                <div key={item}><span>{index + 1}</span><p>{item}</p></div>
              ))}
            </div>
          </section>

          <section className={styles.section} id="faq">
            <SectionTitle
              title="Вопросы и ответы"
              description="Коротко о регистрации, заказах, сделках, оплате и документах."
            />
            <div className={styles.faqFilters}>
              {[
                ["all", "Все"],
                ["start", "Начало работы"],
                ["orders", "Заказы"],
                ["deal", "Сделка"],
                ["payment", "Оплата"],
                ["documents", "Документы"],
                ["trust", "Проверка"],
                ["disputes", "Споры"],
              ].map(([id, label]) => (
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
            <div className={styles.faqList}>
              {filteredFaq.map(([, question, answer], index) => (
                <details className={styles.faqItem} key={question} open={faqFilter === "all" && index === 0}>
                  <summary>{question}<ChevronDown size={20} /></summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </section>

          <section className={`${styles.section} ${styles.contactSection}`} id="contact">
            <div>
              <SectionTitle
                title="Не нашли ответ? Спросите менеджера"
                description="Расскажите о задаче — поможем разобраться в сервисе и выбрать подходящий сценарий."
              />
              <div className={styles.contactNotes}>
                <span><Clock3 size={18} /> Ответим в течение рабочего дня</span>
                <span><ShieldCheck size={18} /> Данные не передаются третьим лицам</span>
              </div>
            </div>
            <form className={styles.contactForm} onSubmit={handleContact}>
              <label>Имя<input name="name" placeholder="Как к вам обращаться" required /></label>
              <label>Email<input name="email" placeholder="name@company.ru" required type="email" /></label>
              <label>Кто вы
                <select name="role" defaultValue="customer">
                  <option value="customer">Заказчик</option>
                  <option value="contractor">Исполнитель</option>
                  <option value="organizer">Организатор</option>
                  <option value="venue">Представитель площадки</option>
                </select>
              </label>
              <label>Ваш вопрос<textarea name="message" placeholder="Опишите задачу или вопрос" required /></label>
              <label className={styles.consent}><input type="checkbox" required /> Я согласен с политикой обработки данных</label>
              <button type="submit">Отправить <Send size={17} /></button>
            </form>
          </section>
        </main>
      </div>

      <section className={styles.bottomCta}>
        <div>
          <h2>Начните работать в выставочной индустрии</h2>
          <p>Создайте профиль, найдите партнёров и проведите первую безопасную сделку.</p>
          <Link href="/auth/register">Зарегистрироваться <ArrowRight size={18} /></Link>
        </div>
      </section>
    </div>
  );
}
