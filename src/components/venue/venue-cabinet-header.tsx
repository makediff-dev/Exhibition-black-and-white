"use client";

import { SEED_VENUE_EMPLOYEES } from "@/data/mocks/seed";
import type { CompanyProfile } from "@/data/types";
import { AccountCabinetHeader } from "@/components/account/account-cabinet-header";

interface Props {
  user: CompanyProfile;
  venueId?: string;
}

export function VenueCabinetHeader({ user, venueId = "venue-1" }: Props) {
  const responsible =
    SEED_VENUE_EMPLOYEES.find(
      (employee) => employee.venueId === venueId && employee.isAdmin && employee.status === "active"
    )?.fullName ?? user.director;

  return <AccountCabinetHeader user={user} responsibleName={responsible} />;
}
