"use client";

import { useRef, useState } from "react";
import { Building2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resizeImageFile } from "@/lib/utils/resize-image";

interface Props {
  logoUrl?: string;
  companyName: string;
  onUpload: (logoUrl: string) => void;
  onError?: (message: string) => void;
}

export function CompanyAvatarUpload({ logoUrl, companyName, onUpload, onError }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const dataUrl = await resizeImageFile(file);
      onUpload(dataUrl);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : "Не удалось загрузить изображение");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden border border-gray-300 bg-gray-50">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt={`Логотип ${companyName}`} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Building2 className="h-10 w-10 text-gray-400" />
          </div>
        )}
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium">Логотип или фото компании</p>
        <p className="text-xs text-gray-500 max-w-sm">
          JPG или PNG до 5 МБ. Изображение автоматически сжимается для быстрой работы сайта.
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Загрузка..." : logoUrl ? "Заменить" : "Загрузить"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={handleChange}
        />
      </div>
    </div>
  );
}