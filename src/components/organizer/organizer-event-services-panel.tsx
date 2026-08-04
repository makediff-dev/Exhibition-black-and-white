"use client";

import { useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ORGANIZER_EVENT_SERVICE_AUDIENCES } from "@/constants/statuses";
import type { OrganizerEventService, OrganizerServiceAudience } from "@/data/types";
import { usePrototypeStore } from "@/lib/store";

const SERVICE_TEMPLATES: Array<{
  title: string;
  audiences: OrganizerServiceAudience[];
}> = [
  { title: "Аренда площади", audiences: ["exhibitor"] },
  { title: "Электричество", audiences: ["exhibitor"] },
  { title: "Аккредитация бригады", audiences: ["contractor"] },
  { title: "Точки подвеса", audiences: ["contractor"] },
  { title: "Лебёдка / подъём", audiences: ["contractor"] },
];

interface Props {
  eventId: string;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

function getAudienceLabel(id: OrganizerServiceAudience) {
  return ORGANIZER_EVENT_SERVICE_AUDIENCES.find((item) => item.id === id)?.label ?? id;
}

export function OrganizerEventServicesPanel({ eventId, showToast }: Props) {
  const {
    organizerEventServices,
    addOrganizerEventService,
    updateOrganizerEventService,
    removeOrganizerEventService,
  } = usePrototypeStore();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [audiences, setAudiences] = useState<OrganizerServiceAudience[]>(["exhibitor"]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const services = useMemo(
    () => organizerEventServices.filter((service) => service.eventId === eventId),
    [organizerEventServices, eventId]
  );

  const toggleAudience = (id: OrganizerServiceAudience) => {
    setAudiences((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const resetForm = () => {
    setTitle("");
    setPrice("");
    setAudiences(["exhibitor"]);
    setEditingId(null);
  };

  const applyTemplate = (template: (typeof SERVICE_TEMPLATES)[number]) => {
    setTitle(template.title);
    setAudiences([...template.audiences]);
    setPrice("");
    setEditingId(null);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      showToast("Укажите название услуги", "error");
      return;
    }
    if (!price.trim()) {
      showToast("Укажите цену для этого мероприятия", "error");
      return;
    }
    if (audiences.length === 0) {
      showToast("Выберите, для кого доступна услуга", "error");
      return;
    }

    if (editingId) {
      updateOrganizerEventService(editingId, {
        title: title.trim(),
        price: price.trim(),
        audiences,
      });
      showToast("Услуга обновлена");
    } else {
      addOrganizerEventService({
        id: `osvc-${Date.now()}`,
        eventId,
        title: title.trim(),
        price: price.trim(),
        active: true,
        audiences,
      });
      showToast("Услуга добавлена");
    }

    resetForm();
  };

  const startEdit = (service: OrganizerEventService) => {
    setEditingId(service.id);
    setTitle(service.title);
    setPrice(service.price);
    setAudiences(service.audiences);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Card className="space-y-2">
        <CardTitle className="text-sm">Услуги организатора на этом мероприятии</CardTitle>
        <CardDescription>
          Цены задаются отдельно для каждого события. Экспоненты заказывают аренду и электричество,
          застройщики — аккредитацию и монтажные услуги. Услуги исполнителей — в «Заказах».
        </CardDescription>
      </Card>

      <Card className="space-y-4">
        <div>
          <CardTitle className="text-base mb-1">
            {editingId ? "Редактировать услугу" : "Добавить услугу"}
          </CardTitle>
          <CardDescription>Укажите название, цену и категорию покупателей</CardDescription>
        </div>

        {!editingId && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-600">Быстрые шаблоны</p>
            <div className="flex flex-wrap gap-2">
              {SERVICE_TEMPLATES.map((template) => (
                <Button
                  key={template.title}
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={() => applyTemplate(template)}
                >
                  {template.title}
                </Button>
              ))}
            </div>
          </div>
        )}

        <Input
          label="Услуга"
          placeholder="Аренда площади, электричество..."
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <Input
          label="Цена на это мероприятие"
          placeholder="от 50 000 ₽ / кв.м"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
        />

        <div>
          <p className="text-sm font-medium mb-2">Доступна для</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {ORGANIZER_EVENT_SERVICE_AUDIENCES.map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-2 text-sm border border-gray-300 px-3 py-2 cursor-pointer hover:border-gray-900"
              >
                <input
                  type="checkbox"
                  checked={audiences.includes(item.id)}
                  onChange={() => toggleAudience(item.id)}
                />
                {item.label}
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleSubmit}>{editingId ? "Сохранить" : "Добавить услугу"}</Button>
          {editingId && (
            <Button variant="outline" onClick={resetForm}>
              Отмена
            </Button>
          )}
        </div>
      </Card>

      <Card>
        <CardTitle className="text-base mb-4">Список услуг ({services.length})</CardTitle>

        {services.length === 0 ? (
          <p className="text-sm text-gray-600">
            Услуг пока нет — добавьте первую через конструктор выше
          </p>
        ) : (
          <div className="space-y-3">
            {services.map((service) => (
              <div
                key={service.id}
                className="border border-gray-300 p-3 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-medium text-sm">{service.title}</p>
                    <Badge variant={service.active ? "solid" : "outline"}>
                      {service.active ? "Активна" : "Скрыта"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{service.price}</p>
                  <div className="flex flex-wrap gap-1">
                    {service.audiences.map((audience) => (
                      <Badge key={`${service.id}-${audience}`} variant="outline">
                        {getAudienceLabel(audience)}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      updateOrganizerEventService(service.id, { active: !service.active })
                    }
                  >
                    {service.active ? "Скрыть" : "Активировать"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => startEdit(service)}>
                    <Pencil className="h-3.5 w-3.5" />
                    Изменить
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      removeOrganizerEventService(service.id);
                      if (editingId === service.id) resetForm();
                      showToast("Услуга удалена", "info");
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Удалить
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
