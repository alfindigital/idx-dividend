"use client";

import { useState } from "react";
import { Share2, Link2, Check } from "./ui/icons";
import { toast } from "@/lib/toast";
import { track } from "@/lib/track";

/** Tombol bagikan (Web Share API bila ada) + salin tautan + WhatsApp/X. */
export default function ShareButtons({
  ticker,
  title,
  text,
}: {
  ticker: string;
  title: string;
  text: string;
}) {
  const [copied, setCopied] = useState(false);

  function shareUrl() {
    if (typeof window === "undefined") return "";
    return window.location.href;
  }

  async function nativeShare() {
    const url = shareUrl();
    track("share_emiten", { ticker, method: "native" });
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        /* dibatalkan user */
      }
    } else {
      copyLink();
    }
  }

  async function copyLink() {
    const url = shareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast("Tautan disalin.", { tone: "success" });
      track("share_emiten", { ticker, method: "copy" });
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast("Gagal menyalin tautan.", { tone: "warn" });
    }
  }

  const waHref = `https://wa.me/?text=${encodeURIComponent(`${text} ${shareUrl()}`)}`;
  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl())}`;

  const btn =
    "inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs font-medium text-muted transition hover:border-brand/40 hover:text-fg";

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button type="button" onClick={nativeShare} className={btn} aria-label={`Bagikan ${ticker}`}>
        <Share2 size={14} /> Bagikan
      </button>
      <button type="button" onClick={copyLink} className={btn} aria-label="Salin tautan">
        {copied ? <Check size={14} /> : <Link2 size={14} />} {copied ? "Tersalin" : "Salin"}
      </button>
      <a href={waHref} target="_blank" rel="noopener noreferrer" className={btn} aria-label="Bagikan ke WhatsApp">
        WhatsApp
      </a>
      <a href={xHref} target="_blank" rel="noopener noreferrer" className={btn} aria-label="Bagikan ke X">
        X
      </a>
    </div>
  );
}
