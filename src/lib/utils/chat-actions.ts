import type { ChatMessage, ChatMessagePin, ChatPinScope, MessageThread } from "@/data/types";

export function getMessagePreviewText(message: ChatMessage): string {
  if (message.deletedAt) return "Сообщение удалено";
  return message.text || (message.files.length ? "Файл" : "");
}

export function withSyncedPreview(thread: MessageThread): MessageThread {
  const lastVisible =
    [...thread.messages].reverse().find((message) => !message.deletedAt) ??
    thread.messages[thread.messages.length - 1];

  return {
    ...thread,
    lastMessage: lastVisible ? getMessagePreviewText(lastVisible) : thread.lastMessage,
    lastDate: lastVisible?.date ?? thread.lastDate,
  };
}

export function canUnsendMessage(message: ChatMessage, senderName: string): boolean {
  return message.sender === senderName && !message.deletedAt && !message.readAt;
}

export function canEditMessage(message: ChatMessage, senderName: string): boolean {
  return message.sender === senderName && !message.deletedAt;
}

export function getVisibleMessagePins(thread: MessageThread, actorId: string): ChatMessagePin[] {
  return (thread.pins ?? []).filter(
    (pin) => pin.scope === "everyone" || pin.pinnedBy === actorId,
  );
}

export function hasMessagePin(
  thread: MessageThread,
  messageId: string,
  scope: ChatPinScope,
  actorId: string,
): boolean {
  return (thread.pins ?? []).some(
    (pin) =>
      pin.messageId === messageId &&
      pin.scope === scope &&
      (scope === "everyone" || pin.pinnedBy === actorId),
  );
}

export function isThreadInboxPinned(thread: MessageThread, actorId: string): boolean {
  return (thread.inboxPinnedBy ?? []).includes(actorId);
}

export function sortInboxThreads(threads: MessageThread[], actorId: string): MessageThread[] {
  return [...threads].sort((left, right) => {
    const leftPinned = isThreadInboxPinned(left, actorId);
    const rightPinned = isThreadInboxPinned(right, actorId);
    if (leftPinned !== rightPinned) return leftPinned ? -1 : 1;
    return right.lastDate.localeCompare(left.lastDate);
  });
}

export function mergeChatMessage(seed: ChatMessage, stored?: ChatMessage): ChatMessage {
  if (!stored) {
    return seed.readAt ? seed : { ...seed, readAt: seed.date };
  }

  return {
    ...seed,
    text: stored.editedAt || stored.deletedAt ? stored.text : seed.text,
    files: stored.deletedAt ? stored.files : seed.files,
    editedAt: stored.editedAt,
    deletedAt: stored.deletedAt,
    readAt: stored.readAt ?? seed.readAt ?? seed.date,
    forwardedFrom: stored.forwardedFrom ?? seed.forwardedFrom,
  };
}
