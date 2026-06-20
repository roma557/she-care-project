/** Browser push helpers — service worker + Notification API (no remote push server). */

export type PushPermission = "default" | "granted" | "denied" | "unsupported";

const isDev = process.env.NODE_ENV === "development";

export function getPushPermission(): PushPermission {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission as PushPermission;
}

/** Remove stale service workers that break Next.js dev assets and HMR. */
export async function unregisterServiceWorkers(): Promise<void> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));

  if ("caches" in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  }
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  if (isDev) {
    await unregisterServiceWorkers();
    return null;
  }

  try {
    return await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  } catch {
    return null;
  }
}

export async function requestPushPermission(): Promise<PushPermission> {
  if (getPushPermission() === "unsupported") return "unsupported";

  const permission = await Notification.requestPermission();
  await registerServiceWorker();
  return permission as PushPermission;
}

export async function showBrowserNotification(input: {
  title: string;
  body: string;
  tag?: string;
}): Promise<boolean> {
  if (getPushPermission() !== "granted") return false;

  const registration = await navigator.serviceWorker?.ready.catch(() => null);

  if (registration) {
    await registration.showNotification(input.title, {
      body: input.body,
      tag: input.tag ?? input.title,
      icon: "/icon.svg",
      badge: "/icon.svg",
      data: { url: "/" },
    });
    return true;
  }

  if ("Notification" in window) {
    new Notification(input.title, {
      body: input.body,
      tag: input.tag ?? input.title,
      icon: "/icon.svg",
    });
    return true;
  }

  return false;
}

export async function notifyNewAwarenessItems(
  items: { id: string; title: string; body: string }[],
  alreadyShownIds: Set<string>,
): Promise<Set<string>> {
  const shown = new Set(alreadyShownIds);

  for (const item of items) {
    if (shown.has(item.id)) continue;
    const ok = await showBrowserNotification({
      title: item.title,
      body: item.body,
      tag: item.id,
    });
    if (ok) shown.add(item.id);
  }

  return shown;
}
