"use client";

import { Paperclip, Send } from "lucide-react";
import { useLayoutEffect, useRef } from "react";
import { useAccountTheme } from "@/components/account/account-theme-provider";
import styles from "@/components/messages/messages.module.css";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { Textarea } from "@/components/ui/textarea";
import type { MessageThread } from "@/data/types";
import { formatDate } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils/cn";

interface MessageThreadPanelProps {
  thread: MessageThread;
  senderName: string;
  text: string;
  attachedFiles: string[];
  onTextChange: (value: string) => void;
  onAttach: (fileName: string) => void;
  onSend: () => void;
}

export function MessageThreadPanel({
  thread,
  senderName,
  text,
  attachedFiles,
  onTextChange,
  onAttach,
  onSend,
}: MessageThreadPanelProps) {
  const accountTheme = useAccountTheme();
  const messagesRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const node = messagesRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [thread.id, thread.messages.length]);

  return (
    <div className={cn(styles.threadPanel, !accountTheme && "rounded-[14px]")}>
      <div ref={messagesRef} className={styles.threadMessages}>
        {thread.messages.map((msg) => {
          const isOwn = msg.sender === senderName;

          return (
            <div
              key={msg.id}
              className={cn("flex", isOwn ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[80%] border px-3 py-2 text-sm rounded-button",
                  isOwn
                    ? accountTheme
                      ? styles.messageBubbleOwn
                      : "bg-gray-900 text-white border-gray-900"
                    : accountTheme
                      ? styles.messageBubbleIncoming
                      : "bg-white text-gray-900 border-gray-300",
                )}
              >
                <p className={cn("text-xs mb-1", isOwn ? "opacity-80" : "text-gray-500")}>
                  {msg.sender}
                </p>
                <p>{msg.text}</p>
                {msg.files.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {msg.files.map((file) => (
                      <li
                        key={file}
                        className={cn(
                          "text-xs flex items-center gap-1",
                          isOwn ? "text-white/80" : "text-gray-600",
                        )}
                      >
                        <Paperclip className="h-3 w-3" />
                        {file}
                      </li>
                    ))}
                  </ul>
                )}
                <p className={cn("text-xs mt-1", isOwn ? "text-white/70" : "text-gray-500")}>
                  {formatDate(msg.date)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.threadComposer}>
        <Textarea
          label="Новое сообщение"
          placeholder="Введите текст..."
          value={text}
          onChange={(event) => onTextChange(event.target.value)}
          className="rounded-button"
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onSend();
            }
          }}
        />

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <FileUpload label="Прикрепить файл" onUpload={onAttach} />
            {attachedFiles.length > 0 && (
              <p className="text-xs text-gray-600 mt-1">
                К отправке: {attachedFiles.join(", ")}
              </p>
            )}
          </div>
          <Button onClick={onSend} disabled={!text.trim() && attachedFiles.length === 0}>
            <Send className="h-4 w-4" />
            Отправить
          </Button>
        </div>
      </div>
    </div>
  );
}