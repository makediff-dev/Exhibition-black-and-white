"use client";

import { useState } from "react";
import { Eye, EyeOff, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import type { TorSection } from "@/data/types";
import { cn } from "@/lib/utils/cn";

const DEFAULT_SECTIONS: TorSection[] = [
  { id: "tor-1", title: "Общие требования", content: "", required: true },
  { id: "tor-2", title: "Технические параметры", content: "", required: true },
  { id: "tor-3", title: "Сроки и этапы", content: "", required: false },
];

const TEMPLATES: { id: string; label: string; sections: TorSection[] }[] = [
  {
    id: "stand",
    label: "Строительство стенда",
    sections: [
      { id: "t1", title: "Площадь и планировка", content: "Укажите площадь, зоны, высоту", required: true },
      { id: "t2", title: "Материалы и отделка", content: "Предпочтительные материалы, цвета бренда", required: true },
      { id: "t3", title: "Монтаж и демонтаж", content: "График монтажа, доступ на площадку", required: false },
    ],
  },
  {
    id: "design",
    label: "Дизайн-проект",
    sections: [
      { id: "d1", title: "Концепция", content: "Стиль, референсы, ограничения", required: true },
      { id: "d2", title: "Deliverables", content: "3D, чертежи, спецификация", required: true },
    ],
  },
];

function newSection(): TorSection {
  return {
    id: `tor-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: "",
    content: "",
    required: false,
  };
}

interface TorConstructorProps {
  sections: TorSection[];
  onChange: (sections: TorSection[]) => void;
  onDraftSave?: () => void;
  mode?: "constructor" | "template" | "upload" | "urgent";
  onModeChange?: (mode: "constructor" | "template" | "upload" | "urgent") => void;
  uploadedFiles?: string[];
  onFilesChange?: (files: string[]) => void;
}

export function TorConstructor({
  sections,
  onChange,
  onDraftSave,
  mode = "constructor",
  onModeChange,
  uploadedFiles = [],
  onFilesChange,
}: TorConstructorProps) {
  const [preview, setPreview] = useState(false);

  const applyTemplate = (templateId: string) => {
    const template = TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      onChange(template.sections.map((s) => ({ ...s, id: newSection().id })));
    }
  };

  const updateSection = (id: string, updates: Partial<TorSection>) => {
    onChange(sections.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const removeSection = (id: string) => {
    onChange(sections.filter((s) => s.id !== id));
  };

  const addSection = () => {
    onChange([...sections, newSection()]);
  };

  const initDefault = () => {
    if (sections.length === 0) onChange(DEFAULT_SECTIONS.map((s) => ({ ...s, id: newSection().id })));
  };

  const requiredFilled = sections
    .filter((s) => s.required)
    .every((s) => s.title.trim() && s.content.trim());

  return (
    <div className="space-y-4">
      {onModeChange && (
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "constructor", label: "Конструктор" },
              { id: "template", label: "Шаблон" },
              { id: "upload", label: "Загрузка файла" },
              { id: "urgent", label: "Краткая форма" },
            ] as const
          ).map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => onModeChange(m.id)}
              className={cn(
                "px-3 py-1.5 text-xs border",
                mode === m.id ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 hover:border-gray-900"
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}

      {mode === "template" && (
        <div className="border border-gray-300 p-4 space-y-3">
          <p className="text-sm text-gray-700">Выберите шаблон ТЗ:</p>
          <div className="flex flex-wrap gap-2">
            {TEMPLATES.map((t) => (
              <Button key={t.id} variant="outline" size="sm" onClick={() => applyTemplate(t.id)}>
                {t.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {mode === "upload" && (
        <div className="border border-gray-300 p-4 space-y-3">
          <p className="text-sm text-gray-700">Загрузите готовое ТЗ (PDF, DOC):</p>
          <FileUpload
            label="Загрузить ТЗ"
            accept=".pdf,.doc,.docx"
            onUpload={(name) => onFilesChange?.([...uploadedFiles, name])}
          />
          {uploadedFiles.length > 0 && (
            <ul className="text-xs text-gray-600 space-y-1">
              {uploadedFiles.map((f) => (
                <li key={f}>📄 {f}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {mode === "urgent" && (
        <div className="border border-gray-300 p-4 space-y-3">
          <Textarea
            label="Краткое описание задачи *"
            value={sections[0]?.content ?? ""}
            onChange={(e) => {
              const base = sections[0] ?? {
                id: newSection().id,
                title: "Срочная задача",
                content: "",
                required: true,
              };
              onChange([{ ...base, content: e.target.value, required: true }]);
            }}
            placeholder="Опишите суть работ, сроки и ключевые требования"
          />
        </div>
      )}

      {(mode === "constructor" || mode === "template") && (
        <>
          {sections.length === 0 && (
            <Button variant="outline" onClick={initDefault}>
              Начать с типовых разделов
            </Button>
          )}

          <div className="flex flex-wrap gap-2 justify-between">
            <Button variant="outline" size="sm" onClick={() => setPreview((p) => !p)}>
              {preview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {preview ? "Редактировать" : "Предпросмотр"}
            </Button>
            <div className="flex gap-2">
              {onDraftSave && (
                <Button variant="ghost" size="sm" onClick={onDraftSave}>
                  <Save className="h-4 w-4" />
                  Сохранить черновик
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={addSection}>
                <Plus className="h-4 w-4" />
                Добавить блок
              </Button>
            </div>
          </div>

          {preview ? (
            <div className="border border-gray-900 p-4 space-y-4 bg-gray-50">
              <h3 className="font-semibold text-sm">Предпросмотр ТЗ</h3>
              {sections.length === 0 ? (
                <p className="text-sm text-gray-500">Разделы не добавлены</p>
              ) : (
                sections.map((s, i) => (
                  <div key={s.id} className="border-b border-gray-200 pb-3 last:border-0">
                    <p className="text-sm font-medium">
                      {i + 1}. {s.title || "Без названия"}
                      {s.required && <span className="text-gray-500 ml-1">*</span>}
                    </p>
                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                      {s.content || "—"}
                    </p>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {sections.map((section, index) => (
                <div key={section.id} className="border border-gray-300 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Раздел {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeSection(section.id)}
                      className="text-gray-500 hover:text-gray-900"
                      aria-label="Удалить раздел"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <Input
                    label="Заголовок раздела"
                    value={section.title}
                    onChange={(e) => updateSection(section.id, { title: e.target.value })}
                    placeholder="Название раздела"
                  />
                  <Textarea
                    label="Содержание"
                    value={section.content}
                    onChange={(e) => updateSection(section.id, { content: e.target.value })}
                    placeholder="Опишите требования"
                  />
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      checked={section.required}
                      onChange={(e) => updateSection(section.id, { required: e.target.checked })}
                      className="border-gray-900"
                    />
                    Обязательное поле
                  </label>
                </div>
              ))}
            </div>
          )}

          {!requiredFilled && sections.some((s) => s.required) && (
            <p className="text-xs text-gray-600">Заполните все обязательные разделы</p>
          )}
        </>
      )}
    </div>
  );
}