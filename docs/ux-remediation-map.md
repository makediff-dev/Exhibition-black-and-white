# UX remediation map — этап 0

Версия: 1.0  
Дата разведки: 23 сентября 2026  
Основание: [ux-audit-prototype.md](./ux-audit-prototype.md), [cursor-ux-implementation-playbook.md](./cursor-ux-implementation-playbook.md)  
Skill: `$product-design-and-ux` (IA, permissions, traceability, state inventory; без UI-реализации)

Продуктовый код на этом этапе не изменялся. Источники аудита и playbook скопированы в `docs/` без правок логики приложения.

---

## 1. Репозиторий и стек

| Вопрос | Факт |
|---|---|
| Корень приложения | `Exhibition-black-and-white/` (внутри workspace `324234`) |
| Стек | Next.js 16.2.10 App Router, React 19, TypeScript strict, Zustand persist, CSS Modules + Tailwind 4 |
| Backend / API | Нет. Клиентский UX-прототип. Нет `middleware.ts`, JWT, NestJS, REST |
| Сессия | `useAuthStore` в `src/lib/store/index.ts`, persist `auth-storage`. `login(role)` берёт `DEMO_USERS`. `logout()` обнуляет user/session в localStorage |
| Активная роль | `user.role` из persist. Мультиаккаунт: `accessibleAccounts` + `switchAccount`. Нет модели «несколько ролей у одного человека» |
| Активная организация | Совпадает с демо-профилем роли (`user.id`, `getVenueIdForUser`, `getContractorIdForUser`) |
| Данные | `src/data/mocks/seed.ts`, `seed-messages.ts`; runtime merge в `usePrototypeStore` (persist + mergeById) |
| Текущая дата | Системных часов прототипа нет. В коде встречаются `new Date()` (бронь, счета). Fixtures завязаны на март–июль 2026 и 2025 — относительно 23.09.2026 многие объекты уже в прошлом |
| Статусы | `src/data/types/index.ts` + `src/constants/statuses.ts`. В UI частично английские коды (`signed`, `sent`, `draft`, `reserved`, `pending`) |
| Кабинеты | `/account/[role]/[[...slug]]` → клиентский `page.tsx` + `AccountPageRenderer` |
| Публичные маршруты | `/`, `/login`, `/register`, `/how-it-works`, `/events`, `/venues`, `/services`, `/contractors`, `/requests`, `/deals/[id]`, `/messages`, `/payments`, `/documents`, … |

### Команды

| Назначение | Команда | Есть в `package.json` |
|---|---|---|
| Dev | `npm run dev` (`next dev -H 127.0.0.1 -p 3000`) | да |
| Lint | `npm run lint` (`eslint`) | да |
| Typecheck | `npx tsc --noEmit` | **нет отдельного script** |
| Tests | — | **нет script, нет `*.spec`/`*.test`**. Playwright в devDependencies, тестов нет |
| Build | `npm run build` | да |
| Start / preview | `npm run start`, `npm run preview` | да |

Демо-вход: README — ИНН `7701234567`, код `123456`; плюс `DemoMenu` по ролям.

### Существующие слои «прав» (не security boundary)

- Редирект чужого кабинета: `src/app/account/[role]/[[...slug]]/page.tsx` — **после paint**, контент URL-роли всё равно рендерится.
- Allowlist slug: `isAllowedCabinetPath` в `src/lib/utils/cabinet-scope.ts`.
- Фильтры данных: `isDocumentForUser`, `isPaymentForUser`, `isDealForUser`, `isRequestVisibleToContractor`, `isThreadForUser` — только клиент.
- Документы площадки: `document.venueId === getVenueIdForUser(user)` — seed вешает `venueId: "venue-1"` и на договоры «Заказчик — Исполнитель».
- Закрытая заявка: фильтр только `invitedContractorIds`, без категории/гео.

---

## 2. Модели сущностей (как есть в коде)

