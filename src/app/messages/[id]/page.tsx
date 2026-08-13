"use client";

import { useRouter } from "next/navigation";
import { use, useMemo, useState } from "react";
import { Paperclip, Send } from "lucide-react";
import { SharedPageShell } from "@/components/layout/shared-page-shell";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/ui/states";
import { useAuthStore, usePrototypeStore } from "@/lib/store";
import { formatDate } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";

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
    [messages, id]
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
      <SharedPageShell title="Переписка" showBack backFallbackHref="/messages">
        <EmptyState
          title="Переписка не найдена"
          description="Возможно, она была удалена или ссылка неверна"
          actionLabel="К списку сообщений"
          onAction={() => router.push("/messages")}
        />
      </SharedPageShell>
    );
  }

  return (
    <SharedPageShell
      title={thread.title}
      showBack
      backFallbackHref="/messages"
    >
      <div className="w-full mr-auto text-left">
        <div className="border border-gray-300 flex flex-col" style={{ minHeight: "420px" }}>
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[50vh]">
          {thread.messages.map((msg) => {
            const isOwn = msg.sender === senderName;

            return (
              <div
                key={msg.id}
                className={cn("flex", isOwn ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[80%] border px-3 py-2 text-sm",
                    isOwn
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-900 border-gray-300"
                  )}
                >
                  <p className="text-xs opacity-70 mb-1">{msg.sender}</p>
                  <p>{msg.text}</p>
                  {msg.files.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {msg.files.map((file) => (
                        <li
                          key={file}
                          className={cn(
                            "text-xs flex items-center gap-1",
                            isOwn ? "text-gray-300" : "text-gray-600"
                          )}
                        >
                          <Paperclip className="h-3 w-3" />
                          {file}
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className={cn("text-xs mt-1", isOwn ? "text-gray-400" : "text-gray-500")}>
                    {formatDate(msg.date)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-gray-300 p-4 space-y-3 bg-gray-50">
          <Textarea
            label="Новое сообщение"
            placeholder="Введите текст..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <FileUpload label="Прикрепить файл" onUpload={handleAttach} />
              {attachedFiles.length > 0 && (
                <p className="text-xs text-gray-600 mt-1">
                  К отправке: {attachedFiles.join(", ")}
                </p>
              )}
            </div>
            <Button onClick={handleSend} disabled={!text.trim() && attachedFiles.length === 0}>
              <Send className="h-4 w-4" />
              Отправить
            </Button>
          </div>
        </div>
        </div>
      </div>
    </SharedPageShell>
  );
}
