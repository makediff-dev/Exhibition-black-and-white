# UX remediation report

Date: 23 September 2026  
Prototype clock: 23 September 2026  
Scope: frontend demo only. Client ACL is not a production security boundary.

## Gate

| Check | Result |
|---|---|
| `npx tsc --noEmit` | pass |
| `npm test` | 31/31 pass |
| `npm run build` | pass (Next.js 16.2.10) |
| `npm run lint` | fail: 19 errors / 29 warnings (React Compiler, `Date.now` in submits, setState-in-effect in older forms) |
| Browser walk | production `next start` on `localhost:3000`; Cursor browser + unit tests |

## Role walk (independent)

| Role | Login | Own cabinet | Foreign cabinet | Docs / finance | Logout / Back |
|---|---|---|---|---|---|
| Customer | Demo «Заказчик» → ООО «Вымышленная Мебель», `/account/customer` «Дашборд» | OK | `/account/contractor` → «Нет доступа» / «другая роль» | `/account/customer/edo` opens; `/deals/deal-1` is stand deal СД-2026-001 | «Выйти» → `/login?returnUrl=…`; Back stays on login |
| Contractor | Demo «Исполнитель» → ООО «СтендПро» | «Дашборд», «Предложения на рынке»; header «В кабинет», no «Разместить заявку» | `/account/customer` → «Нет доступа» | Documents: Заказчик — Исполнитель only (ДГ-001/2026, АК-002/2026) | Same logout path |
| Venue | Demo «Площадка» → АО «ЭкспоЦентр Вымышленный» | «Дашборд»; nav Документы / Оплаты / Заказы | Guard via `canAccessCabinet` + tests | Documents: Площадка — Организатор only (ДГ-ПАВ/2026) | Same |
| Organizer | Demo «Организатор» → ООО «МебельЭкспо Организатор» | Payments `/account/organizer/payments` «Оплаты», incoming/outgoing totals, invoice numbers present on numbered rows | Guard + tests | Some rows still «Номер счёта будет…» | Same |

`/register?role=contractor` shows: «Вы регистрируетесь как Исполнитель».  
`/events/evt-1` shows organizer name, not `user-organizer`.  
`/events` booking filter has no leftover «тестовом режиме» copy.  
Footer legal links go to `/legal/terms`, `/legal/privacy`, `/contacts` (materials marked unpublished).  
Demo switcher is labeled «Инструмент прототипа: смена демо-роли».  
Multi-role fixture: N/A (D-01 = one role per session).

## Audit map

