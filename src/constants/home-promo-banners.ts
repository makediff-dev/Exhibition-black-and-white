export interface HomePromoAdvertiser {
  name: string;
  inn: string;
  erid: string;
}

export interface HomePromoBanner {
  id: string;
  href: string;
  imageUrl: string;
  alt: string;
  title: string;
  ctaLabel: string;
  active: boolean;
  advertiser: HomePromoAdvertiser;
}

export const HOME_PROMO_AUTOPLAY_MS = 5000;

export const HOME_PROMO_BANNERS: HomePromoBanner[] = [
  {
    id: "stand-14-days",
    href: "/services",
    imageUrl: "/home/promo-slider.jpg",
    alt: "Выставочный стенд за 14 дней: проект, производство и монтаж",
    title: "Выставочный стенд за 14 дней: проект, производство и монтаж",
    ctaLabel: "Рассчитать стоимость",
    active: true,
    advertiser: {
      name: "ООО «СтендПро»",
      inn: "7702345678",
      erid: "2SDnjeXXXXX",
    },
  },
  {
    id: "stand-turnkey",
    href: "/services",
    imageUrl: "/home/promo-slider.jpg",
    alt: "Стенд под ключ: дизайн, производство и монтаж на площадке",
    title: "Выставочный стенд за 14 дней: проект, производство и монтаж",
    ctaLabel: "Рассчитать стоимость",
    active: true,
    advertiser: {
      name: "ООО «ДизайнСтенд»",
      inn: "7703456789",
      erid: "2SDnjeYYYYY",
    },
  },
  {
    id: "stand-montage",
    href: "/contractors",
    imageUrl: "/home/promo-slider.jpg",
    alt: "Монтаж выставочных конструкций в срок открытия",
    title: "Выставочный стенд за 14 дней: проект, производство и монтаж",
    ctaLabel: "Рассчитать стоимость",
    active: true,
    advertiser: {
      name: "ООО «МебельЭкспо»",
      inn: "7704567890",
      erid: "2SDnjeZZZZZ",
    },
  },
];

export function getActiveHomePromoBanners(): HomePromoBanner[] {
  return HOME_PROMO_BANNERS.filter((banner) => banner.active);
}
