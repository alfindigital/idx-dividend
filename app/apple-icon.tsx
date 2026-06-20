import { ImageResponse } from "next/og";
import { IconLogo } from "./icons/logo";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<IconLogo size={180} />, size);
}