| Сущность | Тип / fixtures | Ключевые поля | Замечание аудита |
|---|---|---|---|
| Request | `Request`, `SEED` + store | `status`: draft/published/in_progress/completed; `format`; `category`; `deadline`; `invitedContractorIds` | Нет expired/archived; дедлайн не глушит отклик |
| Response / proposal | store responses | pending/accepted/rejected | Валидация отклика слабая |
| Service | `SEED_SERVICES` + store | `contractorId`, цена, предоплата | Форма: дефолт 100% предоплаты, кнопка без валидации |
| Deal | `SEED_DEALS` `deal-1`… | стороны customer/contractor | `deal-1` — заглушка для чужих заказов |
| EventOrder | `SEED_EVENT_ORDERS` `eord-*` | `type`, `dealId?`, `direction` | `eord-2`, `eord-4` → `dealId: "deal-1"` |
| Booking | store + seed | pending/confirmed/rejected; периоды монтажа/проведения | Прошедшие даты остаются actionable |
| Event | `SEED_EVENTS` | `organizerId`, `venueId`, даты | Публично светится `user-organizer` |
| Invoice/Payment | `SEED_PAYMENTS` `pay-*`, `opay-*` | type/status/direction | Дубли резерва 520000: `pay-1` и `opay-7` |
| Document | `SEED_DOCUMENTS` `doc-1`…`doc-14` | `dealId`, `venueId`, `organizerId`, `parties`, EN status | Cross-role leak через venueId/organizerId |

---

## 3. Карта 29 проблем аудита

Колонка **Тест**: автотестов нет; указан нужный сценарий для этапов 2–8.

