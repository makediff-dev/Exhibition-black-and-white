import Link from "next/link";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import type { PortfolioItem } from "@/data/types";

interface PortfolioCardProps {
  item: PortfolioItem;
  href?: string;
}

export function PortfolioCard({ item, href }: PortfolioCardProps) {
  const mediaPreview = item.photos.slice(0, 3);
  const extraPhotos = Math.max(item.photos.length - mediaPreview.length, 0);

  const content = (
    <>
      <div className="grid grid-cols-3 gap-1 mb-3">
        {mediaPreview.map((photo, index) => (
          <div
            key={`${item.id}-photo-${index}`}
            className="aspect-[4/3] border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center p-1 text-center text-[10px] text-gray-400"
          >
            {photo}
          </div>
        ))}
        {mediaPreview.length === 0 && (
          <div className="col-span-3 aspect-[16/9] border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-xs text-gray-400">
            Фото-заглушка
          </div>
        )}
      </div>

      {extraPhotos > 0 && (
        <p className="text-xs text-gray-500 mb-2">+{extraPhotos} фото</p>
      )}

      <p className="text-xs text-gray-500">{item.year}</p>
      <CardTitle className="mt-1">{item.title}</CardTitle>
      <CardDescription className="mt-2 flex-1 line-clamp-3">{item.description}</CardDescription>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="block w-full h-full">
        <Card className="flex flex-col h-full hover:border-gray-900 transition-colors">
          {content}
        </Card>
      </Link>
    );
  }

  return <Card className="flex flex-col h-full">{content}</Card>;
}
