"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const copy = {
  de: {
    brand: "Mati tis Thalassas",
    text: "Stilvolles Ferienhaus in Kastraki, Naxos mit optionalem Studio. Anfrage & Buchung per E-Mail.",
    contactLabel: "Kontakt",
    legal: [
      { href: "/impressum", label: "Impressum" },
      { href: "/datenschutz", label: "Datenschutz" }
    ]
  },
  en: {
    brand: "Mati tis Thalassas",
    text: "Stylish holiday home in Kastraki, Naxos with optional studio. Enquiry & booking by email.",
    contactLabel: "Contact",
    legal: [
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
    <footer className="border-t border-stone bg-white">
      <div className="container grid gap-6 py-10 md:grid-cols-3">
        <div>
          <p className="text-sm font-semibold">{t.brand}</p>
          <p className="mt-2 text-sm text-ink/70">{t.text}</p>
        </div>
        <div className="text-sm text-ink/70">
          <p>{t.contactLabel}</p>
          <p className="mt-2">gollerdagmar@gmail.com</p>
          <p>+41 76 329 92 88</p>
        </div>
        <div className="text-sm">
          {t.legal.map((item) => (
            <Link key={item.href} href={item.href} className="block text-ink/70 hover:text-ink">
              {item.label}
            </Link>
          ))}
          <Link href="/admin" className="mt-2 block text-ink/70 hover:text-ink">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
