"use client";

import { Pencil, Trash2 } from "lucide-react";
import { cn, formatTime } from "@/lib/utils";
import type { ChatMessage } from "@/lib/types/chat";

export function MessageBubble({
  message,
  isMine,
  showSender,
  onEdit,
  onDelete,
}: {
  message: ChatMessage;
  isMine: boolean;
  showSender: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className={cn("group flex", isMine ? "justify-end" : "justify-start")}>
      <div className={cn("flex max-w-[75%] flex-col gap-0.5", isMine && "items-end")}>
        {showSender && !isMine && (
          <span className="px-1 text-xs font-semibold text-slate-500">{message.senderFullName}</span>
        )}
        <div className="flex items-center gap-1.5">
          {isMine && !message.isDeleted && (onEdit || onDelete) && (
            // Always visible on touch (there's no hover to reveal them with);
            // hover-revealed only once a pointer that can hover is available.
            <div className="flex items-center gap-1 sm:hidden sm:group-hover:flex">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800"
                  title="Edit"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="rounded-full p-2 text-slate-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}
          <div
            className={cn(
              "rounded-3xl px-4 py-2.5 text-sm",
              isMine
                ? "rounded-br-md bg-slate-800 text-white"
                : "rounded-bl-md bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100",
              message.isDeleted && "italic opacity-60",
            )}
          >
            {message.isDeleted ? "Message deleted" : message.content}
          </div>
        </div>
        <span className="px-1 text-[11px] text-slate-400">
          {formatTime(message.sentAt)}
          {message.editedAt && !message.isDeleted && " · edited"}
        </span>
      </div>
    </div>
  );
}
