import { ImageResponse } from "next/og";
import { IconLogo } from "../logo";

export const revalidate = 86400;

export function GET() {
  return new ImageResponse(<IconLogo size={512} />, { width: 512, height: 512 });
}
