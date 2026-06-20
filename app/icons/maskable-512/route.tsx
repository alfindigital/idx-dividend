import { ImageResponse } from "next/og";
import { IconLogo } from "../logo";

export const revalidate = 86400;

// Ikon maskable: skala lebih kecil agar mark berada di zona aman saat dipotong mask.
export function GET() {
  return new ImageResponse(<IconLogo size={512} scale={0.46} />, { width: 512, height: 512 });
}
