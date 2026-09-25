import type { MessageThread, Notification, UserRole } from "../types/index.ts";

export const SEED_NOTIFICATIONS: Notification[] = [
  { id: "notif-1", title: "Новый отклик", message: "ООО «СтендПро» откликнулся на заявку", priority: "action_required", read: false, date: "2026-01-11", link: "/requests/req-1/responses", category: "responses", audience: "customer" },
  { id: "notif-2", title: "Этап принят", message: "Дизайн-проект по сделке СД-2026-001 принят", priority: "info", read: false, date: "2026-01-21", link: "/deals/deal-1", category: "deals", audience: "customer" },
  { id: "notif-3", title: "Срок приближается", message: "Дедлайн монтажа через 3 дня", priority: "deadline", read: true, date: "2026-01-17", link: "/deals/deal-1", category: "deals", audience: "customer" },
  { id: "notif-4", title: "Документ на подпись", message: "Акт по сделке СД-2026-002", priority: "action_required", read: false, date: "2026-01-16", link: "/account/customer/edo", category: "documents", audience: "customer" },
  { id: "notif-5", title: "Подключите ЭДО", message: "Для подписания документов подключите ЭДО", priority: "info", read: true, date: "2026-01-10", link: "/account/customer/edo", category: "system", audience: "customer" },
  { id: "notif-6", title: "Сообщение от площадки", message: "ЭкспоЦентр уточняет список на пропуска", priority: "action_required", read: false, date: "2026-01-19", link: "/messages/msg-6", category: "messages", audience: "customer" },
  { id: "cnotif-1", title: "Новая заявка", message: "Стенд 36 кв.м на Мебель-2026 — можно откликнуться", priority: "action_required", read: false, date: "2026-01-11", link: "/requests/req-1", category: "requests", audience: "contractor" },
  { id: "cnotif-2", title: "Сообщение от заказчика", message: "ООО «Вымышленная Мебель»: когда будет готов дизайн?", priority: "info", read: false, date: "2026-01-18", link: "/messages/msg-1", category: "messages", audience: "contractor" },
  { id: "cnotif-3", title: "Аккредитация", message: "Организатор ждёт список бригады на монтаж", priority: "deadline", read: false, date: "2026-01-15", link: "/messages/msg-8", category: "messages", audience: "contractor" },
  { id: "cnotif-4", title: "Техконтроль площадки", message: "ЭкспоЦентр согласовал точки подвеса", priority: "info", read: true, date: "2026-01-16", link: "/messages/msg-7", category: "messages", audience: "contractor" },
  { id: "cnotif-5", title: "Документ на подпись", message: "Договор по сделке СД-2026-001", priority: "action_required", read: false, date: "2026-01-12", link: "/account/contractor/documents", category: "documents", audience: "contractor" },
  { id: "vnotif-1", title: "Подтвердите бронирование", message: "Мебель-2026: новая заявка на павильон 1", priority: "action_required", read: false, date: "2026-01-18", link: "/account/venue/bookings", category: "bookings", eventId: "evt-1", audience: "venue" },
  { id: "vnotif-2", title: "Счёт к оплате", message: "IT Forum Russia: входящий счёт от организатора", priority: "action_required", read: false, date: "2026-01-17", link: "/account/venue/payments", category: "payments", eventId: "evt-3", audience: "venue" },
  { id: "vnotif-3", title: "Документ на подпись", message: "Мода и Стиль: акт от экспонента", priority: "deadline", read: false, date: "2026-01-16", link: "/account/venue/documents", category: "documents", eventId: "evt-5", audience: "venue" },
  { id: "vnotif-4", title: "Новый заказ услуги", message: "Мебель-2026: застройщик заказал пропуска", priority: "info", read: true, date: "2026-01-15", link: "/account/venue/orders/evt-1", category: "orders", eventId: "evt-1", audience: "venue" },
  { id: "vnotif-5", title: "Требуется действие", message: "Мебель-2026: заявка на аренду лебёдки", priority: "action_required", read: false, date: "2026-01-19", link: "/account/venue/orders/evt-1", category: "orders", eventId: "evt-1", audience: "venue" },
  { id: "vnotif-6", title: "Сообщение от организатора", message: "Подтвердите дату монтажа на площадке", priority: "action_required", read: false, date: "2026-01-16", link: "/messages/msg-4", category: "messages", eventId: "evt-1", audience: "venue" },
  { id: "onotif-1", title: "Новый заказ от экспонента", message: "Мебель-2026: ООО «Вымышленная Мебель» — аренда 36 кв.м", priority: "action_required", read: false, date: "2026-01-19", link: "/account/organizer/orders", category: "orders", eventId: "evt-1", audience: "organizer" },
  { id: "onotif-2", title: "Счёт от площадки", message: "ЭкспоЦентр: счёт за аренду павильона 1", priority: "action_required", read: false, date: "2026-01-18", link: "/account/organizer/payments", category: "payments", eventId: "evt-1", audience: "organizer" },
  { id: "onotif-3", title: "Новый участник", message: "Мода и Стиль: заявка от ООО «ТехноВижн»", priority: "info", read: false, date: "2026-01-17", link: "/account/organizer/edit-event?id=evt-5&tab=participants", category: "participants", eventId: "evt-5", audience: "organizer" },
  { id: "onotif-4", title: "Публикация мероприятия", message: "Light & Build Moscow одобрено модератором", priority: "info", read: true, date: "2026-01-12", link: "/account/organizer/events", category: "events", eventId: "evt-10", audience: "organizer" },
  { id: "onotif-5", title: "Сообщение от экспонента", message: "Нужен финальный список услуг в каталог", priority: "info", read: false, date: "2026-01-14", link: "/messages/msg-5", category: "messages", eventId: "evt-1", audience: "organizer" },
];

