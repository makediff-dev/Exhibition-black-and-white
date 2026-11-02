"use client";

import { HomeTileCard, type HomeTileCardMetaItem } from "@/components/home/home-tile-card";
import { useAccountTheme } from "@/components/account/account-theme-provider";
import { toHomeTileButtonVariant } from "@/lib/utils/role-tile-button";

interface CabinetHomeTileProps {
  title: string;
  meta?: HomeTileCardMetaItem[];
  buttonLabel: string;
  buttonHref: string;
  imageUrls?: string[];
  imageAlt?: string;
}

export function CabinetHomeTile({
  title,
  meta,
  buttonLabel,
  buttonHref,
  imageUrls,
  imageAlt,
}: CabinetHomeTileProps) {
  const theme = useAccountTheme();
  const buttonVariant = toHomeTileButtonVariant(theme?.buttonVariant);

  return (
    <HomeTileCard
      title={title}
      meta={meta}
      buttonLabel={buttonLabel}
      buttonHref={buttonHref}
      imageUrls={imageUrls}
      imageAlt={imageAlt}
      buttonVariant={buttonVariant}
      sponsored={false}
    />
  );
}
