"use client";

import { useState } from "react";
import { FileText, ShieldCheck, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileUpload } from "@/components/ui/file-upload";
import type { CompanyProfile } from "@/data/types";

interface ProductionObject {
  id: string;
  name: string;
  documentName?: string;
}

interface Props {
  user: CompanyProfile | null;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

function PhotoUploadSection({
  title,
  photos,
  onUpload,
}: {
  title: string;
  photos: string[];
  onUpload: (fileName: string) => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium mb-3">{title}</p>
      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {photos.map((photo, index) => (
            <div
              key={`${title}-${photo}-${index}`}
              className="aspect-[4/3] border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center p-2 text-center text-xs text-gray-500"
            >
              {photo}
            </div>
          ))}
        </div>
      )}
      <FileUpload label="Загрузить фотографии" accept="image/*" onUpload={onUpload} />
    </div>
  );
}

function ObjectDocumentUpload({
  objectName,
  documentName,
  onUpload,
}: {
  objectName: string;
  documentName?: string;
  onUpload: (fileName: string) => void;
}) {
  return (
    <div className="border border-gray-200 p-4 space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm font-medium">{objectName}</p>
        {documentName && (
          <Badge variant="outline" className="gap-1">
            <FileText className="h-3 w-3" />
            {documentName}
          </Badge>
        )}
      </div>
      <FileUpload
        label="Загрузить PDF"
        accept=".pdf,application/pdf"
        onUpload={onUpload}
      />
    </div>
  );
}

export function ContractorProductionSection({ user, showToast }: Props) {
  const [hasProduction, setHasProduction] = useState(user?.hasProduction ?? true);
  const [productionPhotos, setProductionPhotos] = useState(["Цех", "Склад"]);
  const [equipmentPhotos, setEquipmentPhotos] = useState(["Фрезерный станок", "Лазерная резка"]);
  const [productionObjects, setProductionObjects] = useState<ProductionObject[]>([
    { id: "obj-1", name: "Цех" },
    { id: "obj-2", name: "Склад" },
  ]);
  const [leaseDocumentName, setLeaseDocumentName] = useState<string>();
  const [submittedForReview, setSubmittedForReview] = useState(false);

  const attachObjectDocument = (objectId: string, fileName: string) => {
    setProductionObjects((prev) =>
      prev.map((item) => (item.id === objectId ? { ...item, documentName: fileName } : item))
    );
    showToast(`Документ для «${productionObjects.find((o) => o.id === objectId)?.name}» загружен`, "success");
  };

  const handleSave = () => {
    showToast("Данные производства сохранены", "success");
  };

  const handleSubmitForReview = () => {
    const missingDocs = productionObjects.filter((item) => !item.documentName);
    if (missingDocs.length > 0) {
      showToast("Загрузите PDF-документы по каждому объекту производства", "error");
      return;
    }
    if (!leaseDocumentName) {
      showToast("Загрузите договор аренды в формате PDF", "error");
      return;
    }
    setSubmittedForReview(true);
    showToast("Документы отправлены на модерацию", "success");
  };

  return (
    <div className="max-w-2xl space-y-6">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={hasProduction}
          onChange={(event) => setHasProduction(event.target.checked)}
        />
        Собственное производство
      </label>

      <Input label="Адрес производства" defaultValue="г. Москва, ул. Заводская, 15" />
      <Input label="Площадь, кв.м" defaultValue="1200" />
      <Textarea label="Оборудование" defaultValue="Фрезерный станок, лазерная резка" />

      <PhotoUploadSection
        title="Фотографии производства"
        photos={productionPhotos}
        onUpload={(fileName) => setProductionPhotos((prev) => [...prev, fileName])}
      />

      <PhotoUploadSection
        title="Фотографии оборудования"
        photos={equipmentPhotos}
        onUpload={(fileName) => setEquipmentPhotos((prev) => [...prev, fileName])}
      />

      <Card className="space-y-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm font-semibold">Подтверждение производственных мощностей</p>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              Загрузите документы, подтверждающие производственные мощности, чтобы после модерации
              получить значок верификации и повысить рейтинг в каталоге исполнителей.
            </p>
          </div>
          {submittedForReview && (
            <Badge className="shrink-0 gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              На модерации
            </Badge>
          )}
        </div>

        <div className="border border-dashed border-gray-300 bg-gray-50 p-4 text-sm text-gray-700 space-y-2">
          <p>Документы загружайте в формате PDF отдельно по каждому объекту.</p>
          <p>
            Контактные данные арендодателя укажите в договоре аренды — это ускорит проверку
            модератором.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm font-medium">Документы по объектам</p>
          {productionObjects.map((object) => (
            <ObjectDocumentUpload
              key={object.id}
              objectName={object.name}
              documentName={object.documentName}
              onUpload={(fileName) => attachObjectDocument(object.id, fileName)}
            />
          ))}
        </div>

        <div className="space-y-3 border-t border-gray-200 pt-4">
          <p className="text-sm font-medium">Договор аренды помещения</p>
          <p className="text-xs text-gray-500">
            PDF с реквизитами и контактами арендодателя для ускоренной верификации
          </p>
          {leaseDocumentName && (
            <Badge variant="outline" className="gap-1">
              <FileText className="h-3 w-3" />
              {leaseDocumentName}
            </Badge>
          )}
          <FileUpload
            label="Загрузить договор аренды (PDF)"
            accept=".pdf,application/pdf"
            onUpload={(fileName) => {
              setLeaseDocumentName(fileName);
              showToast("Договор аренды загружен", "success");
            }}
          />
        </div>

        <Button type="button" variant="outline" onClick={handleSubmitForReview}>
          <Upload className="h-4 w-4" />
          Отправить на модерацию
        </Button>
      </Card>

      <Button type="button" onClick={handleSave}>
        Сохранить
      </Button>
    </div>
  );
}