const ALL_ROLES: Exclude<UserRole, null>[] = ["customer", "contractor", "venue", "organizer"];

function seedThread(
  id: string,
  title: string,
  category: MessageThread["category"],
  relatedType: string,
  relatedId: string,
  relatedLink: string,
  participantRoles: Exclude<UserRole, null>[],
  unread: number,
  messages: MessageThread["messages"]
): MessageThread {
  const last = messages[messages.length - 1];
  return {
    id,
    title,
    category,
    contextType: relatedType as MessageThread["contextType"],
    contextId: relatedId,
    relatedType,
    relatedId,
    relatedLink,
    lastMessage: last?.text ?? "",
    lastDate: last?.date ?? "",
    unread,
    participantRoles,
    messages,
  };
}

export const SEED_MESSAGES: MessageThread[] = [
  seedThread("msg-1", "Сделка СД-2026-001", "customer", "deal", "deal-1", "/deals/deal-1", ["customer", "contractor"], 1, [
    { id: "m1-1", sender: "ООО «Вымышленная Мебель»", text: "Добрый день! Стартуем стенд 36 кв.м на Мебель-2026. Можем созвониться по планировке?", date: "2026-01-12", files: [] },
    { id: "m1-2", sender: "ООО «СтендПро»", text: "Да, готовы. Пришлите бриф и ограничения зала — подготовим 2 варианта.", date: "2026-01-12", files: [] },
    { id: "m1-3", sender: "ООО «Вымышленная Мебель»", text: "Бриф во вложении. Нужна закрытая переговорка и открытая витрина.", date: "2026-01-13", files: ["brief-stand-36.pdf"] },
    { id: "m1-4", sender: "ООО «СтендПро»", text: "Приняли. Черновой план отправим завтра, финал — к пятнице.", date: "2026-01-14", files: [] },
    { id: "m1-5", sender: "ООО «Вымышленная Мебель»", text: "Когда будет готов дизайн?", date: "2026-01-18", files: [] },
    { id: "m1-6", sender: "ООО «СтендПро»", text: "К пятнице отправим финальную версию и спецификацию материалов.", date: "2026-01-18", files: ["preview.pdf"] },
  ]),
  seedThread("msg-2", "Заявка: Стенд 36 кв.м", "customer", "request", "req-1", "/requests/req-1", ["customer", "contractor"], 0, [
    { id: "m2-1", sender: "ООО «ДизайнСтенд»", text: "Готовы взять дизайн и авторский надзор. Уточните размеры зоны переговоров.", date: "2026-01-10", files: [] },
    { id: "m2-2", sender: "ООО «Вымышленная Мебель»", text: "Переговорка 3×3 м, витрина вдоль фасада 6 м. Бюджет в заявке актуальный.", date: "2026-01-10", files: [] },
    { id: "m2-3", sender: "ООО «ДизайнСтенд»", text: "Спасибо. Добавим в КП два сценария освещения и отправим сегодня вечером.", date: "2026-01-11", files: ["kp-dizainstend.pdf"] },
  ]),
  seedThread("msg-3", "Поддержка платформы", "system", "support", "support", "/messages/msg-3", ALL_ROLES, 0, [
    { id: "m3-1", sender: "Поддержка", text: "Добро пожаловать на платформу. Здесь чаты по сделкам, заявкам, бронированиям и мероприятиям.", date: "2026-01-01", files: [] },
    { id: "m3-2", sender: "Поддержка", text: "Документы подписываются в ЭДО, счета — в разделе оплат. Если что-то не находится, напишите нам.", date: "2026-01-01", files: [] },
    { id: "m3-3", sender: "Поддержка", text: "Напоминание: непрочитанные чаты подсвечиваются в списке сообщений.", date: "2026-01-08", files: [] },
  ]),
  seedThread("msg-4", "Бронирование: ЭкспоЦентр", "venue", "booking", "book-1", "/account/venue/bookings", ["venue", "organizer"], 1, [
    { id: "m4-1", sender: "ООО «МебельЭкспо Организатор»", text: "Просим подтвердить павильон 1 на Мебель-2026, включая монтаж 10–14 марта.", date: "2026-01-15", files: [] },
    { id: "m4-2", sender: "АО «ЭкспоЦентр Вымышленный»", text: "Слот свободен. Нужен план расстановки до 20 января и список подрядчиков.", date: "2026-01-15", files: [] },
    { id: "m4-3", sender: "ООО «МебельЭкспо Организатор»", text: "План отправим вместе с договором. Монтаж с 8:00, заезд фур — с 6:30.", date: "2026-01-16", files: [] },
    { id: "m4-4", sender: "АО «ЭкспоЦентр Вымышленный»", text: "Подтвердите дату монтажа на площадке и окно разгрузки у рампы 3.", date: "2026-01-16", files: [] },
  ]),
  seedThread("msg-5", "Мебель-2026: участие", "organizer", "event", "evt-1", "/events/evt-1", ["organizer", "customer"], 0, [
    { id: "m5-1", sender: "ООО «МебельЭкспо Организатор»", text: "Ваша заявка на 36 кв.м принята. Пришлите логотип и описание для каталога.", date: "2026-01-13", files: [] },
    { id: "m5-2", sender: "ООО «Вымышленная Мебель»", text: "Логотип приложили. Нужны ещё розетки 3×3 кВт и доступ в зал с 9 марта.", date: "2026-01-13", files: ["logo-mebel.svg"] },
    { id: "m5-3", sender: "ООО «МебельЭкспо Организатор»", text: "Отправьте финальный список услуг для каталога мероприятия — закроем карточку участника.", date: "2026-01-14", files: [] },
  ]),
  seedThread("msg-6", "Пропуска на монтаж", "venue", "booking", "book-1", "/account/venue/bookings", ["venue", "customer"], 1, [
    { id: "m6-1", sender: "ООО «Вымышленная Мебель»", text: "Нужны пропуска на 12 человек 10–14 марта, плюс 2 машины на разгрузку.", date: "2026-01-17", files: [] },
    { id: "m6-2", sender: "АО «ЭкспоЦентр Вымышленный»", text: "Список ФИО и номера авто пришлите в шаблоне. Пропуска будут на ресепшен павильона 1.", date: "2026-01-18", files: ["passes-template.xlsx"] },
    { id: "m6-3", sender: "ООО «Вымышленная Мебель»", text: "Заполненный список отправили. Подтвердите, что машины въезжают с 6:30.", date: "2026-01-19", files: ["passes-mebel-2026.xlsx"] },
  ]),
  seedThread("msg-7", "Точки подвеса и лебёдка", "venue", "event", "evt-1", "/account/venue/orders/evt-1", ["venue", "contractor"], 1, [
    { id: "m7-1", sender: "ООО «СтендПро»", text: "Для стенда 36 кв.м нужны 4 точки подвеса и аренда лебёдки на 12 марта.", date: "2026-01-15", files: [] },
    { id: "m7-2", sender: "АО «ЭкспоЦентр Вымышленный»", text: "Схема ферм во вложении. Лебёдку подтверждаем, нужен техконтроль до 17:00 11 марта.", date: "2026-01-16", files: ["rigging-pavilion-1.pdf"] },
    { id: "m7-3", sender: "ООО «СтендПро»", text: "Принято. Инженера направим к 10:00, акт подпишем на площадке.", date: "2026-01-16", files: [] },
  ]),
  seedThread("msg-8", "Аккредитация бригады", "organizer", "event", "evt-1", "/events/evt-1", ["organizer", "contractor"], 1, [
    { id: "m8-1", sender: "ООО «МебельЭкспо Организатор»", text: "Для допуска на монтаж пришлите список бригады и полисы.", date: "2026-01-14", files: [] },
    { id: "m8-2", sender: "ООО «СтендПро»", text: "Список из 8 человек приложили. Двое с допусками на высотные работы.", date: "2026-01-15", files: ["crew-standpro.pdf"] },
    { id: "m8-3", sender: "ООО «МебельЭкспо Организатор»", text: "Почти готово: не хватает скана удостоверения на Иванова. После этого откроем бейджи.", date: "2026-01-15", files: [] },
  ]),
  seedThread("msg-9", "IT Forum: доп. услуги", "organizer", "event", "evt-3", "/events/evt-3", ["organizer", "customer"], 0, [
    { id: "m9-1", sender: "ООО «Вымышленная Мебель»", text: "Рассматриваем IT Forum. Можно ли докупить мебель и хостес через организатора?", date: "2026-01-09", files: [] },
    { id: "m9-2", sender: "ООО «МебельЭкспо Организатор»", text: "Да, пакет услуг в карточке мероприятия. Забронируем после выбора площади.", date: "2026-01-09", files: [] },
    { id: "m9-3", sender: "ООО «Вымышленная Мебель»", text: "Ок, сначала закроем Мебель-2026, к форуму вернёмся на следующей неделе.", date: "2026-01-14", files: [] },
  ]),
  seedThread("msg-10", "Light & Build: залы", "venue", "event", "evt-10", "/events/evt-10", ["venue", "organizer"], 0, [
    { id: "m10-1", sender: "ООО «МебельЭкспо Организатор»", text: "Нужен зал 1 на 10–12 апреля и партер под свет. Есть свободные блоки?", date: "2026-01-12", files: [] },
    { id: "m10-2", sender: "АО «ЭкспоЦентр Вымышленный»", text: "Зал 1 свободен. Пришлите сетку нагрузки — согласуем подвесы до публикации.", date: "2026-01-12", files: [] },
    { id: "m10-3", sender: "ООО «МебельЭкспо Организатор»", text: "Сетку отправили. Можно бронировать, договор подготовим сегодня.", date: "2026-01-13", files: ["lb-hall-1-load.pdf"] },
  ]),
  seedThread("msg-11", "Сделка СД-2026-002", "customer", "deal", "deal-2", "/deals/deal-2", ["customer", "contractor"], 0, [
    { id: "m11-1", sender: "ООО «Вымышленная Мебель»", text: "Срочный монтаж согласован. Можете выйти на площадку 11 марта с 7:00?", date: "2026-01-16", files: [] },
    { id: "m11-2", sender: "ООО «СтендПро»", text: "Да. Бригада будет к 7:00, акт и фотоотчёт отправим в тот же день.", date: "2026-01-16", files: [] },
    { id: "m11-3", sender: "ООО «Вымышленная Мебель»", text: "Отлично. Счёт уже в оплатах, подпишем акт в ЭДО после приёмки.", date: "2026-01-16", files: [] },
  ]),
];
