"use client";

import { notFound, useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { CabinetAwareLayout } from "@/components/layout/cabinet-aware-layout";
import { VenueDetailSection } from "@/components/venues/venue-detail-section";
import { getPublicVenueByCatalogId, getPublicVenueById } from "@/constants/venues";

export default function VenueDetailPage() {
  const params = useParams();
  const router = useRouter();
  const venueId = params.id as string;
  const venue = getPublicVenueById(venueId) ?? getPublicVenueByCatalogId(venueId);

  useEffect(() => {
    if (venue && venue.id !== venueId) {
      router.replace(`/venues/${venue.id}`);
    }
  }, [router, venue, venueId]);

  if (!venue) notFound();

  return (
    <CabinetAwareLayout>
      <VenueDetailSection venue={venue} />
    </CabinetAwareLayout>
  );
}
