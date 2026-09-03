"use client";

import Link from "next/link";
import { useState } from "react";
import { BackButton } from "@/components/ui/back-button";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { PortfolioItem } from "@/data/types";

interface PortfolioDetailProps {
  item: PortfolioItem;
  backHref: string;
  editable?: boolean;
  onSave?: (item: PortfolioItem) => void;
}

export function PortfolioDetail({
  item,
  backHref,
  editable = false,
  onSave,
}: PortfolioDetailProps) {
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description);
  const [photos, setPhotos] = useState(item.photos);
  const [links, setLinks] = useState(item.links ?? []);
  const [linkInput, setLinkInput] = useState("");

  const handleAddLink = () => {
    const value = linkInput.trim();
    if (!value) return;
    setLinks((prev) => [...prev, value]);
    setLinkInput("");
  };

  const handleSave = () => {
    onSave?.({
      ...item,
      title,
      description,
      photos,
      links,
    });
  };

  return (
    <div className="max-w-2xl space-y-6 text-left">
      <div>
        <BackButton
          fallbackHref={backHref}
          className="font-medium text-gray-900 mb-6"
        />

        <p className="text-sm text-gray-500 mb-1">{item.year}</p>

        {editable ? (
          <h1 className="text-xl font-bold">{title}</h1>
        ) : item.eventId ? (
          <Link href={`/events/${item.eventId}`} className="text-xl font-bold hover:underline">
            {title}
          </Link>
        ) : (
          <h1 className="text-xl font-bold">{title}</h1>
        )}
      </div>

      {editable ? (
        <>
          <Input label="Название проекта" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input label="Год" value={item.year} readOnly />
          <Textarea
            label="Описание"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </>
      ) : (
        <p className="text-sm text-gray-700">{description}</p>
      )}

      <div>
        <p className="text-sm font-medium mb-3">Фотографии проекта</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          {photos.map((photo, index) => (
            <div
              key={`${item.id}-${photo}-${index}`}
              className="aspect-[4/3] border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center p-2 text-center text-xs text-gray-500"
            >
              {photo}
            </div>
          ))}
        </div>

        {editable && (
          <FileUpload
            label="Загрузить фотографии"
            accept="image/*"
            onUpload={(fileName) => setPhotos((prev) => [...prev, fileName])}
          />
        )}
      </div>

      <div>
        <p className="text-sm font-medium mb-3">Ссылки</p>

        {editable ? (
          <Input
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            placeholder="https://example.com/video"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddLink();
              }
            }}
          />
        ) : null}

        {links.length > 0 && (
          <ul className={`space-y-2 ${editable ? "mt-3" : ""}`}>
            {links.map((link, index) => (
              <li key={`${item.id}-link-${index}`}>
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-900 underline break-all"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      {editable && (
        <Button onClick={handleSave}>Сохранить</Button>
      )}
    </div>
  );
}