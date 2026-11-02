import { HOME_IMAGES } from "./home-images";

export type HomeQuickActionRegisterRole = "contractor" | "customer" | "organizer" | "venue";

export const HOME_QUICK_ACTIONS = [
  {
    href: "/contractors",
    title: "Найти исполнителя",
    text: "Проверенные исполнители с портфолио, рейтингом и отзывами по категориям выставочных услуг.",
    imageUrl: HOME_IMAGES.quickActions[1],
    registerRole: "contractor",
    registerLabel: "Зарегистрировать исполнителя",
  },
  {
    href: "/requests/new",
    title: "Разместить заказ",
    text: "Опубликуйте заявку и получите отклики от исполнителей или выберите формат безопасной сделки.",
    imageUrl: HOME_IMAGES.quickActions[2],
    registerRole: "customer",
    registerLabel: "Зарегистрировать заказчика",
  },
  {
    href: "/events",
    title: "Найти выставку",
    text: "Календарь выставок, форумов и конференций по отраслям, городам и датам проведения.",
    imageUrl: HOME_IMAGES.quickActions[3],
    registerRole: "organizer",
    registerLabel: "Зарегистрировать организатора",
  },
  {
    href: "/venues",
    title: "Найти площадку",
    text: "Площадки для проведения мероприятий: павильоны, залы, инфраструктура и условия аренды.",
    imageUrl: HOME_IMAGES.quickActions[4],
    registerRole: "venue",
    registerLabel: "Зарегистрировать площадку",
  },
  {
    href: "/services",
    title: "Найти услугу",
    text: "Каталог услуг для выставок: строительство стендов, дизайн, логистика и сопутствующие работы.",
    imageUrl: HOME_IMAGES.quickActions[0],
    registerRole: "contractor",
    registerLabel: "Зарегистрировать исполнителя",
  },
] as const satisfies ReadonlyArray<{
  href: string;
  title: string;
  text: string;
  imageUrl: string;
  registerRole: HomeQuickActionRegisterRole;
  registerLabel: string;
}>;

export const HOME_AUDIENCE_BLOCKS = [
  {
    title: "Для заказчиков",
    text: "Размещайте заказы, сравнивайте предложения, управляйте сделками и документами в одном месте.",
    href: "/register?role=customer",
    moreHref: "/how-it-works#customers",
    linkLabel: "Зарегистрироваться",
    role: "customer" as const,
    reverse: false,
    imageUrl: HOME_IMAGES.audience[0],
  },
  {
    title: "Для исполнителей",
    text: "Находите заказы, отправляйте отклики, управляйте проектами и получайте выплаты.",
    href: "/register?role=contractor",
    moreHref: "/how-it-works#contractors",
    linkLabel: "Зарегистрироваться",
    role: "contractor" as const,
    reverse: true,
    imageUrl: HOME_IMAGES.audience[1],
  },
  {
    title: "Для организаторов",
    text: "Создавайте выставки, форумы и конференции на платформе, распределяйте площади для аренды и оказывайте услуги экспонентам, застройщикам и другим участникам.",
    href: "/register?role=organizer",
    moreHref: "/how-it-works#organizers",
    linkLabel: "Зарегистрироваться",
    role: "organizer" as const,
    reverse: false,
    imageUrl: HOME_IMAGES.audience[2],
  },
  {
    title: "Для площадок",
    text: "Размещайте площадку, управляйте залами и бронированием стендов, привлекайте организаторов и оказывайте услуги экспонентам, застройщикам и другим участникам.",
    href: "/register?role=venue",
    moreHref: "/how-it-works#venues",
    linkLabel: "Зарегистрироваться",
    role: "venue" as const,
    reverse: true,
    imageUrl: HOME_IMAGES.audience[3],
  },
] as const;

export const HOME_WORK_FORMATS = [
  {
    title: "Безопасная сделка",
    text: "Заказчик выбирает услугу или исполнителя, согласует этапы и резервирует оплату на сервисе до приёмки результата.",
    buttonLabel: "Выбрать услугу",
    href: "/services",
    imageUrl: HOME_IMAGES.workFormats[0],
  },
  {
    title: "Открытый запрос предложений",
    text: "Заявка публикуется для всех подходящих исполнителей. Сервис принимает заявки от первых 10 откликнувшихся.",
    buttonLabel: "Создать заявку",
    href: "/requests/new?format=open_request",
    imageUrl: HOME_IMAGES.workFormats[1],
  },
  {
    title: "Закрытый запрос предложений",
    text: "Заказчик сам выбирает потенциальных исполнителей, которым будет доступна заявка, но не более 5 исполнителей.",
    buttonLabel: "Выбрать исполнителей",
    href: "/contractors",
    imageUrl: HOME_IMAGES.workFormats[2],
  },
  {
    title: "Срочная сделка",
    text: "Короткая форма, быстрый выбор услуги или мгновенная отправка задания подходящим исполнителям, не более 10 исполнителей. Сервис принимает заявки от первых 5 откликнувшихся. Возможна оплата картой физического лица.",
    buttonLabel: "Срочный заказ",
    href: "/requests/new?format=urgent",
    imageUrl: HOME_IMAGES.workFormats[3],
  },
] as const;

