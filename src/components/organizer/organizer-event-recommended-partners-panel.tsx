"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { ConfirmModal } from "@/components/ui/modal";
import { OrganizerEventRecommendedPartnerModal } from "@/components/organizer/organizer-event-recommended-partner-modal";
import { EVENT_PARTNER_CATEGORIES } from "@/constants/event-partner-categories";
import { SEED_CONTRACTORS } from "@/data/mocks/seed";
import type { EventPartnerCategoryId, EventRecommendedPartner } from "@/data/types";
import { useAuthStore, usePrototypeStore } from "@/lib/store";
import { getContractorProfileHref } from "@/lib/utils/contractor-profile-links";
import { cn } from "@/lib/utils/cn";
import styles from "./organizer-event-recommended-partners-panel.module.css";

interface Props {
  eventId: string | null;
  draftEventId?: string;
  onEnsureDraftId?: () => string;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

function resolvePartnerTitle(partner: EventRecommendedPartner): string {
  if (partner.contractorId) {
    return SEED_CONTRACTORS.find((item) => item.id === partner.contractorId)?.name ?? "Исполнитель";
  }
  return partner.customName ?? "Партнёр";
}

function resolvePartnerSubtitle(partner: EventRecommendedPartner): string | undefined {
  if (partner.customDescription) return partner.customDescription;
  if (!partner.contractorId) return undefined;
  const contractor = SEED_CONTRACTORS.find((item) => item.id === partner.contractorId);
  if (!contractor) return undefined;
  return `★ ${contractor.rating} · ${contractor.categories[0]}`;
}

export function OrganizerEventRecommendedPartnersPanel({
  eventId,
  draftEventId,
  onEnsureDraftId,
  showToast,
}: Props) {
  const user = useAuthStore((state) => state.user);
  const {
    eventRecommendedPartners,
    addEventRecommendedPartner,
    updateEventRecommendedPartner,
    removeEventRecommendedPartner,
  } = usePrototypeStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalEventId, setModalEventId] = useState<string | null>(null);
  const [modalCategoryId, setModalCategoryId] = useState<EventPartnerCategoryId | null>(null);
  const [editingPartner, setEditingPartner] = useState<EventRecommendedPartner | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EventRecommendedPartner | null>(null);

  const storageEventId = eventId ?? draftEventId ?? null;

  const partners = useMemo(
    () =>
      storageEventId
        ? eventRecommendedPartners.filter((partner) => partner.eventId === storageEventId)
        : [],
    [eventRecommendedPartners, storageEventId]
  );

  const resolveStorageEventId = (): string | null => {
    if (storageEventId) return storageEventId;
    return onEnsureDraftId?.() ?? null;
  };

  const openAddModal = (categoryId: EventPartnerCategoryId) => {
    const targetEventId = resolveStorageEventId();
    if (!targetEventId) {
      showToast("Сначала укажите название мероприятия", "error");
      return;
    }
    setModalEventId(targetEventId);
    setEditingPartner(null);
    setModalCategoryId(categoryId);
    setModalOpen(true);
  };

  const openEditModal = (partner: EventRecommendedPartner) => {
    setModalEventId(partner.eventId);
    setEditingPartner(partner);
    setModalCategoryId(partner.categoryId);
    setModalOpen(true);
  };

  const handleSave = (partner: EventRecommendedPartner) => {
    const targetEventId = resolveStorageEventId();
    if (!targetEventId) return;

    const payload = { ...partner, eventId: targetEventId };
    const exists = eventRecommendedPartners.some((item) => item.id === payload.id);

    if (exists) {
      updateEventRecommendedPartner(payload.id, payload);
      showToast("Партнёр обновлён");
      return;
    }

    addEventRecommendedPartner(payload);
    showToast("Партнёр добавлен");
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    removeEventRecommendedPartner(deleteTarget.id);
    setDeleteTarget(null);
    showToast("Партнёр удалён");
  };

  const toggleRecommended = (partner: EventRecommendedPartner) => {
    updateEventRecommendedPartner(partner.id, { isRecommended: !partner.isRecommended });
  };

  return (
    <>
      <Card className="space-y-6 min-w-0 overflow-hidden">
        <div>
          <CardTitle className="text-sm">Рекомендованные застройщики</CardTitle>
          <CardDescription className="mt-2">
            Партнёры мероприятия: эксклюзивное строительство, логистика, проживание и смежные
            услуги для экспонентов. В каждой категории может быть несколько исполнителей.
          </CardDescription>
        </div>

        <div className="space-y-6">
          {EVENT_PARTNER_CATEGORIES.map((category) => {
            const categoryPartners = partners.filter((partner) => partner.categoryId === category.id);

            return (
              <section key={category.id} className="space-y-3 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-medium text-gray-900">{category.label}</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => openAddModal(category.id)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Добавить
                  </Button>
                </div>

                {categoryPartners.length === 0 ? (
                  <div className={styles.grid}>
                    <p className="text-sm text-gray-500 cabinet-card border border-dashed border-gray-300 p-4">
                      Партнёры не добавлены. Нажмите «Добавить», чтобы указать исполнителя в этой
                      категории.
                    </p>
                  </div>
                ) : (
                  <div className={styles.grid}>
                    {categoryPartners.map((partner) => {
                      const title = resolvePartnerTitle(partner);
                      const subtitle = resolvePartnerSubtitle(partner);

                      return (
                        <article
                          key={partner.id}
                          className={cn(
                            styles.card,
                            "cabinet-card border p-4 h-full flex flex-col",
                            partner.isRecommended
                              ? "border-gray-900 bg-[var(--account-accent-soft)]"
                              : "border-gray-300 bg-white",
                          )}
                        >
                          <div className={styles.cardHeader}>
                            <button
                              type="button"
                              onClick={() => toggleRecommended(partner)}
                              className={styles.badgeButton}
                            >
                              <Badge
                                variant={partner.isRecommended ? "solid" : "outline"}
                                className="w-fit max-w-full"
                              >
                                {partner.isRecommended ? "Рекомендован" : "Не выбран"}
                              </Badge>
                            </button>
                            <div className={styles.actions}>
                              <button
                                type="button"
                                onClick={() => openEditModal(partner)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-button border border-gray-300 bg-white hover:bg-gray-100"
                                aria-label="Редактировать"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(partner)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-button border border-gray-300 bg-white hover:bg-gray-100"
                                aria-label="Удалить"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          <p className="mt-3 text-sm font-medium leading-snug break-words">{title}</p>
                          {subtitle ? (
                            <p className="mt-2 text-xs text-gray-600 leading-relaxed line-clamp-3">
                              {subtitle}
                            </p>
                          ) : null}

                          {partner.contractorId ? (
                            <Link
                              href={getContractorProfileHref(partner.contractorId, {
                                role: user?.role,
                                from: "event",
                                eventId: storageEventId ?? undefined,
                              })}
                              className="mt-auto pt-3 inline-block text-xs underline hover:text-gray-900"
                            >
                              Карточка партнёра
                            </Link>
                          ) : null}
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </Card>

      {modalEventId && (
        <OrganizerEventRecommendedPartnerModal
          open={modalOpen}
          eventId={modalEventId}
          categoryId={modalCategoryId}
          partner={editingPartner}
          onClose={() => {
            setModalOpen(false);
            setEditingPartner(null);
            setModalEventId(null);
          }}
          onSave={handleSave}
        />
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Удалить партнёра?"
        message={
          deleteTarget
            ? `Партнёр «${resolvePartnerTitle(deleteTarget)}» будет удалён из категории.`
            : ""
        }
      />
    </>
  );
}