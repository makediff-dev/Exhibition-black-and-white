import { Card, type CardProps } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

export function CatalogCard({ className, ...props }: CardProps) {
  return (
    <Card
      flush
      className={cn(
        "border-0 rounded-[14px] overflow-hidden shadow-none",
        className,
      )}
      {...props}
    />
  );
}