"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";

const copy = {
  de: {
    cta: "Verfügbarkeit prüfen",
    nav: [
      { href: "/", label: "Start" },
      { href: "/haus", label: "Apartment" },
      { href: "/haus#studio", label: "Studio" },
      { href: "/haus#apartmentregeln", label: "Apartmentregeln" },
      { href: "/verfuegbarkeit", label: "Verfügbarkeit" },
      { href: "/anreise", label: "Anreise" },
      { href: "/kontakt", label: "Kontakt" }
    ]
  },
  en: {
    cta: "Check availability",
    nav: [
      { href: "/en", label: "Home" },
      { href: "/en/haus", label: "Apartment" },
      { href: "/en/haus#studio", label: "Studio" },
      { href: "/en/haus#apartment-rules", label: "Apartment rules" },
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
      <div className="container flex items-center justify-between gap-6 py-4">
        <Link
          href={lang === "en" ? "/en" : "/"}
          aria-label={lang === "en" ? "Mati tis Thalassas home" : "Mati tis Thalassas Startseite"}
          className="shrink-0"
        >
          <BrandLogo className="h-20 w-auto sm:h-24" priority />
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {t.nav.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-ink/80 hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href={lang === "en" ? "/en/verfuegbarkeit" : "/verfuegbarkeit"} className="btn btn-accent hidden md:inline-flex">
            {t.cta}
          </Link>
        </div>
      </div>
    </header>
  );
}
