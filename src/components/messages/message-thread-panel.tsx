"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Forward, MoreHorizontal, Paperclip, Pencil, Pin, PinOff, Send, Undo2 } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAccountTheme } from "@/components/account/account-theme-provider";
import styles from "@/components/messages/messages.module.css";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import { ConfirmModal, Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast-provider";
import type { ChatMessage, ChatPinScope, MessageThread } from "@/data/types";
import { getContextBackLabel, getThreadContextRef } from "@/lib/domain/entity-ref";
import { useCabinetSession } from "@/lib/hooks/use-cabinet-session";
import { usePrototypeStore } from "@/lib/store";
import {
  canEditMessage,
  canUnsendMessage,
  getVisibleMessagePins,
  hasMessagePin,
} from "@/lib/utils/chat-actions";
import { formatDate, formatDateTime } from "@/lib/utils/formatters";
import { resolveMessageRelatedHref, withFromMessages } from "@/lib/utils/message-related-links";
import { cn } from "@/lib/utils/cn";

interface MessageThreadPanelProps {
  thread: MessageThread;
  senderName: string;
  actorId: string;
  forwardTargets: MessageThread[];
  text: string;
  attachedFiles: string[];
  editingMessageId: string | null;
  onTextChange: (value: string) => void;
  onAttach: (fileName: string) => void;
  onSend: () => void;
  onStartEdit: (message: ChatMessage) => void;
  onCancelEdit: () => void;
}

export function MessageThreadPanel({
  thread,
  senderName,
  actorId,
  forwardTargets,
  text,
  attachedFiles,
  editingMessageId,
  onTextChange,
  onAttach,
  onSend,
  onStartEdit,
  onCancelEdit,
}: MessageThreadPanelProps) {
  const accountTheme = useAccountTheme();
  const { accountRole } = useCabinetSession();
  const { showToast } = useToast();
  const router = useRouter();
  const messagesRef = useRef<HTMLDivElement>(null);
  const {
    pinChatMessage,
    unpinChatMessage,
    unsendChatMessage,
    forwardChatMessage,
  } = usePrototypeStore();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuCoords, setMenuCoords] = useState({ top: 0, left: 0 });
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const menuListRef = useRef<HTMLDivElement | null>(null);
  const [unsendId, setUnsendId] = useState<string | null>(null);
  const [forwardMessage, setForwardMessage] = useState<ChatMessage | null>(null);
  const [forwardQuery, setForwardQuery] = useState("");
  const context = getThreadContextRef(thread);
  const contextHref =
    context && context.type !== "support"
      ? withFromMessages(resolveMessageRelatedHref(thread, accountRole))
      : null;
  const visiblePins = getVisibleMessagePins(thread, actorId);
  const filteredForwardTargets = useMemo(() => {
    const query = forwardQuery.trim().toLowerCase();
    return forwardTargets.filter((item) =>
      query ? item.title.toLowerCase().includes(query) : true,
    );
  }, [forwardQuery, forwardTargets]);

  useLayoutEffect(() => {
    const node = messagesRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [thread.id, thread.messages.length, editingMessageId]);

  useLayoutEffect(() => {
    if (!openMenuId) return;

    const updatePosition = () => {
      const trigger = menuTriggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const menuWidth = 228;
      const menuHeight = menuListRef.current?.offsetHeight ?? 220;
      const left = Math.max(8, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8));
      const below = rect.bottom + 4;
      const top =
        below + menuHeight > window.innerHeight - 8
          ? Math.max(8, rect.top - menuHeight - 4)
          : below;
      setMenuCoords({ top, left });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    document.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      document.removeEventListener("scroll", updatePosition, true);
    };
  }, [openMenuId]);

  useEffect(() => {
    if (!openMenuId) return;

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuTriggerRef.current?.contains(target) || menuListRef.current?.contains(target)) {
        return;
      }
      setOpenMenuId(null);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenMenuId(null);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openMenuId]);

  const openMenuMessage = openMenuId
    ? thread.messages.find((message) => message.id === openMenuId)
    : undefined;

  const scrollToMessage = (messageId: string) => {
    const node = document.getElementById(`chat-msg-${messageId}`);
    node?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handlePin = (message: ChatMessage, scope: ChatPinScope) => {
    const alreadyPinned = hasMessagePin(thread, message.id, scope, actorId);
    if (alreadyPinned) {
      unpinChatMessage(thread.id, message.id, scope, actorId);
      showToast(scope === "self" ? "Закрепление для вас снято" : "Закрепление для всех снято");
    } else {
      pinChatMessage(thread.id, message.id, scope, actorId);
      showToast(scope === "self" ? "Закреплено только для вас" : "Закреплено для всех участников");
    }
    setOpenMenuId(null);
  };

  const handleConfirmUnsend = () => {
    if (!unsendId) return;
    const ok = unsendChatMessage(thread.id, unsendId, senderName);
    showToast(ok ? "Отправка отменена" : "Нельзя отменить: сообщение уже прочитано", ok ? "success" : "info");
    if (ok && editingMessageId === unsendId) onCancelEdit();
    setUnsendId(null);
    setOpenMenuId(null);
  };

  const handleForward = (targetId: string) => {
    if (!forwardMessage) return;
    const ok = forwardChatMessage(thread.id, forwardMessage.id, targetId, senderName);
    if (ok) {
      showToast("Сообщение переслано", "success");
      setForwardMessage(null);
      setForwardQuery("");
      setOpenMenuId(null);
      router.push(`/messages/${targetId}`);
      return;
    }
    showToast("Не удалось переслать сообщение", "info");
  };

  return (
    <div className={cn(styles.threadPanel, !accountTheme && "rounded-[14px]")}>
      <div className={styles.threadContext}>
        <p className={styles.threadContextTitle}>{thread.title}</p>
        {contextHref ? (
          <Link href={contextHref} className={styles.messageCardLink}>
            {getContextBackLabel(context?.type ?? thread.relatedType)}
          </Link>
        ) : null}
      </div>

      {visiblePins.length > 0 ? (
        <div className={styles.pinBanner} aria-label="Закреплённые сообщения">
          {visiblePins.map((pin) => {
            const message = thread.messages.find((item) => item.id === pin.messageId);
            if (!message || message.deletedAt) return null;
            return (
              <div key={`${pin.messageId}-${pin.scope}-${pin.pinnedBy}`} className={styles.pinBannerRow}>
                <button
                  type="button"
                  className={styles.pinBannerJump}
                  onClick={() => scrollToMessage(pin.messageId)}
                >
                  <Pin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className={styles.pinBannerLabel}>
                    {pin.scope === "self" ? "Только вы" : "Все"}
                  </span>
                  <span className={styles.pinBannerText}>{message.text}</span>
                </button>
                <button
                  type="button"
                  className={styles.iconButton}
                  aria-label="Открепить сообщение"
                  onClick={() => handlePin(message, pin.scope)}
                >
                  <PinOff className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      ) : null}

      <div ref={messagesRef} className={styles.threadMessages}>
        {thread.messages.map((msg) => {
          const isOwn = msg.sender === senderName;
          const isDeleted = Boolean(msg.deletedAt);
          const pinnedSelf = hasMessagePin(thread, msg.id, "self", actorId);
          const pinnedEveryone = hasMessagePin(thread, msg.id, "everyone", actorId);

          return (
            <div
              key={msg.id}
              id={`chat-msg-${msg.id}`}
              className={cn("flex", isOwn ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[80%] border px-3 py-2 text-sm rounded-button",
                  styles.messageBubble,
                  isOwn
                    ? accountTheme
                      ? styles.messageBubbleOwn
                      : "bg-gray-900 text-white border-gray-900"
                    : accountTheme
                      ? styles.messageBubbleIncoming
                      : "bg-white text-gray-900 border-gray-300",
                )}
              >
                <div className={styles.messageHeader}>
                  <p className={cn("text-xs mb-0", isOwn ? "opacity-80" : "text-gray-500")}>
                    {msg.sender}
                  </p>
                  {!isDeleted ? (
                    <div className={styles.messageMenu}>
                      <button
                        type="button"
                        className={styles.iconButton}
                        aria-expanded={openMenuId === msg.id}
                        aria-haspopup="menu"
                        aria-label="Действия с сообщением"
                        onClick={(event) => {
                          menuTriggerRef.current = event.currentTarget;
                          setOpenMenuId((current) => (current === msg.id ? null : msg.id));
                        }}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  ) : null}
                </div>

                {msg.forwardedFrom ? (
                  <p className={cn(styles.forwardMeta, isOwn ? "text-white/75" : "text-gray-500")}>
                    Переслано из «{msg.forwardedFrom.threadTitle}» · {msg.forwardedFrom.sender}
                  </p>
                ) : null}

                {isDeleted ? (
                  <p className={styles.deletedText}>Сообщение удалено</p>
                ) : (
                  <p>{msg.text}</p>
                )}

                {!isDeleted && msg.files.length > 0 && (
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
                  {msg.editedAt && !isDeleted ? " · изменено" : ""}
                  {pinnedSelf || pinnedEveryone ? (
                    <span className={styles.inlinePinHint}>
                      {" · "}
                      {pinnedEveryone ? "закреплено для всех" : "закреплено у вас"}
                    </span>
                  ) : null}
                </p>
                {msg.editedAt && !isDeleted ? (
                  <p className={cn("text-[11px] mt-0.5", isOwn ? "text-white/60" : "text-gray-400")}>
                    {formatDateTime(msg.editedAt)}
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.threadComposer}>
        <Textarea
          label={editingMessageId ? "Редактирование сообщения" : "Новое сообщение"}
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
            {editingMessageId ? (
              <p className="text-xs text-gray-600">Можно изменить только текст. Вложения останутся как есть.</p>
            ) : (
              <>
                <FileUpload label="Прикрепить файл" onUpload={onAttach} />
                {attachedFiles.length > 0 && (
                  <p className="text-xs text-gray-600 mt-1">
                    К отправке: {attachedFiles.join(", ")}
                  </p>
                )}
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {editingMessageId ? (
              <Button type="button" variant="outline" onClick={onCancelEdit}>
                Отмена
              </Button>
            ) : null}
            <Button onClick={onSend} disabled={!text.trim() && attachedFiles.length === 0}>
              <Send className="h-4 w-4" />
              {editingMessageId ? "Сохранить" : "Отправить"}
            </Button>
          </div>
        </div>
      </div>

      {openMenuMessage && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menuListRef}
              className={styles.messageMenuList}
              role="menu"
              style={{ top: menuCoords.top, left: menuCoords.left }}
            >
              {canEditMessage(openMenuMessage, senderName) ? (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onStartEdit(openMenuMessage);
                    setOpenMenuId(null);
                  }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Изменить
                </button>
              ) : null}
              {canUnsendMessage(openMenuMessage, senderName) ? (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => setUnsendId(openMenuMessage.id)}
                >
                  <Undo2 className="h-3.5 w-3.5" />
                  Отменить отправку
                </button>
              ) : null}
              <button type="button" role="menuitem" onClick={() => handlePin(openMenuMessage, "self")}>
                {hasMessagePin(thread, openMenuMessage.id, "self", actorId) ? (
                  <PinOff className="h-3.5 w-3.5" />
                ) : (
                  <Pin className="h-3.5 w-3.5" />
                )}
                {hasMessagePin(thread, openMenuMessage.id, "self", actorId)
                  ? "Открепить у себя"
                  : "Закрепить себе"}
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => handlePin(openMenuMessage, "everyone")}
              >
                {hasMessagePin(thread, openMenuMessage.id, "everyone", actorId) ? (
                  <PinOff className="h-3.5 w-3.5" />
                ) : (
                  <Pin className="h-3.5 w-3.5" />
                )}
                {hasMessagePin(thread, openMenuMessage.id, "everyone", actorId)
                  ? "Открепить у всех"
                  : "Закрепить всем"}
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setForwardMessage(openMenuMessage);
                  setOpenMenuId(null);
                }}
              >
                <Forward className="h-3.5 w-3.5" />
                Переслать
              </button>
            </div>,
            document.body,
          )
        : null}

      <ConfirmModal
        open={Boolean(unsendId)}
        onClose={() => setUnsendId(null)}
        onConfirm={handleConfirmUnsend}
        title="Отменить отправку"
        message="Сообщение исчезнет у всех, если его ещё не открыли. После прочтения отменить нельзя."
      />

      <Modal
        open={Boolean(forwardMessage)}
        onClose={() => {
          setForwardMessage(null);
          setForwardQuery("");
        }}
        title="Переслать в другой чат"
      >
        <div className="space-y-3">
          <Input
            label="Найти чат"
            value={forwardQuery}
            onChange={(event) => setForwardQuery(event.target.value)}
            placeholder="Название переписки"
          />
          {filteredForwardTargets.length === 0 ? (
            <p className="text-sm text-gray-600">Нет доступных чатов для пересылки</p>
          ) : (
            <ul className={styles.forwardList}>
              {filteredForwardTargets.map((item) => (
                <li key={item.id}>
                  <button type="button" className={styles.forwardListButton} onClick={() => handleForward(item.id)}>
                    <span className={styles.forwardListTitle}>{item.title}</span>
                    <span className={styles.forwardListPreview}>{item.lastMessage}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Modal>
    </div>
  );
}
