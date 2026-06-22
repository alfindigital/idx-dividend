"use client";

import { useEffect, useState } from "react";
import { Smartphone, X } from "./ui/icons";
import { track } from "@/lib/track";

const DISMISS_KEY = "idx-install-dismissed-v1";

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Nudge "Pasang aplikasi" (A2HS) yang halus & bisa ditutup.
 * Muncul hanya bila browser memicu beforeinstallprompt dan belum pernah ditutup.
 */
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISS_KEY)) return;
    } catch {
      /* abaikan */
    }
    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      setShow(true);
    };
    const onInstalled = () => setShow(false);
    window.addEventListener("beforeinstallprompt", onBIP);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBIP);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  function dismiss() {
    setShow(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* abaikan */
    }
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    track("install_pwa", { outcome: choice.outcome });
    setShow(false);
    setDeferred(null);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+4.5rem)] z-40 mx-auto max-w-sm rounded-xl border border-line bg-surface p-3 shadow-2xl sm:bottom-4 sm:left-auto sm:right-4 sm:mx-0">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
          <Smartphone size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-fg">Pasang Dividen IDX</div>
          <p className="mt-0.5 text-xs text-muted">
            Akses cepat dari layar utama, ringan, bisa dibuka offline.
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={install}
              className="rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-strong"
            >
              Pasang
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-muted transition hover:text-fg"
            >
              Nanti
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Tutup ajakan pasang aplikasi"
          className="text-faint transition hover:text-fg"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
