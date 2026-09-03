"use client";

import { notFound, useParams } from "next/navigation";
import { CabinetAwareLayout } from "@/components/layout/cabinet-aware-layout";
import { VenueDetailSection } from "@/components/venues/venue-detail-section";
import { getPublicVenueById } from "@/constants/venues";

export default function VenueDetailPage() {
  const params = useParams();
  const venueId = params.id as string;
  const venue = getPublicVenueById(venueId);

  if (!venue) notFound();

  return (
    <CabinetAwareLayout>
      <VenueDetailSection venue={venue} />
    </CabinetAwareLayout>
  );
}