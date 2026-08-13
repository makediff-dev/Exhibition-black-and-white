"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { STAGE_STATUS_LABELS } from "@/constants/statuses";
import type { DealStage, ProjectTimelineRow } from "@/data/types";

const STATUS_OPTIONS = (Object.keys(STAGE_STATUS_LABELS) as DealStage["status"][]).map((value) => ({
  value,
  label: STAGE_STATUS_LABELS[value],
}));

interface ProjectTimelineRowModalProps {
  open: boolean;
  dealId: string | null;
  dealTitle?: string;
  onClose: () => void;
  onSave: (row: ProjectTimelineRow) => void;
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDaysIsoDate(isoDate: string, days: number): string {
  const date = new Date(isoDate);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function ProjectTimelineRowModal({
  open,
  dealId,
  dealTitle,
  onClose,
  onSave,
}: ProjectTimelineRowModalProps) {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(todayIsoDate());
  const [endDate, setEndDate] = useState(addDaysIsoDate(todayIsoDate(), 7));
  const [status, setStatus] = useState<DealStage["status"]>("pending");

  useEffect(() => {
    if (!open) return;
    const start = todayIsoDate();
    setTitle("");
    setStartDate(start);
    setEndDate(addDaysIsoDate(start, 7));
    setStatus("pending");
  }, [open]);

  const handleSave = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle || !dealId) return;

    const safeStart = startDate <= endDate ? startDate : endDate;
    const safeEnd = endDate >= startDate ? endDate : startDate;

    onSave({
      id: `timeline-${Date.now()}`,
      dealId,
      title: trimmedTitle,
      startDate: safeStart,
      endDate: safeEnd,
      status,
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Добавить строку"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            Добавить
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {dealTitle && (
          <p className="text-sm text-gray-600">
            Проект: <span className="font-medium text-gray-900">{dealTitle}</span>
          </p>
        )}
        <Input
          label="Название"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Например, Согласование чертежей"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Дата начала"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
          <Input
            label="Дата окончания"
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </div>
        <Select
          label="Статус"
          value={status}
          onChange={(event) => setStatus(event.target.value as DealStage["status"])}
          options={STATUS_OPTIONS}
        />
      </div>
    </Modal>
  );
}
