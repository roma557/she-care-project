"use client";

import { AppNotification, getNotificationIcon, formatNotificationTime } from "@/lib/notifications";
import { AppScreen } from "@/lib/phone";

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
  onMarkAllRead: () => void;
  onNavigate?: (screen: AppScreen) => void;
}

export function NotificationsPanel({
  open,
  onClose,
  notifications,
  onMarkRead,
  onDismiss,
  onMarkAllRead,
  onNavigate,
}: NotificationsPanelProps) {
  if (!open) return null;

  const unread = notifications.filter((n) => !n.read).length;

  function handleTap(n: AppNotification) {
    if (!n.read) onMarkRead(n.id);
    if (n.actionScreen && onNavigate) {
      onNavigate(n.actionScreen as AppScreen);
      onClose();
    }
  }

  return (
    <div className="absolute inset-0 z-30 flex flex-col">
      <button
        type="button"
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Close notifications"
      />

      <div
        className="relative mt-auto flex max-h-[75%] flex-col rounded-t-3xl bg-white shadow-2xl"
        style={{ paddingBottom: "var(--app-safe-bottom)" }}
      >
        <div className="flex items-center justify-between border-b border-pink-light/60 px-5 py-4">
          <div>
            <h2 className="font-serif text-lg text-purple-dark">Notifications</h2>
            {unread > 0 && (
              <p className="text-[10px] text-gray-500">{unread} unread</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {unread > 0 && (
              <button
                type="button"
                onClick={onMarkAllRead}
                className="text-[10px] font-medium text-pink-mid"
              >
                Mark all read
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-light/60"
              aria-label="Close"
            >
              <svg className="h-4 w-4 text-purple-dark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="hide-scrollbar flex-1 overflow-y-auto px-4 py-3">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <span className="text-4xl">🔔</span>
              <p className="mt-3 text-sm text-gray-600">No notifications yet</p>
              <p className="mt-1 text-[10px] text-gray-400">
                We&apos;ll remind you about your cycle, wellness tips & more
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {notifications.map((n) => (
                <li key={n.id}>
                  <div
                    className={`flex gap-3 rounded-2xl p-3 transition-colors ${
                      n.read ? "bg-gray-50" : "bg-pink-light/50"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleTap(n)}
                      className="flex flex-1 gap-3 text-left"
                    >
                      <span className="text-xl">{getNotificationIcon(n.type)}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-xs font-medium ${n.read ? "text-gray-600" : "text-purple-dark"}`}>
                            {n.title}
                          </p>
                          {!n.read && (
                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-pink-mid" />
                          )}
                        </div>
                        <p className="mt-0.5 text-[10px] leading-relaxed text-gray-500">{n.body}</p>
                        <p className="mt-1 text-[9px] text-gray-400">{formatNotificationTime(n.createdAt)}</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDismiss(n.id)}
                      className="shrink-0 self-start p-1 text-gray-300 hover:text-gray-500"
                      aria-label="Dismiss"
                    >
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
