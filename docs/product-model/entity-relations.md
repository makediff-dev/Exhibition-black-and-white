# Связи сущностей и источники истины

Доказательства: аудит №4, 10–14; seed `deal-1`, `eord-2`, `eord-4`, `doc-*`, `pay-1`, `opay-7`; типы `Deal`, `EventOrder`, `Booking`, `Document`, `Payment`.

Правило: **у каждого пользовательского объекта свой стабильный ID**. Карточка сохраняет тип и ID при переходе. Запрещено `href = /deals/${order.dealId}` если заказ не является этой сделкой.

---

## Целевой граф

```
company (org + role)
  └── event                         // организатор
        ├── booking ── venue, hall/cell, periods
        ├── order[space_booking] ── bookingId
        ├── order[passes|accreditation]
        ├── order[venue_service]
        └── order[stand_build] ── request? ── proposal ── deal
                                              └── invoice ── payment
                                              └── document

request (customer) ── proposal* ── deal (customer + contractor)
                                   └── stages
                                   └── invoice / payment / document

service (contractor) ── cart_item? ── order/deal   // только priced catalog, D-03
```

Один ребёнок не шарит ID родителя другого типа.

---

## Обязательные ссылки

| От | Поле | К | Кратность | Источник истины |
|---|---|---|---|---|
| `proposal` | `requestId` | `request` | N:1 | заявка |
| `deal` | `requestId?` | `request` | 0..1 | заявка, если путь через отклик |
| `deal` | `customerId`, `contractorId` | org | 1:1 стороны | стороны сделки |
| `deal` | `eventId?` | `event` | 0..1 | контекст выставки, не бронь |
| `order` | `id` свой | — | 1 | **не** deal.id |
| `order` | `dealId?` | `deal` | 0..1 | только если этот заказ = эта сделка |
| `order` | `bookingId?` | `booking` | 0..1 | для `space_booking` |
| `order` | `eventId`, `venueId?` | event/venue | контекст | не подменяет booking |
| `booking` | `eventId`, `venueId` | event, venue | 1 | бронь |
| `booking` | `organizerId` / `customerId` | заявитель | 1 | D-04 |
| `event` | `venueId` после брони | venue | 0..1 | **копия с booking**, не независимый select |
| `invoice` | `orderId` или `dealId` или `bookingId` | ровно один объект | 1 | обязательство |
| `invoice` | `payerId`, `payeeId` | org | 1 | D-06 |
| `payment` | `invoiceId` | invoice | 1 (цель) | сейчас нет поля |
| `document` | `relatesTo: { type, id }` | request/deal/booking/order | 1 | не «все id сразу» |
| `document` | `partyIds[]` | org+role | ≥2 | стороны |
| `venue_inquiry` | `eventId` | event | 1 | нельзя слать без event context |

---

## Источники истины (conflict resolution)

| Вопрос | Побеждает | Не побеждает |
|---|---|---|
| Какая площадка у мероприятия после согласования | `booking` accepted+ | `event.venueId` из формы, `organizerEventDraft.selectedVenueId` |
| Периоды монтажа / проведения / демонтажа | `booking` по `periodType` | поля формы события, если пустые/другие |
| Сумма стенда | `deal.totalPrice` + этапы | повтор резерва в `opay-*` |
| Сумма аренды | `order`/`booking` quote + invoice | сделка стенда |
| Свободна ли ячейка | `floor_cell` + активные booking | локальный selected без записи |
| Видимость документа | `partyIds` | `venueId` «на всякий случай» |
| Список «мои мероприятия» заказчика | явные связи: request.eventId, booking.customerId, order, favorite | «все события из seed» |

---

## Запрещённые связи (есть в seed)

| Факт в `seed.ts` | Почему ломает | Цель |
|---|---|---|
| `eord-2` (пропуска) `dealId: "deal-1"` | Пропуска ≠ стенд СД-2026-001 | `dealId` пустой; свой `order.id` → `/orders/eord-2` или `/account/.../orders/eord-2` |
| `eord-4` (аренда 36 кв.м) `dealId: "deal-1"` | Аренда ≠ строительство | Связь `bookingId` / свой заказ; не deal-1 |
| `doc-1` parties «Заказчик — Исполнитель» + `venueId: venue-1` + `organizerId` | ACL площадки/организатора | Убрать чужие id; стороны только customer+contractor |
| `doc-9` «Площадка — Организатор» + `dealId: "deal-1"` | Договор аренды на сделке стенда | `relatesTo: booking` или order аренды |
| `pay-1` и `opay-7` оба reserve 520000 deal-1 | Двойное начисление | Один payment + зеркало с `ledgerPairId` |
| Несколько `doc-*` с одним `deal-1` и разными parties | Документ без канонического объекта | Каждый документ — к своему order/booking/deal |

---

## Маршруты деталок (цель)

| Объект | Маршрут | Сейчас |
|---|---|---|
| Заявка | `/requests/{requestId}` | есть |
| Отклик | `/requests/{requestId}/responses/{responseId}` | есть |
| Сделка услуг | `/deals/{dealId}` | есть; злоупотребляется |
| Заказ мероприятия | `/orders/{orderId}` или кабинетный slug | нет; `getOrderHref` → deal |
| Бронирование | `/account/{venue\|organizer}/bookings/{bookingId}` | частично detail секции |
| Счёт | открывать по `invoice.id`, не по сумме | список Payment без уникального бизнеса |
| Документ | остаётся в панели, фильтр по сторонам | общий список |

Пока нет `/orders/:id`, карточка заказа **не** должна вести на чужой deal. Допустимый временный экран: `/account/{role}/orders?id={orderId}` без подмены deal.

---

## Идентификаторы демо (не менять смысл)

| Префикс | Смысл |
|---|---|
| `user-*` | Профиль / org роли |
| `ctr-*` | Исполнитель каталога |
| `venue-*` | Площадка |
| `evt-*` | Мероприятие |
| `req-*` | Заявка |
| `deal-*` | Сделка услуг |
| `eord-*` | Заказ мероприятия (переименовать в `order-*` позже, не обязательно на этапе 1) |
| `doc-*` | Документ |
| `pay-*` / `opay-*` / `vpay-*` | Смесь invoice/payment |
| `book-*` | Бронирование |

Внутренние id **не** показывать в публичном UI (`user-organizer` на `/events/evt-1`).

---

## Контекст организатора → площадки (аудит №13)

`organizerEventDraft` — черновик визарда, **не** список мероприятий.

Запрос площадке требует выбранный `eventId` (seed event или созданный). Список 12 `SEED_EVENTS` организатора — валидный контекст. Empty state «Сначала создайте мероприятие» допустим только если у организатора **ноль** событий и нет черновика.

---

## Финансы: направление

| direction | Смысл для текущей org | Подпись карточки |
|---|---|---|
| `incoming` | К получению | «Вы получаете» / «Вам должны» |
| `outgoing` | К оплате | «Вы платите» |

Не показывать одну сумму дважды как два независимых долга, если это зеркало одной операции.
