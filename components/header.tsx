"use client";

import { ArrowUpRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navItems, siteConfig } from "@/lib/site";
import { Logo } from "@/components/logo";
import { ScrollProgress } from "@/components/scroll-progress";

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const homeTop = pathname === "/" && !scrolled && !open;
  const appExternal = siteConfig.appUrl.startsWith("http");

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 28);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b text-[#0b0f14] backdrop-blur-xl transition duration-300 ${
        homeTop
          ? "border-black/15 bg-[#f2f0eb]/92"
          : "border-black/10 bg-white/92 shadow-[0_8px_30px_rgba(15,23,42,0.035)]"
      }`}
    >
      <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigazione principale">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2.5 text-sm font-bold transition ${
                  active
                    ? "bg-black text-white"
                    : "text-black/58 hover:bg-black/5 hover:text-black"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <Link
            href={siteConfig.appUrl}
            target={appExternal ? "_blank" : undefined}
            rel={appExternal ? "noreferrer" : undefined}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-extrabold text-black/62 transition hover:bg-black/5 hover:text-black"
          >
            Area cliente <ArrowUpRight size={15} />
          </Link>
          <Link
            href="/contatti"
            className="rounded-full border border-black bg-black px-4 py-2.5 text-sm font-extrabold text-white transition hover:bg-[#242a31]"
          >
            Richiedi una valutazione
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="grid size-11 place-items-center rounded-full border border-black/15 bg-white/70 text-[#0b0f14] lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Chiudi menu" : "Apri menu"}
        >
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      {open ? (
        <div id="mobile-menu" className="border-t border-black/10 bg-[#f2f0eb] px-4 pb-5 pt-3 text-[#0b0f14] lg:hidden">
          <nav className="mx-auto grid max-w-7xl gap-1" aria-label="Navigazione mobile">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-2xl px-4 py-3.5 text-base font-extrabold ${
                  pathname === item.href ? "bg-black text-white" : "text-black/62"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Link
                href={siteConfig.appUrl}
                target={appExternal ? "_blank" : undefined}
                rel={appExternal ? "noreferrer" : undefined}
                className="flex min-h-12 items-center justify-center gap-1.5 rounded-full border border-black/20 bg-white px-3 text-sm font-extrabold text-[#0b0f14]"
              >
                Area cliente <ArrowUpRight size={14} />
              </Link>
              <Link
                href="/contatti"
                className="flex min-h-12 items-center justify-center rounded-full bg-black px-3 text-center text-sm font-extrabold text-white"
              >
                Valutazione
              </Link>
            </div>
          </nav>
        </div>
      ) : null}

      <ScrollProgress />
    </header>
  );
}
