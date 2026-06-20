export type ToastTone = "success" | "info" | "warn";

export interface ToastDetail {
  message: string;
  tone: ToastTone;
}

const EVT = "idx-toast";

/**
 * Pemicu notifikasi ringan tanpa dependency. Memakai CustomEvent agar bisa
 * dipanggil dari mana saja (termasuk di luar React, mis. handler ekspor CSV).
 * Komponen <ToastViewport /> yang mendengarkan dan menampilkan.
 */
export function toast(message: string, opts?: { tone?: ToastTone }): void {
  if (typeof window === "undefined") return;
  const detail: ToastDetail = { message, tone: opts?.tone ?? "info" };
  window.dispatchEvent(new CustomEvent<ToastDetail>(EVT, { detail }));
}

export const TOAST_EVENT = EVT;
