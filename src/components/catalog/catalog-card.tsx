import { Card, type CardProps } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

export function CatalogCard({ className, ...props }: CardProps) {
  return (
    <Card
      className={cn(
        "border-0 rounded-[14px] overflow-hidden p-0 shadow-none",
        className,
      )}
      {...props}
    />
  );
}