| № | Проблема | Маршрут | Компонент | Источник данных | Нужное изменение | Тест | Этап playbook |
|---|---|---|---|---|---|---|---|
| 1 | Прямой URL чужого кабинета открывает чужую логику при меню своей роли | `/account/{customer\|contractor\|venue\|organizer}/*` | `src/app/account/[role]/[[...slug]]/page.tsx`, `AccountPageRenderer`, `AppShell` (nav от `user.role`) | `useAuthStore.user.role` | Не рендерить чужой кабинет. Deny-by-default guard до paint; 403 или replace. **Сервер нужен для production**; сейчас только demo frontend | Прямой URL каждой роли под каждой сессией; flash контента | 2 |
| 2 | Документы всех ролей смешаны | `/account/{contractor\|venue\|organizer}/documents`, ЭДО заказчика | `DocumentsPanel`, `isDocumentForUser` | `SEED_DOCUMENTS` + persist; `doc-1`/`doc-4`/`doc-7` с `venueId` + `organizerId` при parties «Заказчик — Исполнитель» | Стороны документа = единственный критерий; убрать ложные venue/organizer id; ACL на чтение и подпись. **Сервер обязателен**; frontend — демо | ACL каждая роль × тип документа × чужой ID | 2 |
| 3 | Просроченные заявки/события/брони/счета активны | кабинеты, `/requests`, `/events`, брони площадки | карточки, кнопки Откликнуться/Подтвердить; нет clock | seed даты 2026-03…07 vs audit 23.09.2026; `new Date()` точечно | Единые часы прототипа + state machine; блокировать несовместимые действия + recovery. **Решение: фиксированная дата vs rolling fixtures** | overdue не кликается; есть причина и recovery | 3 |
| 4 | Разные заказы ведут в `deal-1` | `/account/{venue\|organizer}/orders`, `/deals/deal-1` | `EventOrdersPanel.getOrderHref`, `SEED_EVENT_ORDERS` | `eord-2` (пропуска), `eord-4` (аренда 36 кв.м) → `deal-1` (стенд) | Стабильный ID заказа; `order → deal → invoice → document`; не шарить заглушку | Клик пропуска ≠ клик аренды ≠ стенд | 1, 4 |
| 5 | ТЗ кейтеринга = шаблон стенда | `/requests/new` | `request-wizard.tsx`, `request-description-form`, `REQUEST_DESCRIPTION_SECTIONS` | один шаблон секций на все категории | Схема полей от категории | Кейтеринг без площади/фриза стенда | 5 |
| 6 | Даты в прошлом, пустой диапазон бюджета, «обязательные» файлы, Publish без summary | `/requests/new` | `request-wizard.tsx` (`canProceed`, `isPublishReady`, `disabled={!canProceed}`) | форма + `DateRangePicker` | Валидация дат/бюджета/файлов; validation summary со ссылками «Исправить» | Невалидный диапазон; пустой budget range; файлы; summary на финале | 5 |
| 7 | СтендПро видит кейтеринг; просрочка; отклик без цены | `/account/contractor/available-requests`, `/requests/[id]/respond` | `AccountPageRenderer` + `isRequestVisibleToContractor`; `respond/page.tsx` (toast, кнопка не disabled) | requests seed; профиль `ctr-1` | Фильтр категория/гео **или** явный opt-in; дедлайн; client+server validation. **Решение D-09** | Кейтеринг скрыт/помечен; expired blocked; пустые поля | 5 |
| 8 | Три равноправных CTA на услуге | `/services/[id]` | `src/app/services/[id]/page.tsx` (корзина / оформить / заявка) | `useCartStore`, услуга из store | Один primary path; корзина только для стандартизированных позиций. **Решение D-03** | Понятна разница сценариев | 5 |
| 9 | Бронь ячейки без цены/условий | `/events/[id]/booking` | `events/[id]/booking/page.tsx` (код ячейки, «Павильон 1 · свободна») | `floorCells` в store; `addBooking` | Карточка участка: площадь, цена, hold, отмена, кто подтвердит | Confirm без карточки невозможен | 5 |
| 10 | Брони площадка↔организатор без цены, договора, next actor; прошлые требуют confirm | `/account/venue/bookings`, `/account/organizer/bookings` | `VenueBookingsSection`, `VenueBookingDetailSection` | seed bookings | Переговорный поток; причина отклонения; next actor. **Решения D-04, D-05** | Прошлая бронь не confirm; reject требует reason | 3, 5 |
| 11 | Дубли счетов / двойной резерв 520000 | `/account/organizer/payments`, `/account/*/payments`, `/deals/deal-1` | `OrganizerPaymentsPanel`, `PaymentsPanel`, `VenuePaymentsPanel` | `pay-1` reserve 520000 + `opay-7` тот же резерв; похожие 45k/180k | Номер счёта, payer/payee, объект; развести к получению / к оплате. **Решение D-06, D-08** | Нет визуального дубля без объяснения | 4 |
| 12 | Площадка/даты события ≠ бронирования | `/account/organizer/create-event`, `edit-event` | `organizer-event-form-section.tsx` (select площадки + пустые монтаж/демонтаж) vs bookings | `organizerEventDraft` vs `bookings` | Booking = source of truth для площадки и периодов | После согласования форма = бронь | 4 |
| 13 | «Сначала создайте мероприятие» при 12 событиях | `/account/organizer/venues` | `OrganizerVenuesSection` смотрит `organizerEventDraft`, не `SEED_EVENTS` | draft persist vs 12 seed events | Обязательный event context / селектор события | Список площадок с выбранным event | 5 |
| 14 | Заказы площадки и организатора смешаны, несколько → deal-1 | `/account/venue/orders`, `/account/organizer/orders` | `EventOrdersPanel` | `SEED_EVENT_ORDERS` | Тип заказа, направление на карточке, next step, свой ID | Карточка читается без открытия deal | 4 |
| 15 | «Выйти» vs демо-меню; Back в кабинет | кабинеты | `AppShell` вызывает `logout()` + `/login`; close drawer без имени; `DemoMenu` отдельно; persist | `auth-storage` | Сессия очищена; Back без auth не гидратит кабинет. **Полная защита только с сервером/httpOnly**. Демо-переключатель оставить отдельно | Logout → login; Back; drawer a11y | 2, 8 |
| 16 | `/register?role=` теряет роль | `/register?role=*` | `register/page.tsx`: init читает `role`, `useLayoutEffect` сбрасывает `createEmptyRegistrationForm()` и `step=0` | searchParams + draft | Сохранить роль, показать «Вы регистрируетесь как…» | Четыре query роли видны на первом экране | 6 |
| 17 | «Связаться с площадкой» → `/register` у авторизованного | `/venues/[id]` | `venue-detail-section.tsx` Link `/register` | `useAuthStore` не учитывается | Чат/запрос или объяснение нужной роли; гость → login + return | Customer не попадает на register | 6 |
| 18 | «Разместить заявку» во всех ролях | глобальная шапка | `public-header.tsx` | `isAuthenticated` без роли | CTA только для заказчика или явный switch роли. **Решения D-01, D-02** | Contractor не видит клиентский primary CTA | 6 |
| 19 | Дашборд исполнителя показывает чужие услуги | `/account/contractor` | `ContractorDashboardSection` фильтр `service.contractorId !== contractorId` | `state.services` | Переименовать или заменить на «Мои услуги» | Нет чужого каталога без ярлыка | 6 |
| 20 | Пустая форма услуги + 100% предоплата | `/account/contractor/services` | `contractor-service-form-modal.tsx` (`prepaymentPercent: 100`, «Добавить» без disable) | store services | Валидация; осознанная оплата; draft/moderation/published | Пустое сохранение запрещено | 6 |
| 21 | Загрузка залов ≠ свободная площадь | `/account/venue/halls` | `VenueHallsSection`, `getVenueStats`, `OccupancyCalendar` | `SEED_HALLS`, bookings | Формула + период; полный набор полей зала | Метрики согласованы и подписаны | 6 |
| 22 | `Организатор ID: user-organizer`, «тестовый режим» в контенте | `/events/[id]` | `events/[id]/page.tsx` | `event.organizerId` | Скрыть внутренние id; один banner прототипа | Нет `user-organizer` в бизнес-блоке | 7 |
| 23 | Смешение терминов и EN-статусы | списки документов/оплат/сделок | `DocumentsPanel`, finance panels, `statuses.ts` | EN `status` в seed | Словарь + русские labels + next actor. **Контракт этапа 1** | Нет `signed`/`pending` как UI-текста | 1, 7 |
| 24 | «Как работает» — тексты чужого финтех-продукта | `/` | `HOME_HOW_IT_WORKS_STEPS` в `home-content.ts`; страница `/how-it-works` уже про маркетплейс | константы vs `how-it-works/page.tsx` | Переписать 4 шага под выставку; сверить со `/how-it-works` | Главная не про «блокировку карт» | 7 |
| 25 | Юр. ссылки footer → `/how-it-works` | все страницы с footer | `footer.tsx` | нет отдельных страниц | Отдельные страницы или «недоступно» | Три ссылки не маскируют одну | 7 |
| 26 | Мобильное меню: close без имени, фон активен | кабинеты, viewport mobile | `app-shell.tsx` кнопка `<X>` без `aria-label`; overlay click | — | `aria-label="Закрыть меню"`, focus trap, inert background | Keyboard/AT close + return focus | 8 |
| 27 | Label не связан с input; нет единого save/dirty | профили, настройки, формы | `Input`/`Select` usage в settings/profile/wizard | — | htmlFor/id, required/error, saved + dirty prompt | Каждое поле имеет доступное имя | 8 |
| 28 | Повторы fixtures, иерархия, опечатки | `/`, каталоги, дашборд | home blocks, catalogs; в дашборде уже «Рекомендованные» (опечатка аудита могла быть исправлена) | seed repeats | Разнообразить fixtures; вычитка | Нет серий-клонов в одном блоке | 7 |
| 29 | «Мои мероприятия» без основания и CTA | `/account/customer/my-events` | `customer-my-events-section.tsx` | deals/requests/events | Причина связи + next action | Каждая строка: основание + CTA | 6 |

