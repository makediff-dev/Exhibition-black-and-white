"use client";

import { useState } from "react";

export function ExpandableText({
  text,
  className,
  collapsedLength = 140,
}: {
  text: string;
  className?: string;
  collapsedLength?: number;
}) {
  const [open, setOpen] = useState(false);
  const needsToggle = text.length > collapsedLength;
  const visible = !needsToggle || open ? text : `${text.slice(0, collapsedLength).trimEnd()}…`;

  return (
    <p className={className}>
      {visible}{" "}
      {needsToggle ? (
        <button
          type="button"
          className="inline font-medium underline underline-offset-2"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Свернуть" : "Подробнее"}
        </button>
      ) : null}
    </p>
  );
}
