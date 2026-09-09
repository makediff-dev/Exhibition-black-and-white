"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, FileText, ImageIcon, Plus, Trash2, Upload } from "lucide-react";
import { BackButton } from "@/components/ui/back-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { PortfolioItem, PortfolioThankYou } from "@/data/types";
import { usePrototypeStore } from "@/lib/store";
import { cn } from "@/lib/utils/cn";
import { resizeImageFile } from "@/lib/utils/resize-image";

const PORTFOLIO_LIST_HREF = "/account/contractor/portfolio";

type SectionKey = "description" | "materials" | "thanks";

export function createDraftPortfolioItem(): PortfolioItem {
  return {
    id: `p-${Date.now()}`,
    title: "",
    year: String(new Date().getFullYear()),
    description: "",
    photos: ["", "", ""],
    videos: [],
    links: [],
    status: "draft",
    mediaUrls: ["", "", ""],
    thanksLetters: [],
  };
}

function createDraftThankYou(): PortfolioThankYou {
  return {
    id: `ty-${Date.now()}`,
    author: "",
    text: "",
  };
}

function countFilledPhotos(item: PortfolioItem): number {
  const mediaUrls = item.mediaUrls ?? [];
  return mediaUrls.filter(Boolean).length;
}

function PortfolioSectionCard({
  title,
  summary,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  summary: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="cabinet-card overflow-hidden border border-gray-300 bg-white">
      <button
        type="button"
        className="w-full flex items-start justify-between gap-3 p-4 text-left hover:bg-gray-50"
        onClick={onToggle}
      >
        <div className="min-w-0">
          <CardTitle>{title}</CardTitle>
          {!expanded && <CardDescription className="line-clamp-2">{summary}</CardDescription>}
        </div>
        <ChevronDown className={cn("h-4 w-4 shrink-0 mt-1 transition-transform", expanded && "rotate-180")} />
      </button>
      {expanded && <div className="px-4 pb-4 space-y-3 border-t border-gray-200">{children}</div>}
    </div>
  );
}

function getPortfolioPhotoSlides(item: PortfolioItem) {
  const labels = [...item.photos, "", "", ""].slice(0, 3);
  const mediaUrls = [...(item.mediaUrls ?? []), "", "", ""].slice(0, 3);

  const slides = labels.map((label, index) => ({
    label: label || `Фото ${index + 1}`,
    imageUrl: mediaUrls[index] || undefined,
  }));

  const filledSlides = slides.filter((slide, index) => slide.imageUrl || labels[index]);
  return filledSlides.length > 0 ? filledSlides : [{ label: "Фото 1", imageUrl: undefined }];
}

