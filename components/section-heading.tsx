import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  text,
  align = "left",
  inverted = false,
  children,
}: {
  eyebrow: string;
  title: string;
  text?: string;
  align?: "left" | "center";
  inverted?: boolean;
  children?: ReactNode;
}) {
  const isCentered = align === "center";

  return (
    <div className={isCentered ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}>
      <p
        className={`text-xs font-black uppercase tracking-[0.24em] ${
          inverted ? "text-teal-300" : "text-teal-700"
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`mt-4 text-balance text-3xl font-black leading-[1.04] tracking-[-0.045em] sm:text-4xl lg:text-5xl ${
          inverted ? "text-white" : "text-[#07111f]"
        }`}
      >
        {title}
      </h2>
      {text ? (
        <p
          className={`mt-5 text-pretty text-base font-medium leading-7 sm:text-lg ${
            inverted ? "text-slate-300" : "text-slate-600"
          }`}
        >
          {text}
        </p>
      ) : null}
      {children}
    </div>
  );
}
