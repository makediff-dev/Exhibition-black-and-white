"use client";

import type { CompanyProfile } from "@/data/types";
import { AccountCabinetHeader } from "@/components/account/account-cabinet-header";

interface Props {
  user: CompanyProfile;
  venueId?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function VenueCabinetHeader({ user, actions, className }: Props) {
  return <AccountCabinetHeader user={user} actions={actions} className={className} />;
}