function PortfolioPhotoCarousel({
  item,
  interactive = false,
}: {
  item: PortfolioItem;
  interactive?: boolean;
}) {
  const slides = getPortfolioPhotoSlides(item);
  const [photoIndex, setPhotoIndex] = useState(0);
  const currentSlide = slides[photoIndex] ?? slides[0];
  const hasMultiple = slides.length > 1;

  const stopCardNavigation = (event: React.MouseEvent) => {
    if (interactive) {
      event.stopPropagation();
    }
  };

  const showPrevious = (event: React.MouseEvent) => {
    stopCardNavigation(event);
    setPhotoIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const showNext = (event: React.MouseEvent) => {
    stopCardNavigation(event);
    setPhotoIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="mb-3">
      <div className="aspect-[4/3] border border-dashed border-gray-300 bg-gray-50 overflow-hidden relative">
        {currentSlide?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={currentSlide.imageUrl}
            alt={currentSlide.label}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center p-2 text-center text-[10px] text-gray-400">
            {currentSlide?.label || "Фото 1"}
          </div>
        )}
        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={showPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center border border-gray-300 bg-white/95"
              aria-label="Предыдущее фото"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={showNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center border border-gray-300 bg-white/95"
              aria-label="Следующее фото"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {slides.map((slide, index) => (
                <button
                  key={`${item.id}-dot-${slide.label}-${index}`}
                  type="button"
                  onClick={(event) => {
                    stopCardNavigation(event);
                    setPhotoIndex(index);
                  }}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    index === photoIndex ? "bg-gray-900" : "bg-gray-300"
                  )}
                  aria-label={`Фото ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      {currentSlide?.label && hasMultiple && (
        <p className="mt-1 text-[10px] text-gray-500 truncate">{currentSlide.label}</p>
      )}
    </div>
  );
}

export function PortfolioPreviewCard({
  item,
  variant = "full",
}: {
  item: PortfolioItem;
  variant?: "full" | "compact";
}) {
  const thanksCount = item.thanksLetters?.length ?? 0;

  return (
    <>
      <PortfolioPhotoCarousel item={item} interactive={variant === "compact"} />
      <p className="text-xs text-gray-500">{item.year}</p>
      <CardTitle className="mt-1 text-sm">{item.title ||"Новый проект"}</CardTitle>
      <CardDescription className="mt-2 flex-1 line-clamp-2 text-xs">
        {item.description || "Добавьте описание проекта"}
      </CardDescription>
      {(item.videos?.length ?? 0) > 0 || thanksCount > 0 ? (
        <div className="flex flex-wrap gap-2 mt-3">
          {(item.videos?.length ?? 0) > 0 && (
            <Badge variant="outline">{item.videos?.length} видео</Badge>
          )}
          {thanksCount > 0 && <Badge variant="outline">{thanksCount} благодарностей</Badge>}
        </div>
      ) : null}
      {variant === "full" && thanksCount > 0 && (
        <div className="mt-3 space-y-2">
          {item.thanksLetters?.slice(0, 2).map((letter) => (
            <div key={letter.id} className="border border-gray-200 p-2 text-xs text-gray-700">
              <p className="font-medium">{letter.author || "Благодарность"}</p>
              {letter.text && <p className="mt-1 line-clamp-2">{letter.text}</p>}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

interface ListProps {
  contractorId: string;
}

export function ContractorPortfolioListSection({ contractorId }: ListProps) {
  const router = useRouter();
  const portfolio = usePrototypeStore((state) => state.getContractorPortfolio(contractorId));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold">Портфолио</h1>
        <Button size="sm" onClick={() => router.push(`${PORTFOLIO_LIST_HREF}/new`)}>
          <Plus className="h-4 w-4" />
          Добавить портфолио
        </Button>
      </div>

      {portfolio.length === 0 ? (
        <Card className="border-dashed">
          <p className="text-sm text-gray-600">
            Портфолио пока пустое. Нажмите «Добавить портфолио», чтобы создать первый проект.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
          {portfolio.map((item) => {
            const photoCount = countFilledPhotos(item);
            const thanksCount = item.thanksLetters?.length ?? 0;

            return (
              <Card
                key={item.id}
                className="flex flex-col h-full min-w-0"
                onClick={() => router.push(`${PORTFOLIO_LIST_HREF}/${item.id}`)}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  {item.status === "draft" ? (
                    <Badge variant="outline">Черновик</Badge>
                  ) : item.status === "published" ? (
                    <Badge>Опубликовано</Badge>
                  ) : (
                    <span />
                  )}
                  <div className="flex flex-wrap gap-1 justify-end">
                    {photoCount > 0 && <Badge variant="outline">{photoCount} фото</Badge>}
                    {thanksCount > 0 && <Badge variant="outline">{thanksCount} благодарностей</Badge>}
                  </div>
                </div>
                <PortfolioPreviewCard item={item} variant="compact" />
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface FormProps {
  contractorId: string;
  itemId: string;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

export function ContractorPortfolioFormSection({ contractorId, itemId, showToast }: FormProps) {
  const router = useRouter();
  const {
    getContractorPortfolio,
    upsertContractorPortfolioItem,
    removeContractorPortfolioItem,
  } = usePrototypeStore();

  const isNew = itemId === "new";
  const existingItem = isNew
    ? null
    : getContractorPortfolio(contractorId).find((entry) => entry.id === itemId);

  const [item, setItem] = useState<PortfolioItem>(() => existingItem ?? createDraftPortfolioItem());
  const [activeSection, setActiveSection] = useState<SectionKey | null>("description");
  const photoInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const thanksInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadingThanksIndex, setUploadingThanksIndex] = useState<number | null>(null);

  if (!isNew && !existingItem) {
    return (
      <EmptyState
        title="Проект не найден"
        actionLabel="К портфолио"
        onAction={() => router.push(PORTFOLIO_LIST_HREF)}
      />
    );
  }

  const photos = [...item.photos, "", "", ""].slice(0, 3);
  const mediaUrls = [...(item.mediaUrls ?? []), "", "", ""].slice(0, 3);
  const thanksLetters = item.thanksLetters ?? [];

  const toggleSection = (section: SectionKey) => {
    setActiveSection((current) => (current === section ? null : section));
  };

  const updatePhotoSlot = (index: number, updates: { label?: string; imageUrl?: string }) => {
    const nextPhotos = [...photos];
    const nextMediaUrls = [...mediaUrls];
    if (updates.label !== undefined) nextPhotos[index] = updates.label;
    if (updates.imageUrl !== undefined) nextMediaUrls[index] = updates.imageUrl;
    setItem({ ...item, photos: nextPhotos, mediaUrls: nextMediaUrls });
  };

  const handlePhotoUpload = async (index: number, file: File) => {
    setUploadingIndex(index);
    try {
      const imageUrl = await resizeImageFile(file, 640, 0.85);
      updatePhotoSlot(index, { imageUrl });
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Не удалось загрузить фото", "error");
    } finally {
      setUploadingIndex(null);
    }
  };

  const updateThankYou = (index: number, updates: Partial<PortfolioThankYou>) => {
    const nextLetters = thanksLetters.map((letter, letterIndex) =>
      letterIndex === index ? { ...letter, ...updates } : letter
    );
    setItem({ ...item, thanksLetters: nextLetters });
  };

  const handleThanksUpload = async (index: number, file: File) => {
    setUploadingThanksIndex(index);
    try {
      const imageUrl = await resizeImageFile(file, 960, 0.85);
      updateThankYou(index, { imageUrl });
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Не удалось загрузить благодарность", "error");
    } finally {
      setUploadingThanksIndex(null);
    }
  };

  const handleAddThankYou = () => {
    setItem({ ...item, thanksLetters: [...thanksLetters, createDraftThankYou()] });
    setActiveSection("thanks");
  };

  const handleRemoveThankYou = (index: number) => {
    setItem({
      ...item,
      thanksLetters: thanksLetters.filter((_, letterIndex) => letterIndex !== index),
    });
  };

  const handleSave = () => {
    if (!item.title.trim()) {
      showToast("Укажите название проекта", "error");
      return;
    }
    upsertContractorPortfolioItem(contractorId, { ...item, status: item.status ?? "draft" });
    showToast("Проект сохранён", "success");
    router.push(PORTFOLIO_LIST_HREF);
  };

  const handlePublish = () => {
    if (!item.title.trim() || !item.description.trim()) {
      showToast("Заполните название и описание перед публикацией", "error");
      return;
    }
    upsertContractorPortfolioItem(contractorId, { ...item, status: "published" });
    showToast("Проект опубликован", "success");
    router.push(PORTFOLIO_LIST_HREF);
  };

  const handleDelete = () => {
    if (!isNew) {
      removeContractorPortfolioItem(contractorId, item.id);
    }
    showToast("Проект удалён", "info");
    router.push(PORTFOLIO_LIST_HREF);
  };

  const descriptionSummary = item.description.trim() || "Добавьте описание проекта";
  const materialsSummary =
    countFilledPhotos(item) > 0 || (item.videos?.length ?? 0) > 0
      ? `${countFilledPhotos(item)} фото, ${item.videos?.length ?? 0} видео`
      : "Загрузите фото и видео проекта";
  const thanksSummary =
    thanksLetters.length > 0
      ? `${thanksLetters.length} благодарностей добавлено`
      : "Добавьте письма благодарности от заказчиков";

  return (
    <div className="max-w-3xl space-y-4">
      <BackButton fallbackHref={PORTFOLIO_LIST_HREF} className="mb-2" />

      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold">
            {isNew ? "Новый проект в портфолио" : item.title || "Редактирование проекта"}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Заполняйте карточки по разделам: описание, материалы и благодарности
          </p>
        </div>
        {item.status === "draft" ? (
          <Badge variant="outline">Черновик</Badge>
        ) : item.status === "published" ? (
          <Badge>Опубликовано</Badge>
        ) : null}
      </div>

      <div className="space-y-3">
        <Input
          label="Название проекта"
          value={item.title}
          onChange={(event) => setItem({ ...item, title: event.target.value })}
          placeholder="Стенд Мебель-2025"
        />
        <Input
          label="Год"
          value={item.year}
          onChange={(event) => setItem({ ...item, year: event.target.value.replace(/\D/g, "").slice(0, 4) })}
        />
      </div>

      <PortfolioSectionCard
            title="Описание"
            summary={descriptionSummary}
            expanded={activeSection === "description"}
            onToggle={() => toggleSection("description")}
          >
            <Textarea
              label="Описание проекта"
              value={item.description}
              onChange={(event) => setItem({ ...item, description: event.target.value })}
              placeholder="Кратко опишите проект, площадь, особенности реализации"
            />
          </PortfolioSectionCard>

          <PortfolioSectionCard
            title="Фото и видео"
            summary={materialsSummary}
            expanded={activeSection === "materials"}
            onToggle={() => toggleSection("materials")}
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {photos.map((label, index) => (
                <div key={`${item.id}-editor-${index}`} className="space-y-2">
                  <div className="aspect-[4/3] border border-dashed border-gray-300 bg-gray-50 overflow-hidden flex items-center justify-center">
                    {mediaUrls[index] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={mediaUrls[index]} alt={label || `Фото ${index + 1}`} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-gray-400 px-2 text-center flex items-center gap-1">
                        <ImageIcon className="h-3 w-3" />
                        {label || `Фото ${index + 1}`}
                      </span>
                    )}
                  </div>
                  <Input
                    label={`Подпись ${index + 1}`}
                    value={label}
                    onChange={(event) => updatePhotoSlot(index, { label: event.target.value })}
                    placeholder="Например: Общий вид"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="w-full"
                    disabled={uploadingIndex === index}
                    onClick={() => photoInputRefs.current[index]?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    {uploadingIndex === index ? "Загрузка..." : "Фото"}
                  </Button>
                  <input
                    ref={(node) => {
                      photoInputRefs.current[index] = node;
                    }}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      event.target.value = "";
                      if (file) void handlePhotoUpload(index, file);
                    }}
                  />
                </div>
              ))}
            </div>
            <FileUpload
              label="Загрузить видео"
              accept="video/*"
              onUpload={(fileName) => setItem({ ...item, videos: [...(item.videos ?? []), fileName] })}
            />
            {(item.videos?.length ?? 0) > 0 && (
              <ul className="space-y-1 text-sm text-gray-700">
                {item.videos?.map((video, index) => (
                  <li key={`${item.id}-video-${index}`} className="flex items-center justify-between gap-2">
                    <span className="truncate">{video}</span>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setItem({
                          ...item,
                          videos: item.videos?.filter((_, videoIndex) => videoIndex !== index),
                        })
                      }
                    >
                      Удалить
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </PortfolioSectionCard>

          <PortfolioSectionCard
            title="Благодарности"
            summary={thanksSummary}
            expanded={activeSection === "thanks"}
            onToggle={() => toggleSection("thanks")}
          >
            {thanksLetters.length === 0 ? (
              <p className="text-sm text-gray-600">
                Добавьте сканы или фото писем благодарности от заказчиков.
              </p>
            ) : (
              <div className="space-y-3">
                {thanksLetters.map((letter, index) => (
                  <Card key={letter.id} className="space-y-3 bg-gray-50">
                    <Input
                      label="От кого"
                      value={letter.author}
                      onChange={(event) => updateThankYou(index, { author: event.target.value })}
                      placeholder="ООО «Компания»"
                    />
                    <Textarea
                      label="Текст благодарности"
                      value={letter.text}
                      onChange={(event) => updateThankYou(index, { text: event.target.value })}
                      placeholder="Краткая цитата из письма"
                    />
                    <div className="aspect-[4/3] max-w-xs border border-dashed border-gray-300 bg-white overflow-hidden flex items-center justify-center">
                      {letter.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={letter.imageUrl} alt={letter.author || "Благодарность"} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xs text-gray-400 px-2 text-center flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          Скан письма
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={uploadingThanksIndex === index}
                        onClick={() => thanksInputRefs.current[index]?.click()}
                      >
                        <Upload className="h-4 w-4" />
                        {uploadingThanksIndex === index ? "Загрузка..." : "Загрузить скан"}
                      </Button>
                      <Button type="button" size="sm" variant="outline" onClick={() => handleRemoveThankYou(index)}>
                        <Trash2 className="h-4 w-4" />
                        Удалить
                      </Button>
                    </div>
                    <input
                      ref={(node) => {
                        thanksInputRefs.current[index] = node;
                      }}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.target.value = "";
                        if (file) void handleThanksUpload(index, file);
                      }}
                    />
                  </Card>
                ))}
              </div>
            )}
            <Button type="button" size="sm" variant="outline" onClick={handleAddThankYou}>
              <Plus className="h-4 w-4" />
              Добавить благодарность
            </Button>
      </PortfolioSectionCard>

      <div className="sticky bottom-4 pt-4 bg-white/95 backdrop-blur">
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={handleSave}>Сохранить</Button>
          <Button type="button" size="sm" variant="outline" onClick={handlePublish}>
            Опубликовать
          </Button>
          {!isNew && (
            <Button type="button" size="sm" variant="outline" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
              Удалить
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export const ContractorPortfolioSection = ContractorPortfolioListSection;