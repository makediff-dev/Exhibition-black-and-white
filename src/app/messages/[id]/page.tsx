"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { MessagesInbox } from "@/components/messages/messages-inbox";
import { BackButton } from "@/components/ui/back-button";
import { EmptyState } from "@/components/ui/states";
import { usePrototypeStore } from "@/lib/store";

export default function MessageThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const thread = usePrototypeStore((state) => state.messages.find((item) => item.id === id));

  if (!thread) {
    return (
      <>
        <BackButton fallbackHref="/messages" className="mb-2" />
        <h1 className="text-xl font-bold text-gray-900 mb-4">Переписка</h1>
        <EmptyState
          title="Переписка не найдена"
          description="Возможно, она была удалена или ссылка неверна"
          actionLabel="К списку сообщений"
          onAction={() => router.push("/messages")}
        />
      </>
    );
  }

  return (
    <>
      <div className="mb-2 md:hidden">
        <BackButton fallbackHref="/messages" />
      </div>
      <MessagesInbox selectedThreadId={id} />
    </>
  );
}
