import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";

interface ContractorRegistryBadgesProps {
  inRsvya?: boolean;
  inSroVz?: boolean;
  stacked?: boolean;
  className?: string;
}

export function ContractorRegistryBadges({
  inRsvya,
  inSroVz,
  stacked = false,
  className,
}: ContractorRegistryBadgesProps) {
  if (!inRsvya && !inSroVz) return null;

  if (!stacked) {
    return (
      <>
        {inRsvya && <Badge variant="outline">Входит в РСВЯ</Badge>}
        {inSroVz && <Badge variant="outline">Входит в СРО ВЗ</Badge>}
      </>
    );
  }

  return (
    <div className={cn("flex flex-col items-start gap-1 mt-2", className)}>
      {inRsvya && <Badge variant="outline">Входит в РСВЯ</Badge>}
      {inSroVz && <Badge variant="outline">Входит в СРО ВЗ</Badge>}
    </div>
  );
}