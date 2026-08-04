"use client";

import { SharedPageShell } from "@/components/layout/shared-page-shell";
import { DocumentsPanel } from "@/components/documents/documents-panel";

export default function DocumentsPage() {
  return (
    <SharedPageShell title="Документы">
      <DocumentsPanel filterMode="event-top-level" />
    </SharedPageShell>
  );
}
