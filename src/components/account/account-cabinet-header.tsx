"use client";

import { User } from "lucide-react";
import type { CompanyProfile } from "@/data/types";
import { cn } from "@/lib/utils/cn";

interface Props {
  user: CompanyProfile;
  responsibleName?: string;
  asPageTitle?: boolean;
  actions?: React.ReactNode;
  className?: string;
}

export function AccountCabinetHeader({
  user,
  responsibleName,
  asPageTitle = false,
  actions,
  className,
}: Props) {
  const responsible = responsibleName ?? user.director;

  return (
    <div
      className={cn(
        "mb-4 gap-4",
        actions ? "flex flex-wrap items-start justify-between" : "",
        className
      )}
    >
      <div className="space-y-1 min-w-0">
        <p
          className={
            asPageTitle
              ? "text-xl font-bold text-gray-900"
              : "text-base font-semibold text-gray-900"
          }
        >
          {user.name}
        </p>
        <p className="text-sm text-gray-600 inline-flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 shrink-0" />
          Ответственный: {responsible}
        </p>
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
