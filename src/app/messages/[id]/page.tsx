"use client";

import { useRouter } from "next/navigation";
import { use, useMemo, useState } from "react";
import { MessageThreadPanel } from "@/components/messages/message-thread-panel";
import { BackButton } from "@/components/ui/back-button";
import { EmptyState } from "@/components/ui/states";
import { useAuthStore, usePrototypeStore } from "@/lib/store";

export default function MessageThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuthStore();
  const { messages, addMessage } = usePrototypeStore();

  const [text, setText] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);

  const thread = useMemo(
    () => messages.find((t) => t.id === id),
    [messages, id],
  );

  const senderName = user?.name || "Гость";

  const handleSend = () => {
    if (!text.trim() && attachedFiles.length === 0) return;
    if (!thread) return;

    addMessage(thread.id, {
      id: `m-${Date.now()}`,
      sender: senderName,
      text: text.trim() || "(файл без текста)",
      date: new Date().toISOString().split("T")[0],
      files: attachedFiles,
    });

    setText("");
    setAttachedFiles([]);
  };

  const handleAttach = (fileName: string) => {
    setAttachedFiles((prev) => [...prev, fileName]);
  };

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
      <BackButton fallbackHref="/messages" className="mb-2" />
      <h1 className="text-xl font-bold text-gray-900 mb-4">{thread.title}</h1>
      <div className="w-full mr-auto text-left max-w-3xl">
        <MessageThreadPanel
          thread={thread}
          senderName={senderName}
          text={text}
          attachedFiles={attachedFiles}
          onTextChange={setText}
          onAttach={handleAttach}
          onSend={handleSend}
        />
      </div>
    </>
  );
}