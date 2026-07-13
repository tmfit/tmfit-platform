import Link from "next/link";

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="TMFIT — Torna alla home"
      className="group inline-flex items-center gap-2"
    >
      <span
        className={`text-[1.35rem] font-black tracking-[-0.055em] ${
          inverted ? "text-white" : "text-[#07111f]"
        }`}
      >
        TMFIT
      </span>
      <span
        aria-hidden="true"
        className="mt-1 size-2 rounded-full bg-teal-400 transition-transform duration-300 group-hover:scale-125"
      />
    </Link>
  );
}
