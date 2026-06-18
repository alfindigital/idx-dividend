import type { SVGProps, ReactNode } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

/**
 * Ikon outline bergaya Lucide (di-vendor sebagai inline SVG) — stroke
 * currentColor, fill none, stroke 1.75. Tanpa dependency, aman build.
 */
function Svg({ size = 18, children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

export const Home = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
  </Svg>
);

export const CalendarDays = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="4.5" width="18" height="16.5" rx="2.5" />
    <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
  </Svg>
);

export const CalendarPlus = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="4.5" width="18" height="16.5" rx="2.5" />
    <path d="M3 9.5h18M8 2.5v4M16 2.5v4M12 13.5v4M10 15.5h4" />
  </Svg>
);

export const Sun = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Svg>
);

export const Moon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </Svg>
);

export const Info = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M12 16v-4M12 8h.01" />
  </Svg>
);

export const AlertTriangle = (p: IconProps) => (
  <Svg {...p}>
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    <path d="M12 9v4M12 17h.01" />
  </Svg>
);

export const BookOpen = (p: IconProps) => (
  <Svg {...p}>
    <path d="M2 3.5h6a4 4 0 0 1 4 4V21a3 3 0 0 0-3-3H2Z" />
    <path d="M22 3.5h-6a4 4 0 0 0-4 4V21a3 3 0 0 1 3-3h7Z" />
  </Svg>
);

export const ChevronDown = (p: IconProps) => (
  <Svg {...p}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
);

export const ChevronLeft = (p: IconProps) => (
  <Svg {...p}>
    <path d="m15 18-6-6 6-6" />
  </Svg>
);

export const ChevronRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="m9 18 6-6-6-6" />
  </Svg>
);

export const ArrowLeft = (p: IconProps) => (
  <Svg {...p}>
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </Svg>
);

export const ArrowUpRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 17 17 7M7 7h10v10" />
  </Svg>
);

export const ArrowDownRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="m7 7 10 10M17 7v10H7" />
  </Svg>
);

export const ArrowRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 12h14M12 5l7 7-7 7" />
  </Svg>
);

export const Download = (p: IconProps) => (
  <Svg {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
  </Svg>
);

export const ExternalLink = (p: IconProps) => (
  <Svg {...p}>
    <path d="M15 3h6v6M10 14 21 3" />
    <path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
  </Svg>
);

export const Search = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="7.5" />
    <path d="m21 21-4.3-4.3" />
  </Svg>
);

export const BarChart3 = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 3v18h18M18 17V9M13 17V5M8 17v-3" />
  </Svg>
);

export const TrendingUp = (p: IconProps) => (
  <Svg {...p}>
    <path d="m22 7-8.5 8.5-5-5L2 17M16 7h6v6" />
  </Svg>
);
