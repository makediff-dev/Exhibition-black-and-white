"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { VENUE_SERVICE_AUDIENCES } from "@/constants/statuses";
import type { VenueServiceAudience } from "@/data/types";
import { usePrototypeStore } from "@/lib/store";

interface Props {
  venueId?: string;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

const ALL_AUDIENCES = VENUE_SERVICE_AUDIENCES.map((item) => item.id);

function getAudienceLabel(id: VenueServiceAudience) {
  return VENUE_SERVICE_AUDIENCES.find((item) => item.id === id)?.label ?? id;
}

export function VenueServicesSection({ venueId = "venue-1", showToast }: Props) {
  const { venueServices, addVenueService, updateVenueService, removeVenueService } =
    usePrototypeStore();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [audiences, setAudiences] = useState<VenueServiceAudience[]>([...ALL_AUDIENCES]);

  const services = useMemo(
    () => venueServices.filter((service) => service.venueId === venueId),
    [venueServices, venueId]
  );

  const toggleAudience = (id: VenueServiceAudience) => {
    setAudiences((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const resetForm = () => {
    setTitle("");
    setPrice("");
    setAudiences([...ALL_AUDIENCES]);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      showToast("Укажите название услуги", "error");
      return;
    }
    if (!price.trim()) {
      showToast("Укажите цену", "error");
      return;
    }
    if (audiences.length === 0) {
      showToast("Выберите хотя бы одну категорию участников", "error");
      return;
    }

    addVenueService({
      id: `vs-${Date.now()}`,
      venueId,
      title: title.trim(),
      price: price.trim(),
      active: true,
      audiences,
    });
    showToast("Услуга добавлена");
    resetForm();
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Card className="space-y-4">
        <div>
          <CardTitle className="text-base mb-1">Конструктор услуги</CardTitle>
          <CardDescription>
            Укажите название, цену и выберите, для каких категорий участников услуга доступна
          </CardDescription>
        </div>

        <Input
          label="Услуга"
          placeholder="Wi-Fi, парковка, клининг..."
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <Input
          label="Цена"
          placeholder="от 5000 ₽"
          value={price}
          onChange={(event) => setPrice(event.target.value)}
        />

        <div>
          <p className="text-sm font-medium mb-2">Доступна для</p>
          <div className="grid sm:grid-cols-2 gap-2">
            {VENUE_SERVICE_AUDIENCES.map((item) => (
              <label
                key={item.id}
                className="cabinet-chip flex items-center gap-2 text-sm border border-gray-300 px-3 py-2 cursor-pointer hover:border-gray-900"
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
          <p className="text-xs text-gray-500 mt-2">
            Например: пропуск на авто доступен всем, включая физлиц; складские услуги — всем,
            кроме физлиц.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleSubmit}>Добавить</Button>
        </div>
      </Card>

      <Card>
        <CardTitle className="text-base mb-4">Список услуг площадки</CardTitle>

        {services.length === 0 ? (
          <p className="text-sm text-gray-600">Услуг пока нет — добавьте первую через конструктор</p>
        ) : (
          <div className="space-y-3">
            {services.map((service) => (
              <div
                key={service.id}
                className="cabinet-card border border-gray-300 p-3 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-medium text-sm">{service.title}</p>
                    <Badge variant={service.active ? "solid" : "muted"}>
                      {service.active ? "Активна" : "Неактивна"}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{service.price}</p>
                  <div className="flex flex-wrap gap-1">
                    {service.audiences.map((audience) => (
                      <Badge key={`${service.id}-${audience}`} variant="muted">
                        {getAudienceLabel(audience)}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="px-2 text-gray-900"
                    onClick={() =>
                      updateVenueService(service.id, { active: !service.active })
                    }
                  >
                    {service.active ? "Скрыть" : "Активировать"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="px-2 text-gray-900"
                    onClick={() => {
                      removeVenueService(service.id);
                      showToast("Услуга удалена", "info");
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-600" />
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