---

## 4. Системные проблемы аудита (не из 29, но блокируют модель)

| Системная | Код | Этап | Комментарий |
|---|---|---|---|
| Нет единого слоя авторизации | S1 | 1–2 | Guards размазаны по page/effects/filters |
| Нет state machine | S2 | 1, 3 | Статус и дата живут отдельно |
| Нет канонической модели объектов | S3 | 1, 4 | `deal-1` как универсальная заглушка |
| Нет владельца следующего шага | S4 | 1, 3 | Статус без `nextActor`/`deadline` |
| Шаблоны без адаптации | S5 | 5 | одно ТЗ |
| Финансы без зеркальности | S6 | 1, 4 | reserve/invoice/payout рядом |
| Демо-даты оторваны от «сейчас» | S7 | 3 | нет `NOW` |
| IA = списки, не очереди работы | S8 | 6 | нет inbox «требует меня» |

---

## 5. Где нужна серверная защита

Эти проверки **нельзя** считать закрытыми frontend-фильтром. Для production нужен backend (маршрут, чтение, mutation):

- №1 кабинеты и любые `/account/*`, `/deals/*`, `/messages/*`, `/documents`, `/payments`
- №2 документы и подпись
- №7 отклик и чтение закрытых заявок
- №15 сессия / Back / persist
- Любые изменения статусов сделок, броней, оплат
- Настройки сотрудников (сейчас UI-only)

**Демонстрационная frontend-защита (допустимый потолок прототипа):** единый mock authorization adapter на этапе 2; явная пометка «не security boundary». Сейчас проверки размазаны и неполны.

---

## 6. Решения, которые требуют подтверждения

Не фиксировать в коде как постоянную бизнес-логику (playbook §5). На этапе 1 вынести в `docs/product-model/open-decisions.md`.

