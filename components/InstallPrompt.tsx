"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { brand } from "@/lib/brand";
import { STORAGE_KEYS } from "@/lib/constants";
import { CloseIcon } from "@/components/ui/icons";
import { buttonClass } from "@/components/ui/styles";

// Chrome's install event; not in the DOM typings yet.
interface InstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type Mode = "android" | "ios" | null;

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private mode: the bar just shows again next time.
  }
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/**
 * Registers the offline service worker and, from the second visit on a phone,
 * offers to install the store as an app. iOS has no install event, so Safari
 * gets the «Share → Add to Home Screen» hint instead.
 */
export default function InstallPrompt() {
  const t = useTranslations("ui.pwa");
  const [mode, setMode] = useState<Mode>(null);
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    if (isStandalone() || read(STORAGE_KEYS.INSTALL_DISMISSED)) return;
    const visits = Number(read(STORAGE_KEYS.INSTALL_VISITS) ?? "0") + 1;
    write(STORAGE_KEYS.INSTALL_VISITS, String(visits));
    if (visits < 2) return;

    const ua = navigator.userAgent;
    const isIosSafari = /iphone|ipad|ipod/i.test(ua) && /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua);
    if (isIosSafari) {
      setMode("ios");
      return;
    }

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallEvent);
      setMode("android");
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!mode) return null;

  const dismiss = () => {
    write(STORAGE_KEYS.INSTALL_DISMISSED, "1");
    setMode(null);
  };

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice.catch(() => null);
    dismiss();
  };

  return (
    <div
      role="region"
      aria-label={t("title", { brand: brand.name })}
      className="fixed inset-x-2 bottom-[calc(64px+env(safe-area-inset-bottom))] z-30 flex items-center gap-3 rounded-btn border border-line bg-paper p-3 shadow-[0_6px_24px_rgba(17,17,17,0.12)] md:hidden"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icons/icon-192.png" alt="" width={40} height={40} className="h-10 w-10 flex-none rounded-btn border border-line" />
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-semibold text-ink">{t("title", { brand: brand.name })}</p>
        <p className="text-[12px] leading-snug text-muted">{mode === "ios" ? t("ios_body") : t("body")}</p>
      </div>
      {mode === "android" && (
        <button type="button" onClick={install} className={buttonClass("line", "sm", "h-9 flex-none px-3")}>
          {t("install")}
        </button>
      )}
      <button type="button" onClick={dismiss} aria-label={t("dismiss")} className="-mr-1 grid h-9 w-9 flex-none place-items-center text-muted">
        <CloseIcon className="h-[18px] w-[18px]" />
      </button>
    </div>
  );
}
