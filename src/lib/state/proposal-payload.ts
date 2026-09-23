import type { Response } from "../../data/types/index.ts";

export function validateProposalPayload(response: Pick<Response, "price" | "approach">): {
  ok: boolean;
  reason: string;
} {
  if (!response.approach?.trim()) {
    return { ok: false, reason: "Опишите подход к выполнению." };
  }
  if (!Number.isFinite(response.price) || response.price <= 0) {
    return { ok: false, reason: "Укажите цену больше 0." };
  }
  return { ok: true, reason: "" };
}
