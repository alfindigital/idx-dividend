import { AlertTriangle } from "./ui/icons";

export default function Disclaimer() {
  return (
    <div className="flex gap-2 rounded-xl border border-amber-300/50 bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:border-amber-400/25 dark:bg-amber-400/10 dark:text-amber-200/90">
      <AlertTriangle size={16} className="mt-px shrink-0" />
      <p>
        <strong>Catatan:</strong> data dirangkum dari sumber publik (IDX, CNBC Indonesia, Bareksa,
        Kontan, Stockbit, dll.) dan di-cross-check, namun bisa saja keliru. Tiap event memuat tautan
        sumber agar bisa kamu verifikasi. <strong>Bukan saran investasi.</strong>
      </p>
    </div>
  );
}
