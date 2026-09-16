"use client";

import type { CompanyProfile } from "@/data/types";
import { cn } from "@/lib/utils/cn";

interface Props {
  user: CompanyProfile;
  responsibleName?: string;
  asPageTitle?: boolean;
  actions?: React.ReactNode;
  className?: string;
}

export function AccountCabinetHeader({ actions, className }: Props) {
  if (!actions) return null;

  return (
    <div className={cn("mb-4 flex flex-wrap items-start justify-end gap-4", className)}>
      <div className="shrink-0">{actions}</div>
    </div>
  );
}
