# Product model — этап 1

Контракт прототипа «ЭКСПО» до изменения UI. Источники: [UX-аудит](../ux-audit-prototype.md), [playbook](../cursor-ux-implementation-playbook.md), [карта этапа 0](../ux-remediation-map.md), код в `src/data/types`, `src/constants/statuses.ts`, `src/lib/utils/cabinet-scope.ts`, `src/data/mocks/seed.ts`.

| Файл | Содержание |
|---|---|
| [glossary.md](./glossary.md) | Словарь сущностей и пользовательских названий |
| [permissions.md](./permissions.md) | Роли, организации, объекты, действия |
| [state-machines.md](./state-machines.md) | Статусы, переходы, next actor, recovery |
| [entity-relations.md](./entity-relations.md) | Связи и источники истины по ID |
| [open-decisions.md](./open-decisions.md) | D-01…D-10: временный вариант и последствия |

Skill: `$product-design-and-ux`. UI и seed на этом этапе не менялись.

**Gate этапа 1:** любой экран связывается с сущностью, ролью, статусом и источником истины. Спорные правила помечены как временные до подтверждения.

**Этап 2:** демо-адаптер `src/lib/auth/authorization.ts`, 403 `ForbiddenState`, тесты `npm test`. Backend по-прежнему отсутствует — это не production security boundary.
