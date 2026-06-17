// Util pembuat file iCalendar (.ics) & tautan "Tambah ke Google Calendar".
// Murni string — tanpa dependency Next, aman dipakai di server maupun build.

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** ISO "2026-04-21" → "20260421" (format DATE all-day RFC 5545) */
export function icsDate(iso: string): string {
  return iso.slice(0, 10).replace(/-/g, "");
}

/** Tanggal ISO + 1 hari → "YYYYMMDD" (DTEND all-day bersifat eksklusif) */
export function nextDay(iso: string): string {
  const d = new Date(iso.slice(0, 10) + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + 1);
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
}

/** Escape teks untuk SUMMARY/DESCRIPTION sesuai RFC 5545. */
export function escapeText(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** Lipat baris ke ≤75 oktet (RFC 5545) dengan CRLF + spasi. */
function fold(line: string): string {
  if (line.length <= 73) return line;
  const out: string[] = [];
  for (let i = 0; i < line.length; i += 73) {
    out.push((i === 0 ? "" : " ") + line.slice(i, i + 73));
  }
  return out.join("\r\n");
}

function nowStamp(): string {
  const d = new Date();
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

export interface IcsEvent {
  uid: string;
  dateIso: string; // tanggal all-day (ex-date / perkiraan)
  summary: string;
  description?: string;
  url?: string;
  /** VALARM pengingat N hari sebelum (mis. 1) */
  reminderDays?: number;
}

export function buildVevent(e: IcsEvent): string {
  const lines = [
    "BEGIN:VEVENT",
    `UID:${e.uid}`,
    `DTSTAMP:${nowStamp()}`,
    `DTSTART;VALUE=DATE:${icsDate(e.dateIso)}`,
    `DTEND;VALUE=DATE:${nextDay(e.dateIso)}`,
    "TRANSP:TRANSPARENT",
    `SUMMARY:${escapeText(e.summary)}`,
  ];
  if (e.description) lines.push(`DESCRIPTION:${escapeText(e.description)}`);
  if (e.url) lines.push(`URL:${e.url}`);
  if (e.reminderDays != null) {
    lines.push(
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${escapeText(e.summary)}`,
      `TRIGGER:-P${e.reminderDays}D`,
      "END:VALARM",
    );
  }
  lines.push("END:VEVENT");
  return lines.map(fold).join("\r\n");
}

export function buildCalendar(events: IcsEvent[], name: string): string {
  const head = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Dividen IDX//Kalender Dividen//ID",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(name)}`,
    "X-WR-TIMEZONE:Asia/Jakarta",
  ].map(fold);
  const body = events.map(buildVevent);
  return [...head, ...body, "END:VCALENDAR"].join("\r\n") + "\r\n";
}

/** Tautan "Tambah ke Google Calendar" untuk satu event all-day. */
export function gcalUrl(opts: { title: string; dateIso: string; details?: string }): string {
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: opts.title,
    dates: `${icsDate(opts.dateIso)}/${nextDay(opts.dateIso)}`,
  });
  if (opts.details) p.set("details", opts.details);
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}
