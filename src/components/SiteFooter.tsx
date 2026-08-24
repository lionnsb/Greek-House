"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/BrandLogo";

const copy = {
  de: {
    text: "Stilvolles Erdgeschoss-Apartment in einer Villa in Kastraki auf Naxos. Das Apartment mit Pool und optionalem Studio liegt nur 50 Meter vom Meer entfernt.",
    contactLabel: "Kontakt",
    legal: [
      { href: "/agb", label: "AGB" },
      { href: "/impressum", label: "Impressum" },
      { href: "/datenschutz", label: "Datenschutz" }
    ]
  },
  en: {
    text: "Stylish ground-floor apartment in a villa in Kastraki, Naxos. The apartment with pool and optional studio is only 50 metres from the sea.",
    contactLabel: "Contact",
    legal: [
      { href: "/en/agb", label: "Terms" },
      { href: "/en/impressum", label: "Imprint" },
      { href: "/en/datenschutz", label: "Privacy" }
    ]
  }
};

function resolveLang(pathname: string | null) {
  return pathname?.startsWith("/en") ? "en" : "de";
}

export function SiteFooter() {
  const pathname = usePathname();
  const lang = resolveLang(pathname);
  const t = copy[lang];

  return (
    <footer className="border-t border-brand/25 bg-white">
      <div className="container grid gap-6 py-10 md:grid-cols-3">
        <div>
          <Link
            href={lang === "en" ? "/en" : "/"}
            aria-label={lang === "en" ? "Mati tis Thalassas home" : "Mati tis Thalassas Startseite"}
            className="inline-block"
          >
            <BrandLogo className="h-28 w-auto" />
          </Link>
          <p className="mt-2 text-sm text-ink/70">{t.text}</p>
        </div>
        <div className="text-sm text-ink/70">
          <p>{t.contactLabel}</p>
          <p className="mt-2">dagmar@naxos-apartment.com</p>
          <p>+41 76 329 92 88</p>
        </div>
        <div className="text-sm">
          {t.legal.map((item) => (
            <Link key={item.href} href={item.href} className="block text-ink/70 transition hover:text-brand-dark">
              {item.label}
            </Link>
          ))}
          <Link href="/admin" className="mt-2 block text-ink/70 transition hover:text-brand-dark">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
