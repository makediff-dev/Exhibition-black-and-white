export const HOME_IMAGES = {
  heroBanner: "/home/hero-banner.png",
  howItWorks: "/home/how-it-works.png",
  categories: [
    "/home/categories/category-01.png",
    "/home/categories/category-02.png",
    "/home/categories/category-03.png",
    "/home/categories/category-04.png",
    "/home/categories/category-05.png",
    "/home/categories/category-06.png",
    "/home/categories/category-07.png",
    "/home/categories/category-08.png",
    "/home/categories/category-09.png",
    "/home/categories/category-10.png",
    "/home/categories/category-11.png",
    "/home/categories/category-12.png",
  ] as const,
  categoryMore: "/home/categories/category-more.png",
  quickActions: [
    "/home/quick-actions/action-01.png",
    "/home/quick-actions/action-02.png",
    "/home/quick-actions/action-03.png",
    "/home/quick-actions/action-04.png",
    "/home/quick-actions/action-05.png",
  ] as const,
  urgent: [
    "/home/tiles/urgent-01.png",
    "/home/tiles/urgent-02.png",
    "/home/tiles/urgent-03.png",
    "/home/tiles/urgent-04.png",
    "/home/tiles/urgent-05.png",
  ] as const,
  construction: [
    "/home/tiles/construction-01.png",
    "/home/tiles/construction-02.png",
    "/home/tiles/construction-03.png",
    "/home/tiles/construction-04.png",
    "/home/tiles/construction-05.png",
  ] as const,
  events: [
    "/home/tiles/event-01.png",
    "/home/tiles/event-02.png",
    "/home/tiles/event-03.png",
    "/home/tiles/event-04.png",
    "/home/tiles/event-05.png",
  ] as const,
  stand: [
    "/home/tiles/stand-01.png",
    "/home/tiles/stand-02.png",
    "/home/tiles/stand-03.png",
    "/home/tiles/stand-04.png",
    "/home/tiles/stand-05.png",
  ] as const,
  venue: [
    "/home/tiles/venue-01.png",
    "/home/tiles/venue-02.png",
    "/home/tiles/venue-03.png",
    "/home/tiles/venue-04.png",
    "/home/tiles/venue-05.png",
  ] as const,
  audience: [
    "/home/audience/audience-01.png",
    "/home/audience/audience-02.png",
    "/home/audience/audience-03.png",
    "/home/audience/audience-04.png",
  ] as const,
  workFormats: [
    "/home/work-formats/format-01.png",
    "/home/work-formats/format-02.png",
    "/home/work-formats/format-03.png",
    "/home/work-formats/format-04.png",
  ] as const,
} as const;

export function pickHomeImage(images: readonly string[], index: number): string {
  return images[index % images.length];
}
