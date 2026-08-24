import "./globals.css";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Mati tis Thalassas",
  description:
    "Apartment in Kastraki, Naxos – Verfügbarkeit prüfen und anfragen.",
  icons: {
    icon: [{ url: "/mati-tis-thalassas-logo.png", type: "image/png" }],
    apple: [{ url: "/mati-tis-thalassas-logo.png", type: "image/png" }]
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
