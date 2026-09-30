"use client";

import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { CardField } from "@/components/ui/card-field";
import { useToast } from "@/components/ui/toast-provider";

export interface SpaceBlockField {
  label: string;
  value: string;
}

interface Props {
  title: string;
  fields: SpaceBlockField[];
  open: boolean;
  onToggle: () => void;
  onOpen?: () => void;
}

export function VenueSpaceBlockCard({
  title,
  fields,
  open,
  onToggle,
  onOpen,
}: Props) {
  const { showToast } = useToast();

  return (
    <Card hoverable={Boolean(onOpen)} className="cabinet-card relative flex h-full flex-col">
      {onOpen ? (
        <button
          type="button"
          className="absolute inset-0 z-[1]"
          onClick={onOpen}
          aria-label={`Открыть ${title}`}
        />
      ) : null}
      <div className="relative z-[2] pointer-events-none flex flex-col flex-1">
        <CardTitle>{title}</CardTitle>
        <div className="mt-2 space-y-1">
          {fields.map((field) => (
            <CardField key={field.label} label={field.label}>
              {field.value}
            </CardField>
          ))}
        </div>
        <div className="mt-auto pt-4 pointer-events-auto">
          <Button
            size="sm"
            variant={open ? "outline" : "primary"}
            className="w-full"
            onClick={(event) => {
              event.stopPropagation();
              onToggle();
              showToast(
                open
                  ? `«${title}» закрыт для бронирования`
                  : `«${title}» открыт для бронирования`,
                "success"
              );
            }}
          >
            {open ? "Закрыть для бронирования" : "Открыть для бронирования"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
