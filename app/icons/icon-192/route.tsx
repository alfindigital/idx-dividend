import { ImageResponse } from "next/og";
import { IconLogo } from "../logo";

export const revalidate = 86400;

export function GET() {
  return new ImageResponse(<IconLogo size={192} />, { width: 192, height: 192 });
}