export const HOME_HOW_IT_WORKS_STEPS = [
  {
    title: "Регистрация компании",
    text: "ИНН, подтверждение через ЭДО, модерация.",
  },
  {
    title: "Поиск или заказ",
    text: "Услуга из каталога, заказ исполнителям или запрос брони площадки.",
  },
  {
    title: "Отклики и выбор",
    text: "Предложения исполнителей или ответ площадки на бронь.",
  },
  {
    title: "Оплата одним счётом",
    text: "Через T-Bank, банк сам распределяет платёж.",
  },
  {
    title: "Приёмка и документы",
    text: "Этапы работ, акты и УПД сами уходят в ЭДО.",
  },
] as const;

export const HOME_FAQ_ITEMS = [
  {
    title: "Чем сервис лучше привычных способов поиска?",
    content:
      "Исполнителей не нужно искать по сайтам застройщиков, спискам организаторов и тендерам: компании с рейтингом, отзывами и проверкой через Контур собраны в одном каталоге. Один заказ уходит всем подходящим исполнителям, отклики сравниваются в таблице. Договор, один счёт через T-Bank и закрывающие документы в ЭДО — внутри сделки.",
  },
  {
    title: "Какие форматы заказов есть?",
    content:
      "Открытый и закрытый запрос предложений, срочный заказ и безопасная сделка по выбранной услуге. Формат задаёт, кому видна заявка и как проходит оплата.",
  },
  {
    title: "Как проходит оплата?",
    content:
      "Заказчик оплачивает один счёт через T-Bank. Банк резервирует сумму и распределяет выплату исполнителю после приёмки этапа.",
  },
  {
    title: "Что делать, если работа выполнена некачественно?",
    content:
      "На этапе приёмки можно вернуть работу на доработку. Если стороны не сходятся, сделка разбирается через поддержку сервиса до выплаты.",
  },
  {
    title: "Как организатору забрать своё мероприятие из каталога?",
    content:
      "Зарегистрируйте компанию как организатора и подтвердите права на мероприятие. После модерации карточка перейдёт в ваш кабинет.",
  },
  {
    title: "Почему стоит зарегистрироваться сейчас?",
    content:
      "Ранний доступ к заявкам, исполнителям и мероприятиям, а также возможность первыми пользоваться сделкой и документами на сервисе.",
  },
  {
    title: "Как зарегистрироваться?",
    content: "Выберите роль, введите ИНН компании и пройдите модерацию.",
  },
  {
    title: "Нужно ли подключать ЭДО?",
    content: "Рекомендуется для подписания документов, но можно пропустить на старте.",
  },
  {
    title: "Как работает система рейтингов?",
    content:
      "Рейтинг формируется после завершённых сделок на основе оценок заказчиков и исполнителей.",
  },
  {
    title: "Преимущества для заказчиков",
    content:
      "Размещение заказов, сравнение предложений, один счёт и управление документами в одном месте.",
  },
  {
    title: "Преимущества сервиса для исполнителей",
    content:
      "Доступ к заказам, отклики, управление проектами и выплаты с минимальной комиссией после оплаты услуг.",
  },
] as const;

export const HOME_RECOMMENDED_VENUES = [
  { id: "rv-1", name: "Сокольники Expo", city: "Москва", halls: "6 павильонов", imageUrl: HOME_IMAGES.venue[0] },
  { id: "rv-2", name: "Тимирязев Центр", city: "Москва", halls: "3 зала", imageUrl: HOME_IMAGES.venue[1] },
  { id: "rv-3", name: "Loft Hall", city: "Москва", halls: "4 зала", imageUrl: HOME_IMAGES.venue[2] },
  { id: "rv-4", name: "ЦМТ", city: "Москва", halls: "2 павильона", imageUrl: HOME_IMAGES.venue[3] },
  { id: "rv-5", name: "МВЦ «Красная Пресня»", city: "Москва", halls: "5 залов", imageUrl: HOME_IMAGES.venue[4] },
  { id: "rv-6", name: "Сколково", city: "Москва", halls: "3 зала", imageUrl: HOME_IMAGES.venue[0] },
];

export const HOME_MOSCOW_VENUES = [
  { id: "v-1", name: "ЭкспоЦентр", city: "Москва", halls: "8 павильонов", imageUrl: HOME_IMAGES.venue[0] },
  { id: "v-2", name: "Крокус Экспо", city: "Москва", halls: "3 павильона", imageUrl: HOME_IMAGES.venue[1] },
  { id: "v-3", name: "Гостиный двор", city: "Москва", halls: "2 зала", imageUrl: HOME_IMAGES.venue[2] },
  { id: "v-4", name: "ВДНХ", city: "Москва", halls: "5 павильонов", imageUrl: HOME_IMAGES.venue[3] },
  { id: "v-5", name: "Манеж", city: "Москва", halls: "1 зал", imageUrl: HOME_IMAGES.venue[4] },
  { id: "v-6", name: "Авиапарк Expo", city: "Москва", halls: "2 павильона", imageUrl: HOME_IMAGES.venue[1] },
];
