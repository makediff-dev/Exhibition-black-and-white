# Машины состояний

Доказательства: playbook §6.3–6.4; аудит №3, 10, 23, системные 2/4/7; `DealStatus`, `RequestStatus`, `Booking.status` в типах; labels в `statuses.ts`.

Переходы **централизованы**. Компонент не решает, что просроченный объект активен. Нужны часы прототипа (`NOW`) — этап 3. **TEMPORARY:** `NOW = 2026-09-23` (дата аудита), пока нет решения «катить даты vs фиксировать clock».

Общий контракт UI: `ActionableStatus` (playbook §6.3).

Ниже: **целевой** жизненный цикл. Колонка «Сейчас» — дыра в коде. Спорные ветви — D-05, D-08, D-10.

---

## 1. Заявка (`request`)

**Сейчас:** `draft → published → in_progress → completed`. Нет collecting / expired / cancelled.

**Цель:**

`draft → published → collecting_proposals → contractor_selected → converted_to_order → completed`

Ветви: `expired`, `cancelled`, `archived`.

Пока в TypeScript нет новых кодов, UI может маппить:

- `published` + есть срок и нет выбранного отклика → показывать как сбор откликов;
- `in_progress` → выбран исполнитель / есть deal;
- дата `responseDeadlineAt` или `deadline` < NOW и нет accepted proposal → `expired` (вычисляемый, затем отдельный код).

| code | label | Кто видит | nextActor | deadline | Можно | Нельзя | Recovery |
|---|---|---|---|---|---|---|---|
| `draft` | Черновик | Автор-заказчик | customer | — | edit, publish, delete | отклики | — |
| `published` / `collecting_proposals` | Сбор откликов | Автор; подходящие исполнители | contractors | `responseDeadlineAt` | customer: close, cancel, compare; contractor: submit_proposal | действия после дедлайна | продлить / переоткрыть / копировать (D-10) |
| `contractor_selected` | Исполнитель выбран | Стороны заявки и выбранный contractor | customer или система → создать order/deal | срок акцепта КП | создать заказ, отказаться | новые отклики | выбрать другого, если не создан заказ |
| `converted_to_order` | Переведена в заказ | Стороны | см. заказ/сделка | — | открыть заказ | публиковать снова | — |
| `completed` | Завершена | Стороны | null | — | archive, copy | edit существа | copy as new |
| `expired` | Срок отклика истёк | Автор | customer | прошедший deadline | только recovery | Откликнуться, «в работе» | D-10: продлить срок / переоткрыть / копировать |
| `cancelled` | Отменена | Автор | null | — | archive | любые рабочие | copy |
| `archived` | В архиве | Автор | null | — | view, copy | mutate | copy |

Запрещено: кнопка «Откликнуться» на expired; статус «В работе» без выбранного исполнителя или заказа.

---

## 2. Отклик (`proposal` / код `Response`)

**Сейчас:** `pending | accepted | rejected`.

**Цель:** `draft → submitted → viewed → shortlisted → accepted` + `rejected`, `withdrawn`, `expired`.

Минимальный маппинг для прототипа без расширения enum (TEMPORARY):

- форма до отправки = `draft` (ещё нет записи или локальный state);
- `pending` = `submitted` (+ viewed/shortlisted не хранить, пока нет полей);
- `accepted` / `rejected` как есть;
- `validUntil` < NOW и pending → `expired`.

| code | label | Видят | nextActor | deadline | Можно | Нельзя | Recovery |
|---|---|---|---|---|---|---|---|
| `draft` | Черновик | Автор-исполнитель | contractor | — | edit, submit | заказчик не видит | удалить |
| `submitted` (`pending`) | На рассмотрении | Автор + заказчик заявки | customer | `validUntil` | customer: accept/reject/shortlist; contractor: withdraw | submit пустых цены/подхода | доработать до дедлайна |
| `accepted` | Выбран | Стороны | customer → создать order/deal | — | открыть заказ | принять второго без отмены первого | снять выбор до конвертации |
| `rejected` | Отклонён | Стороны | contractor (узнать) | — | view | edit цены | новый отклик только если заявка ещё собирает |
| `withdrawn` | Отозван | Стороны | customer | — | view | accept | подать заново до дедлайна |
| `expired` | Срок КП истёк | Стороны | customer | `validUntil` | view | accept | новый отклик, если заявка жива (D-10) |

