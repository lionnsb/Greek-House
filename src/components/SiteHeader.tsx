"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const copy = {
  de: {
    brand: "Mati tis Thalassas",
    cta: "Verfügbarkeit prüfen",
    nav: [
      { href: "/", label: "Start" },
      { href: "/haus", label: "Haus" },
      { href: "/studio", label: "Studio" },
      { href: "/verfuegbarkeit", label: "Verfügbarkeit" },
      { href: "/anreise", label: "Anreise" },
      { href: "/kontakt", label: "Kontakt" }
    ]
  },
  en: {
    brand: "Mati tis Thalassas",
    cta: "Check availability",
    nav: [
      { href: "/en", label: "Home" },
      { href: "/en/haus", label: "House" },
      { href: "/en/studio", label: "Studio" },
      { href: "/en/verfuegbarkeit", label: "Availability" },
      { href: "/en/anreise", label: "Arrival" },
      { href: "/en/kontakt", label: "Contact" }
    ]
  }
};

function resolveLang(pathname: string | null) {
  return pathname?.startsWith("/en") ? "en" : "de";
}

function toOtherLang(pathname: string | null) {
  if (!pathname) return "/en";
  if (pathname.startsWith("/en")) {
    const trimmed = pathname.replace(/^\/en/, "") || "/";
    return trimmed;
  }
  return `/en${pathname}`;
}

export function SiteHeader() {
  const pathname = usePathname();
  const lang = resolveLang(pathname);
  const t = copy[lang];
  const other = toOtherLang(pathname);

  return (
    <header className="border-b border-stone bg-white/80 backdrop-blur">
      <div className="container flex items-center justify-between py-6">
        <Link href={lang === "en" ? "/en" : "/"} className="text-lg font-semibold tracking-tight">
          {t.brand}
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {t.nav.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-ink/80 hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href={lang === "en" ? "/en/verfuegbarkeit" : "/verfuegbarkeit"} className="btn hidden md:inline-flex">
            {t.cta}
          </Link>
        </div>
      </div>
    </header>
  );
}