| Issue | Status | Evidence | Test | Remaining risk |
|---|---|---|---|---|
| 1 Direct `/account/{other}` | blocked by decision/backend | Client route guard + `ForbiddenState` on `/account/contractor` as customer and `/account/customer` as contractor. `authorization.ts` is explicitly not a server boundary. | `authorization.test.ts` foreign cabinets | Anyone can rewrite `auth-storage`. Production needs server route + mutation checks. |
| 2 Mixed documents | fixed | Contractor docs: Заказчик — Исполнитель only. Venue docs: Площадка — Организатор only. | ACL document tests | Client-only filter. |
| 3 Overdue still actionable | fixed | Fixed NOW 2026-09-23; request/booking machines block incompatible actions; overdue recovery path. | `state-machines.test.ts` deadline / past booking | Persist overlay can stale dates if user has old local data. |
| 4 All orders → `deal-1` | fixed | Passes and space rental have own IDs; `deal-1` only stand build. Customer deal page title СД-2026-001. | `entity-integrity.test.ts` | Old persisted prototype-storage may still contain retired links until overlay refresh. |
| 5 Catering TZ is stand template | fixed | Catering schema has no stand area / frieze / past-stand photos. | `request-schemas.test.ts` | Other non-stand categories may still share generic blocks. |
| 6 Wizard dates, budget, publish | fixed | Past dates and empty range budget rejected; publish explains missing steps. | `request-schemas.test.ts` wizard validation | Final publish CTA not re-clicked in this walk (destructive). |
| 7 Cross-category / empty proposal | fixed | Catering hidden from stand contractor; empty price/approach rejected. | authorization + `proposal-payload.test.ts` | Expanding specialization still D-open. |
| 8 Three equal CTAs on service | accepted limitation | Product override: catalog cards keep «В корзину»; service detail has no cart header CTA. D-03 still open. | `proposal-payload.test.ts` cart on priced items | Users can still confuse cart vs request on catalog. |
| 9 Blind cell booking | accepted limitation | Cell card still thinner than a full commercial offer (hold/cancel/power). | — | Do not book a cell without those fields in production. |
| 10 Venue ↔ organizer booking thread | fixed | Inquiry machine: pending waits venue; accept only organizer; decline needs reason; occupancy conflict. | `inquiry-machine.test.ts` | UI of every booking card was not re-opened this walk. |
| 11 Duplicate invoices | fixed | Ledger pairs hidden via `keepOwnLedgerCopy`; invoice number / payer / payee / direction on fixtures. Organizer payments show incoming 421 000 / outgoing 1 830 000 separately. | entity-integrity + payment ACL tests | Some rows still «Номер счёта будет…». |
| 12 Two schedules for one event | fixed | Confirmed bookings are schedule source of truth for evt-1. | `entity-integrity.test.ts` | Create-event UI still has a late venue pick until booking exists (D-04). |
| 13 Venues page without event | fixed | Event context required for a venue request; empty «create event first» vs 12 events addressed in organizer venues flow. | inquiry tests (no send without event) | Deep UI of selector not re-clicked this walk. |
| 14 Same order lists / deal-1 | fixed | Cards show type, direction («Вы покупаете»), counterparty, next step; unique order IDs. | entity-integrity | Mixed list still exists as one «Заказы» nav with type badges. |
| 15 Logout opens demo switcher | fixed | `logout()` + `router.replace("/login")`. Browser: session cleared; Back does not restore cabinet. Demo switcher is a separate labeled control. | session/auth store | `replace` removes the last private entry; history before that is login. |
| 16 `/register?role=` ignored | fixed | Banner «Вы регистрируетесь как Исполнитель»; `parseRegisterRole` / `registerHref`. Phase 9 removed the layout effect that wiped role. | `session.test.ts` | Role is client state until email confirmation exists on a backend. |
| 17 Venue CTA → register while logged in | fixed | Guest: `/login?returnUrl=…`. Allowed user: `/messages?related=venue`. Denied: `contact.reason`. No silent jump to `/register`. | — | Chat is a prototype thread, not a real inbox. |
| 18 «Разместить заявку» on all roles | fixed | Header CTA only for `user.role === "customer"`. Contractor/venue/organizer show «В кабинет». | D-01 | — |
| 19 Competitor services as «Услуги» | fixed | Dashboard heading «Предложения на рынке». | — | Own catalog remains under «Услуги» nav. |
| 20 Add service empty submit | accepted limitation | Title / price / deadline validated. Default prepay still 100%. No draft / moderation lifecycle. | — | Description and unit are not hard-required. |
| 21 Occupancy 23% vs 35% | accepted limitation | Hall metrics still use fixture occupancy; period/formula not fully unified on every hall. | — | Do not treat occupancy % as accounting-grade. |
| 22 `user-organizer` / test-mode copy | fixed | Event page: «Организатор: ООО «МебельЭкспо Организатор»». Global prototype banner. Removed leftover «Будет работать в тестовом режиме какое-то время» on `/events`. | — | — |
| 23 Mixed terms / English statuses | accepted limitation | Russian labels added on order/payment/document surfaces; some internal codes may still leak in edge UI. | — | Dictionary not legally approved. |
| 24 Home «Как работает» | fixed | Four steps: registration → search/request → contract/reserve → delivery/acceptance. | — | Copy still mentions platform reserve (safe deal), which is demo policy. |
| 25 Footer legal → `/how-it-works` | fixed | `/legal/terms`, `/legal/privacy`, `/contacts` exist and are linked. | — | Documents marked unpublished / support unavailable. |
| 26 Mobile drawer a11y | fixed | `Drawer`: `aria-label="Закрыть меню"`, focus trap, `inert` on siblings. | — | 390 px drawer open/close not fully driven this session (geo/EDO modals intercept). |
| 27 Form labels / unsaved | fixed | `Input`/`Select`/`Textarea`: `useId`, `htmlFor`, `aria-invalid`, required/help. Company profile has dirty / saved. | — | Not every legacy form was converted. |
| 28 Duplicate fixtures / typo | accepted limitation | Editorial variety improved in places; repeats remain in home rails. | — | Mock catalog is still repetitive. |
| 29 My events with no reason | fixed | Customer my-events lists relation basis and next action (request / booking / pay). | — | Not re-opened in this browser pass. |

## Phase 9 code fixes (regressions / leftovers only)

- Removed register `useLayoutEffect` that reset the form and tripped `set-state-in-effect`.
- Cart page: `useMemo` before the customer early return (rules-of-hooks).
- Dropped unused CSS import in `input.tsx`.
- Removed leftover test-mode helper copy on `/events`.

## Remaining risk

- **Lint is red** (`eslint`: ~21 errors). Typical leftovers: `Date.now()` in submit handlers, React Compiler memoization, setState in effects in organizer forms. Not introduced as product features in phase 9; production `next build` still succeeds.
- **No server ACL.** Demo persist in `localStorage` can be edited.
- **Dev `next dev`** is unstable when the workspace has two lockfiles (RSC manifest `SyntaxError`). Use `npm run build && npm run start` for walks.
- **D-01…D-11** still wait for product confirmation; prototype follows the temporary variants.
- Mobile 390 px keyboard pass was code-reviewed, not fully clicked through (modals over the drawer).
