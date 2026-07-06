"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { EstimateItem, EstimateSection } from "@/data/types";
import { formatPrice } from "@/lib/utils/formatters";

function newItem(): EstimateItem {
  return {
    id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: "",
    quantity: 1,
    unit: "шт.",
    price: 0,
    hidden: false,
  };
}

function newSection(): EstimateSection {
  return {
    id: `es-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: "Новый раздел",
    items: [newItem()],
  };
}

export function calcEstimateTotal(sections: EstimateSection[]): number {
  return sections.reduce(
    (sum, section) =>
      sum +
      section.items
        .filter((item) => !item.hidden)
        .reduce((s, item) => s + item.quantity * item.price, 0),
    0
  );
}

interface EstimateBuilderProps {
  sections: EstimateSection[];
  onChange: (sections: EstimateSection[]) => void;
  readOnly?: boolean;
}

export function EstimateBuilder({ sections, onChange, readOnly = false }: EstimateBuilderProps) {
  const total = calcEstimateTotal(sections);

  const updateSection = (sectionId: string, updates: Partial<EstimateSection>) => {
    onChange(sections.map((s) => (s.id === sectionId ? { ...s, ...updates } : s)));
  };

  const removeSection = (sectionId: string) => {
    onChange(sections.filter((s) => s.id !== sectionId));
  };

  const addSection = () => {
    onChange([...sections, newSection()]);
  };

  const updateItem = (sectionId: string, itemId: string, updates: Partial<EstimateItem>) => {
    onChange(
      sections.map((s) =>
        s.id === sectionId
          ? { ...s, items: s.items.map((i) => (i.id === itemId ? { ...i, ...updates } : i)) }
          : s
      )
    );
  };

  const removeItem = (sectionId: string, itemId: string) => {
    onChange(
      sections.map((s) =>
        s.id === sectionId ? { ...s, items: s.items.filter((i) => i.id !== itemId) } : s
      )
    );
  };

  const addItem = (sectionId: string) => {
    onChange(
      sections.map((s) => (s.id === sectionId ? { ...s, items: [...s.items, newItem()] } : s))
    );
  };

  if (sections.length === 0 && !readOnly) {
    return (
      <div className="border border-dashed border-gray-400 p-6 text-center">
        <p className="text-sm text-gray-600 mb-3">Смета пока пуста</p>
        <Button variant="outline" size="sm" onClick={() => onChange([newSection()])}>
          <Plus className="h-4 w-4" />
          Добавить раздел
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div key={section.id} className="border border-gray-300">
          <div className="flex items-center justify-between border-b border-gray-300 px-3 py-2 bg-gray-50">
            {readOnly ? (
              <span className="text-sm font-medium">{section.title}</span>
            ) : (
              <Input
                value={section.title}
                onChange={(e) => updateSection(section.id, { title: e.target.value })}
                className="max-w-xs border-0 bg-transparent p-0 focus:ring-0"
                placeholder="Название раздела"
              />
            )}
            {!readOnly && sections.length > 1 && (
              <button
                type="button"
                onClick={() => removeSection(section.id)}
                className="text-gray-500 hover:text-gray-900"
                aria-label="Удалить раздел"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs text-gray-600">
                  <th className="px-3 py-2 font-medium">Наименование</th>
                  <th className="px-3 py-2 font-medium w-20">Кол-во</th>
                  <th className="px-3 py-2 font-medium w-20">Ед.</th>
                  <th className="px-3 py-2 font-medium w-28">Цена</th>
                  <th className="px-3 py-2 font-medium w-28">Сумма</th>
                  {!readOnly && <th className="px-3 py-2 w-10" />}
                </tr>
              </thead>
              <tbody>
                {section.items.map((item) => {
                  const lineTotal = item.quantity * item.price;
                  return (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="px-3 py-2">
                        {readOnly ? (
                          item.name || "—"
                        ) : (
                          <input
                            value={item.name}
                            onChange={(e) => updateItem(section.id, item.id, { name: e.target.value })}
                            className="w-full border-0 border-b border-transparent focus:border-gray-900 focus:outline-none text-sm"
                            placeholder="Позиция"
                          />
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {readOnly ? (
                          item.quantity
                        ) : (
                          <input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(section.id, item.id, { quantity: Number(e.target.value) || 1 })
                            }
                            className="w-full border border-gray-300 px-2 py-1 text-sm"
                          />
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {readOnly ? (
                          item.unit
                        ) : (
                          <input
                            value={item.unit}
                            onChange={(e) => updateItem(section.id, item.id, { unit: e.target.value })}
                            className="w-full border border-gray-300 px-2 py-1 text-sm"
                          />
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {readOnly ? (
                          formatPrice(item.price)
                        ) : (
                          <input
                            type="number"
                            min={0}
                            value={item.price}
                            onChange={(e) =>
                              updateItem(section.id, item.id, { price: Number(e.target.value) || 0 })
                            }
                            className="w-full border border-gray-300 px-2 py-1 text-sm"
                          />
                        )}
                      </td>
                      <td className="px-3 py-2 font-medium">{formatPrice(lineTotal)}</td>
                      {!readOnly && (
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            onClick={() => removeItem(section.id, item.id)}
                            className="text-gray-500 hover:text-gray-900"
                            aria-label="Удалить строку"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {!readOnly && (
            <div className="px-3 py-2 border-t border-gray-200">
              <Button variant="ghost" size="sm" onClick={() => addItem(section.id)}>
                <Plus className="h-4 w-4" />
                Добавить строку
              </Button>
            </div>
          )}
        </div>
      ))}

      {!readOnly && (
        <Button variant="outline" size="sm" onClick={addSection}>
          <Plus className="h-4 w-4" />
          Добавить раздел
        </Button>
      )}

      <div className="flex justify-end border-t border-gray-900 pt-3">
        <div className="text-right">
          <p className="text-xs text-gray-600">Итого</p>
          <p className="text-lg font-bold">{formatPrice(total)}</p>
        </div>
      </div>
    </div>
  );
}
