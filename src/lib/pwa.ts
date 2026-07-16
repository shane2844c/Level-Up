export function isStandaloneDisplay(): boolean {
  if (typeof window === "undefined") return false;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function isIosDevice(): boolean {
  if (typeof window === "undefined") return false;

  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

export function isAndroidDevice(): boolean {
  if (typeof window === "undefined") return false;

  return /android/i.test(window.navigator.userAgent);
}

export const INSTALL_DISMISS_KEY = "level-up-install-dismissed";
export const INSTALL_DISMISS_DAYS = 7;

export function isInstallDismissed(): boolean {
  if (typeof window === "undefined") return false;

  const raw = window.localStorage.getItem(INSTALL_DISMISS_KEY);
  if (!raw) return false;

  const dismissedAt = Number(raw);
  if (Number.isNaN(dismissedAt)) return false;

  const msPerDay = 24 * 60 * 60 * 1000;
  return Date.now() - dismissedAt < INSTALL_DISMISS_DAYS * msPerDay;
}

export function dismissInstallPrompt(): void {
  window.localStorage.setItem(INSTALL_DISMISS_KEY, String(Date.now()));
}

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function isBeforeInstallPromptEvent(
  event: Event
): event is BeforeInstallPromptEvent {
  return (
    "prompt" in event &&
    typeof (event as BeforeInstallPromptEvent).prompt === "function"
  );
}
