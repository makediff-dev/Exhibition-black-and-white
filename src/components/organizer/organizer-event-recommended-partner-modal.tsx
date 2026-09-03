"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EVENT_PARTNER_CATEGORIES } from "@/constants/event-partner-categories";
import { SEED_CONTRACTORS } from "@/data/mocks/seed";
import type { EventPartnerCategoryId, EventRecommendedPartner } from "@/data/types";

const CONTRACTOR_OPTIONS = [
  { value: "", label: "Указать вручную (отель, партнёр без профиля)" },
  ...SEED_CONTRACTORS.map((contractor) => ({
    value: contractor.id,
    label: contractor.name,
  })),
];

const CATEGORY_OPTIONS = EVENT_PARTNER_CATEGORIES.map((category) => ({
  value: category.id,
  label: category.label,
}));

const RECOMMENDED_OPTIONS = [
  { value: "true", label: "Рекомендован" },
  { value: "false", label: "Не выбран" },
];

interface OrganizerEventRecommendedPartnerModalProps {
  open: boolean;
  eventId: string;
  categoryId: EventPartnerCategoryId | null;
  partner: EventRecommendedPartner | null;
  onClose: () => void;
  onSave: (partner: EventRecommendedPartner) => void;
}

export function OrganizerEventRecommendedPartnerModal({
  open,
  eventId,
  categoryId,
  partner,
  onClose,
  onSave,
}: OrganizerEventRecommendedPartnerModalProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<EventPartnerCategoryId>("build");
  const [contractorId, setContractorId] = useState("");
  const [customName, setCustomName] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [isRecommended, setIsRecommended] = useState("true");

  const selectedContractor = useMemo(
    () => SEED_CONTRACTORS.find((item) => item.id === contractorId),
    [contractorId]
  );

  useEffect(() => {
    if (!open) return;

    if (partner) {
      setSelectedCategoryId(partner.categoryId);
      setContractorId(partner.contractorId ?? "");
      setCustomName(partner.customName ?? "");
      setCustomDescription(partner.customDescription ?? "");
      setIsRecommended(partner.isRecommended ? "true" : "false");
      return;
    }

    setSelectedCategoryId(categoryId ?? "build");
    setContractorId("");
    setCustomName("");
    setCustomDescription("");
    setIsRecommended("true");
  }, [open, partner, categoryId]);

  const handleSave = () => {
    const trimmedCustomName = customName.trim();
    if (!contractorId && !trimmedCustomName) return;

    onSave({
      id: partner?.id ?? `erp-${Date.now()}`,
      eventId,
      categoryId: selectedCategoryId,
      contractorId: contractorId || undefined,
      customName: contractorId ? undefined : trimmedCustomName,
      customDescription: customDescription.trim() || undefined,
      isRecommended: isRecommended === "true",
    });
    onClose();
  };

  const canSave = Boolean(contractorId || customName.trim());

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={partner ? "Редактировать партнёра" : "Добавить партнёра"}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            {partner ? "Сохранить" : "Добавить"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Select
          label="Категория услуг"
          options={CATEGORY_OPTIONS}
          value={selectedCategoryId}
          onChange={(event) =>
            setSelectedCategoryId(event.target.value as EventPartnerCategoryId)
          }
        />

        <Select
          label="Исполнитель из каталога"
          options={CONTRACTOR_OPTIONS}
          value={contractorId}
          onChange={(event) => setContractorId(event.target.value)}
        />

        {!contractorId && (
          <>
            <Input
              label="Название партнёра"
              value={customName}
              onChange={(event) => setCustomName(event.target.value)}
              placeholder="Например, Отель «Экспо Инн»"
            />
            <Textarea
              label="Описание"
              value={customDescription}
              onChange={(event) => setCustomDescription(event.target.value)}
              placeholder="Партнёрский тариф, условия для участников"
            />
          </>
        )}

        {selectedContractor && (
          <div className="border border-dashed border-gray-300 p-3 text-sm text-gray-600 space-y-1">
            <p className="font-medium text-gray-900">{selectedContractor.name}</p>
            <p>
              ★ {selectedContractor.rating} · {selectedContractor.categories[0]}
            </p>
            <p>{selectedContractor.description}</p>
          </div>
        )}

        {contractorId && (
          <Textarea
            label="Дополнительное описание"
            value={customDescription}
            onChange={(event) => setCustomDescription(event.target.value)}
            placeholder="Особые условия для участников мероприятия"
          />
        )}

        <Select
          label="Статус"
          options={RECOMMENDED_OPTIONS}
          value={isRecommended}
          onChange={(event) => setIsRecommended(event.target.value)}
        />
      </div>
    </Modal>
  );
}