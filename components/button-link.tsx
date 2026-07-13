import Link from "next/link";
import type { ReactNode } from "react";

const styles = {
  primary:
    "border border-[#0b0f14] bg-[#0b0f14] text-white hover:bg-[#20262d]",
  dark:
    "border border-[#0b0f14] bg-[#0b0f14] text-white hover:bg-[#20262d]",
  teal:
    "border border-[#b9e3da] bg-[#b9e3da] text-[#0b0f14] hover:bg-[#ccece5]",
  outline:
    "border border-black/25 bg-transparent text-[#0b0f14] hover:border-black hover:bg-white/55",
  ghost: "text-[#0b0f14] hover:bg-black/5",
  darkOutline:
    "border border-white/25 bg-transparent text-white hover:border-white/55 hover:bg-white/8",
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  external = false,
  className = "",
  ariaLabel,
}: {
  href: string;
  children: ReactNode;
  variant?: keyof typeof styles;
  external?: boolean;
  className?: string;
  ariaLabel?: string;
}) {
  const classes = `inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-extrabold tracking-[-0.01em] transition duration-200 active:scale-[0.98] ${styles[variant]} ${className}`;

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={classes}
        aria-label={ariaLabel}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}
