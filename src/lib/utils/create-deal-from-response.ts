import { DEMO_USERS } from "@/data/mocks/seed";
import type { Deal, DealStage, Request, Response } from "@/data/types";

export function createDealFromResponse({
  request,
  response,
  dealsCount,
  actorName,
}: {
  request: Request;
  response: Response;
  dealsCount: number;
  actorName: string;
}): Deal {
  const dealId = `deal-${Date.now()}`;
  const stages: DealStage[] =
    response.estimate.length > 0
      ? response.estimate.map((section, index) => ({
          id: `st-${dealId}-${index}`,
          title: section.title,
          description: section.items.map((item) => item.name).join(", "),
          price: section.items.reduce((sum, item) => sum + item.quantity * item.price, 0),
          deadline: response.deadline,
          status: "pending" as const,
          files: [],
          comments: [],
        }))
      : [
          {
            id: `st-${dealId}-0`,
            title: "Выполнение работ",
            description: response.approach,
            price: response.price,
            deadline: response.deadline,
            status: "pending" as const,
            files: [],
            comments: [],
          },
        ];

  return {
    id: dealId,
    number: `СД-${new Date().getFullYear()}-${String(dealsCount + 1).padStart(3, "0")}`,
    title: request.title,
    format: request.format,
    customerId: request.customerId,
    customerName: DEMO_USERS.customer.name,
    contractorId: response.contractorId,
    contractorName: response.contractorName,
    totalPrice: response.price,
    status: request.format === "safe_deal" ? "negotiation" : "awaiting_payment",
    stages,
    requestId: request.id,
    history: [
      {
        date: new Date().toISOString().split("T")[0],
        action: "Сделка создана после назначения исполнителя",
        actor: actorName,
      },
    ],
    documents: [],
    commission: Math.round(response.price * 0.05),
  };
}
