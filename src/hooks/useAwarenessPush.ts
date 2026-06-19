"use client";

import { useEffect, useRef } from "react";
import { AppNotification } from "@/lib/notifications";
import {
  getPushPermission,
  notifyNewAwarenessItems,
  registerServiceWorker,
  requestPushPermission,
} from "@/lib/push";
import { loadJSON, saveJSON } from "@/lib/storage";

const SHOWN_KEY = "hw-push-shown-ids";

interface UseAwarenessPushOptions {
  enabled: boolean;
  notifications: AppNotification[];
  onEnablePush?: () => void;
}

/** Show browser notifications for new awareness items when push is enabled. */
export function useAwarenessPush({
  enabled,
  notifications,
}: UseAwarenessPushOptions) {
  const shownRef = useRef<Set<string>>(new Set(loadJSON<string[]>(SHOWN_KEY, [])));

  useEffect(() => {
    registerServiceWorker();
  }, []);

  useEffect(() => {
    if (!enabled || getPushPermission() !== "granted") return;

    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;

    const latest = unread.slice(0, 2);
    notifyNewAwarenessItems(
      latest.map((n) => ({ id: n.id, title: n.title, body: n.body })),
      shownRef.current,
    ).then((updated) => {
      shownRef.current = updated;
      saveJSON(SHOWN_KEY, [...updated]);
    });
  }, [enabled, notifications]);
}

export async function enableBrowserPush(): Promise<"granted" | "denied" | "unsupported"> {
  const permission = await requestPushPermission();
  return permission === "granted"
    ? "granted"
    : permission === "unsupported"
      ? "unsupported"
      : "denied";
}

export function getBrowserPushStatus(): "granted" | "denied" | "default" | "unsupported" {
  return getPushPermission();
}
