import { Badge } from "@/components/ui/badge";

interface ContractorRegistryBadgesProps {
  inRsvya?: boolean;
  inSroVz?: boolean;
}

export function ContractorRegistryBadges({
  inRsvya,
  inSroVz,
}: ContractorRegistryBadgesProps) {
  if (!inRsvya && !inSroVz) return null;

  return (
    <>
      {inRsvya && <Badge variant="outline">Входит в РСВЯ</Badge>}
      {inSroVz && <Badge variant="outline">Входит в СРО ВЗ</Badge>}
    </>
  );
}
