import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { Logo } from "@/components/logo";
import { navItems, siteConfig } from "@/lib/site";

export function Footer() {
  return (
    <footer className="bg-[#0b0f14] text-white">
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.2fr_0.7fr_1.1fr] lg:px-8 lg:py-20">
        <div className="max-w-md">
          <Logo inverted />
          <p className="mt-5 text-sm font-medium leading-6 text-white/58">
            Nutrizione, movimento, nutraceutica e monitoraggio integrati in un percorso costruito sulla persona.
          </p>
          <p className="mt-6 text-xs font-semibold leading-5 text-white/38">
            {siteConfig.credentials.register}<br />
            {siteConfig.credentials.vat}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/38">Esplora</p>
          <div className="mt-5 grid gap-3">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="text-sm font-semibold text-white/62 transition hover:text-white">
                {item.label}
              </Link>
            ))}
            <Link href="/privacy" className="text-sm font-semibold text-white/62 transition hover:text-white">
              Privacy
            </Link>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/38">Contatti</p>
          <div className="mt-5 grid gap-4 text-sm font-semibold text-white/62">
            <a href={`mailto:${siteConfig.email}`} className="inline-flex items-center gap-2 transition hover:text-white">
              <Mail size={16} /> {siteConfig.email}
            </a>
            <a href={`tel:${siteConfig.phoneHref}`} className="inline-flex items-center gap-2 transition hover:text-white">
              <Phone size={16} /> {siteConfig.phoneDisplay}
            </a>
          </div>
          <a
            href={siteConfig.appUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-7 inline-flex rounded-full border border-white/25 px-4 py-2.5 text-sm font-extrabold transition hover:border-white/55"
          >
            Accedi a TMFIT Platform ↗
          </a>
        </div>
      </div>

      <div className="border-t border-white/14">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-5 text-xs font-semibold text-white/30 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} TMFIT — Matteo Trobbiani.</p>
          <p>Studio e percorsi online.</p>
        </div>
      </div>
    </footer>
  );
}
