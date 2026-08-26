"use client";

import { notFound, useParams } from "next/navigation";
import { PublicHeader } from "@/components/layout/public-header";
import { Footer } from "@/components/layout/footer";
import { VenueDetailSection } from "@/components/venues/venue-detail-section";
import { getPublicVenueById } from "@/constants/venues";

export default function VenueDetailPage() {
  const params = useParams();
  const venueId = params.id as string;
  const venue = getPublicVenueById(venueId);

  if (!venue) notFound();

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1 mx-auto max-w-site w-full px-4 py-8">
        <VenueDetailSection venue={venue} />
      </main>
      <Footer />
    </div>
  );
}