Accept одного отклика отклоняет остальные **или** оставляет их видимыми как «не выбран» — TEMPORARY: остальные → `rejected` с причиной «выбран другой».

---

## 3. Бронирование (`booking`)

**Сейчас:** `pending | confirmed | rejected` + `periodType` setup/event/teardown.

**Цель (сжато под прототип, полный playbook длиннее):**

`draft → sent → venue_review → accepted → awaiting_contract_or_payment → reserved → active → completed`

Ветви: `changes_requested`, `rejected` (причина обязательна), `expired`, `cancelled`.

TEMPORARY D-04/D-05: подтверждение площадки **не** создаёт денежный резерв. Резерв — после счёта и оплаты/hold (этап 4). `confirmed` сегодня = согласие площадки, не «оплачено».

| code | label | Видят | nextActor | deadline | Можно | Нельзя | Recovery |
|---|---|---|---|---|---|---|---|
| `draft` | Черновик | Заявитель (organizer или customer по D-04) | заявитель | hold ячейки | edit, send | confirm площадкой | удалить, освободить ячейку |
| `sent` / `pending` | Ожидает площадку | Заявитель + площадка | venue | срок ответа | venue: accept, reject+reason, propose dates; заявитель: cancel | оплата как будто бронь есть | истечение → expired, ячейка free |
| `changes_requested` | Нужны другие даты/зал | Стороны | заявитель | срок ответа | принять альтернативу, отказаться | confirm старой ячейки | новый период |
| `accepted` (`confirmed` без оплаты) | Площадка согласилась | Стороны | заявитель / система | срок договора/оплаты | выставить счёт, подписать | «активна» в прошлом без дат | cancel по правилам |
| `awaiting_contract_or_payment` | Ждём договор или оплату | Стороны | payer (D-06) | due date счёта | оплатить, спор | начать монтаж | продлить счёт / отменить |
| `reserved` | Резерв площади | Стороны | venue готовит событие | периоды | смотреть условия | confirm повторно | cancel → refund по D-08 |
| `active` | Идёт период | Стороны | null или venue ops | periodEnd | закрыть по факту | reject | — |
| `completed` | Завершено | Стороны | null | — | документы | confirm/reject | — |
| `rejected` | Отклонено | Стороны | заявитель | — | выбрать другие даты | confirm | новый запрос |
| `expired` | Срок ответа/оплаты истёк | Стороны | заявитель | прошедший | recovery | confirm прошедшего | новые даты |
| `cancelled` | Отменено | Стороны | null | — | view | mutate | новый запрос |

Карточка **всегда** показывает: «Ждём площадку» или «Ждём организатора/заказчика», цену/зал/периоды, причину reject.

Прошедший `periodEnd` при `pending` → нельзя confirm; только reject/archive + причина «период прошёл».

---

## 4. Заказ (`order` / сейчас `EventOrder`)

Типы не смешиваются в одной карточке-заглушке: `space_booking`, `passes`, `accreditation`, `stand_build`, `venue_service`, `other`.

Статус заказа **не обязан** копировать `DealStatus`. TEMPORARY: пока `EventOrder.status` пересекается с `DealStatus` — показывать label сделки только если `type === stand_build` и есть свой `dealId`. Для пропуска/аренды — статусы заказа: `draft | sent | awaiting_counterparty | awaiting_payment | in_progress | completed | cancelled`.

| type | Источник истины периода/места | Сделка `deal` |
|---|---|---|
| `space_booking` | `booking` (+ ячейка/зал) | Нет, кроме отдельного договора аренды (не `deal-1` стенда) |
| `passes` / `accreditation` | сам заказ + event | Нет |
| `stand_build` | `request`/`proposal` → `deal` | Свой `deal.id` |
| `venue_service` | заказ + venue service | Нет по умолчанию |

На карточке обязательно: направление «Вы продаёте / Вы покупаете», контрагент, next step, срок. Аудит №14.

---

## 5. Сделка (`deal`) — только исполнение заказа услуг (стенд и аналоги)

**Сейчас в коде:**  
`negotiation | awaiting_payment | funds_reserved | in_progress | stage_review | needs_revision | stage_accepted | awaiting_payout | completed | dispute`