| ID | Вопрос | Блокирует |
|---|---|---|
| D-01 | Несколько ролей у одного пользователя? | №18, этап 2 IA кабинетов |
| D-02 | Контекст переключается целиком или роли параллельны? | №1, №18 |
| D-03 | Корзина vs прямой заказ vs заявка | №8 |
| D-04 | Кто юридически бронирует площадку | №9, №10, №12 |
| D-05 | Когда бронь становится резервом | №10, оплаты |
| D-06 | Плательщик / получатель / агент платформы | №11, финансы |
| D-07 | Какие документы видит сторона и кто подписывает | №2 |
| D-08 | Комиссия, резерв, возврат, выплата | №11 |
| D-09 | Категории и регионы доступности заявки | №7 |
| D-10 | Что продлевается после дедлайна | №3, recovery |

Временный безопасный вариант (только как гипотеза этапа 1, не внедрять без команды): одна активная роль на сессию; бронь организатора; корзина только для priced catalog; заявки исполнителю по пересечению категории **или** явная пометка «вне профиля».

---

## 7. Что блокирует следующие этапы

| Блокер | Почему | Следствие |
|---|---|---|
| Нет backend | ACL и сессия только в браузере | Этап 2 может дать **демо-слой**, не production security |
| Нет контрактов этапа 1 | Словарь, permission matrix, state machines, связи ID не зафиксированы | Этап 2+ будет угадывать бизнес-правила |
| Открытые D-01…D-10 | Особенно мульти-роль, бронь, оплаты, категории | Нельзя честно закрыть №7, №8, №10–12 |
| Нет тестового каркаса | Playwright установлен, тестов нет | Приёмочные тесты этапа 2 нужно заводить с нуля |
| Persist merge seed | Старые localStorage могут маскировать правки fixtures | Этап 3 (даты) потребует стратегии сброса persist |
| `deal-1` / venueId на чужих документах | Целостность данных | Этап 4 бесполезен до нормализации ID |

**Этап 2 выполнен** (демо-RBAC): адаптер `src/lib/auth/authorization.ts`, 403 на чужой кабинет/сделку, ACL документов по сторонам, CTA роли, `npm test`. Backend нет — не production security.

**Этап 3 выполнен** (ID, связи, fixtures, clock): `eord-2`/`eord-4` больше не ведут в `deal-1`; маршрут `/orders/[id]`; бронирования — источник дат события; persist overlay seed; `NOW=2026-09-23`.

**Этап 4 выполнен** (state machines): `src/lib/state/*`, баннер статуса, next actor, дедлайн, блокировка и recovery; переходы режутся в store. Этап 5 не начат.

---

## 8. Baseline проверок (этап 0)

Прогон 23.09.2026 в `Exhibition-black-and-white/`. Эти ошибки **уже существовали** и на этапе 0 не исправлялись.

| Команда | Результат |
|---|---|
| `npm run lint` | Fail: **18 errors, 29 warnings** |
| `./node_modules/.bin/tsc --noEmit` | **Pass** (отдельного npm-script нет; `npx tsc` без локального бинаря подхватил бы чужой пакет) |
| `npm run build` | **Pass** (Next.js 16.2.10 Turbopack; 22 маршрута) |
| tests | нет команды и нет файлов |

### Lint errors (существующие, не от этапа 0)

- `src/app/cart/page.tsx` — условный `useMemo` (rules-of-hooks)
- `src/app/events/[id]/booking/page.tsx` — `Date.now()` (react-hooks/purity)
- `src/app/events/[id]/page.tsx` — preserve-manual-memoization
- `src/app/register/page.tsx` — setState в effect (связан с потерей `?role=`, №16)
- `src/components/organizer/organizer-event-form-section.tsx` — setState в effect
- `src/components/organizer/organizer-event-participants-section.tsx` — условный hook
- `src/components/organizer/organizer-event-recommended-partner-modal.tsx` — setState в effect
- `src/components/ui/searchable-select.tsx` — setState в effect
- `src/components/venue/venue-halls-section.tsx` / `venue-spaces-section.tsx` — preserve-manual-memoization
- плюс unused-vars и jsx-a11y warnings (в т.ч. изображения без alt)

Не относить эти ошибки к будущим диффам этапов 1–8, если файлы не менялись.

---

## 9. Готовность к этапу 1

Готово как вход этапа 1:

- карта 29 пунктов;
- инвентарь сущностей и прав;
- список open decisions;
- понимание frontend-only ограничения.

Не делать на этапе 1: правки UI, RBAC в коде, правки seed, кроме документирования.
