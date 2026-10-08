import type { SVGProps } from "react";

// Line icons on a 24px grid. They are decorative: the button or text next to
// them carries the accessible name, so every icon is hidden from screen readers.

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 16, strokeWidth = 2, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const CloseIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Svg>
);

export const CheckIcon = (p: IconProps) => (
  <Svg strokeWidth={3} {...p}>
    <path d="M20 6 9 17l-5-5" />
  </Svg>
);

export const PlusIcon = (p: IconProps) => (
  <Svg strokeWidth={2.5} {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const HeartIcon = ({ filled, ...p }: IconProps & { filled?: boolean }) => (
  <Svg fill={filled ? "currentColor" : "none"} {...p}>
    <path d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.18z" />
  </Svg>
);

export const LinkIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </Svg>
);

export const EditIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </Svg>
);

export const TrashIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </Svg>
);

export const PinIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 17v5M5 17h14l-1.5-3V5a2 2 0 0 0-2-2H8.5a2 2 0 0 0-2 2v9z" />
  </Svg>
);

export const FollowIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <path d="M20 8v6M23 11h-6" />
  </Svg>
);

export const ChevronDownIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
);

export const BallotIcon = (p: IconProps) => (
  <Svg strokeWidth={2.5} {...p}>
    <path d="m9 11 3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </Svg>
);

export const ExternalIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <path d="M15 3h6v6M10 14 21 3" />
  </Svg>
);

export const SearchIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </Svg>
);

export const FilterIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M22 3H2l8 9.46V19l4 2v-8.54z" />
  </Svg>
);

export const CalendarIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </Svg>
);

export const InboxIcon = (p: IconProps) => (
  <Svg strokeWidth={1.5} {...p}>
    <path d="M21 8v13H3V8" />
    <rect x="1" y="3" width="22" height="5" />
    <path d="M10 12h4" />
  </Svg>
);

/* Brand marks keep their own colors: they are logos, not UI colors. */

export const SlackLogo = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 127 127" aria-hidden="true" focusable="false">
    <path d="M27.2 80a13.6 13.6 0 1 1-13.6-13.6h13.6V80zm6.8 0a13.6 13.6 0 1 1 27.2 0v34a13.6 13.6 0 1 1-27.2 0V80z" fill="#E01E5A" />
    <path d="M47.8 27.2a13.6 13.6 0 1 1 13.6-13.6v13.6H47.8zm0 6.8a13.6 13.6 0 1 1 0 27.2H13.6a13.6 13.6 0 0 1 0-27.2h34.2z" fill="#36C5F0" />
    <path d="M100.4 47.8a13.6 13.6 0 1 1 13.6 13.6h-13.6V47.8zm-6.8 0a13.6 13.6 0 0 1-27.2 0V13.6a13.6 13.6 0 1 1 27.2 0v34.2z" fill="#2EB67D" />
    <path d="M79.8 100.4a13.6 13.6 0 1 1-13.6 13.6v-13.6h13.6zm0-6.8a13.6 13.6 0 1 1 0-27.2H114a13.6 13.6 0 0 1 0 27.2H79.8z" fill="#ECB22E" />
  </svg>
);

export const FigmaLogo = ({ size = 18 }: { size?: number }) => (
  <svg width={(size * 2) / 3} height={size} viewBox="0 0 38 57" aria-hidden="true" focusable="false">
    <path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" fill="#1ABCFE" />
    <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z" fill="#0ACF83" />
    <path d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z" fill="#FF7262" />
    <path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" fill="#F24E1E" />
    <path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" fill="#A259FF" />
  </svg>
);