**Цель playbook:** negotiation → awaiting_contract → awaiting_payment → reserved/in_progress → submitted_for_acceptance → accepted → payout → completed  
+ `changes_requested`, `disputed`, `cancelled`, `refunded`.

Маппинг кода → цель:

| code | label | nextActor | Можно | Нельзя | Recovery |
|---|---|---|---|---|---|
| `negotiation` | Согласование | обе стороны | согласовать этапы, перейти к договору | резерв денег | отмена |
| `awaiting_payment` | Ожидает оплаты | customer (payer) | оплатить / выставить | работа как «в процессе» без денег | отмена, новый счёт |
| `funds_reserved` | Средства зарезервированы | contractor | начать этап | выплата до приёмки этапа | спор / возврат D-08 |
| `in_progress` | В работе | contractor | сдать этап | закрыть сделку | — |
| `stage_review` | Этап на проверке | customer | принять / на доработку | выплата всего | — |
| `needs_revision` | Нужны исправления | contractor | сдать снова | принять пустое | — |
| `stage_accepted` | Этап принят | система / payout | выплата этапа | — | — |
| `awaiting_payout` | Ожидается выплата | платформа / finance demo | выплатить | работа заново | — |
| `completed` | Завершена | null | отзыв, документы | этапы | — |
| `dispute` | Спор | moderator/demo | документы спора | обычная приёмка | решение спора |

`awaiting_contract` в коде нет — TEMPORARY: показывать внутри `negotiation`, если нет подписанного договора по `deal.documents`.

Один `deal.id` = один заказ услуг. Нельзя навешивать пропуска и аренду на `deal-1`.

---

## 6. Счёт и платёж

Развести в модели (этап 4 в данных):

| Сущность | Статусы цель | Не путать |
|---|---|---|
| `invoice` | `draft → sent → awaiting_payment → paid \| overdue \| cancelled \| refunded` | Резерв |
| `payment` | `initiated → reserved \| captured \| paid_out \| refunded \| failed` | Номер счёта |

Сейчас один `Payment.status`: pending / paid / reserved / refunded.  
TEMPORARY отображение: `type === "Счёт к оплате"` → как invoice; `"Резерв"` / `"Выплата"` → как payment. У каждого уникальный `number`. Зеркальная проводка — две записи с общим `ledgerPairId`, разные `direction`, не два независимых начисления (аудит №11).

`pay-1` и `opay-7` — один резерв 520000, два ID. В модели: одна проводка + опциональное зеркало, не два reserve.

---

## 7. Документ

| code | label | nextActor | Можно | Нельзя |
|---|---|---|---|---|
| `draft` | Черновик | автор-сторона | edit, send | sign как финал |
| `sent` | Отправлен | вторая сторона | sign, reject | скрытый sign |
| `signed` | Подписан | null | archive, download | edit тела |
| `archived` | В архиве | null | view | sign |

В UI никогда не показывать сырой `signed`/`sent`.

---

## 8. Мероприятие (`event`)

Минимально для согласования с бронью (аудит №12):

| Поле | Источник истины после согласования брони |
|---|---|
| Площадка (`venueId`, имя) | Подтверждённая `booking` (не select в форме) |
| Даты монтажа / проведения / демонтажа | `booking.periodStart/End` по `periodType` |
| Даты события в карточке | Проведение; монтаж/демонтаж read-only с брони |

До первой брони организатор может держать черновые даты в `event`. После `booking.accepted+` правка — только change request (новая бронь / changes_requested).

Публичный статус: не показывать `organizerId` (аудит №22). Тест-режим — один banner прототипа, не бейдж в бизнес-карточке.

---

## 9. Просрочка (аудит №3, системная 7)

Любой объект с датой:

1. Вычислить phase: `upcoming | active | overdue | completed | archived`.
2. Если overdue — `allowedActions` пустой кроме `recoveryActions`.
3. Показать banner причины.

Fixtures этапа 3 должны содержать: empty, overdue, rejected, cancelled, partial, 403.

---

## 10. Кто действует следующим (системная 4)

Запрещён статус без пары `(nextActor, deadline | null)`. Если nextActor = null и объект не терминальный — ошибка модели, не «просто список».
