import Link from "next/link";
import { AdminGate } from "@/components/admin/AdminGate";

const adminNav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/anfragen", label: "Anfragen" },
  { href: "/admin/kalender", label: "Kalender" },
  { href: "/admin/preise", label: "Preise" },
  { href: "/admin/anreisen", label: "Anreisen" }
];

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGate>
      <div className="container py-10">
        <nav className="flex flex-wrap gap-3 text-sm">
          {adminNav.map((item) => (
            <Link key={item.href} href={item.href} className="badge">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      {children}
    </AdminGate>
  );
}
