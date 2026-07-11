import Link from "next/link";

const tiles = [
  {
    title: "Anfragen",
    description: "Neue Anfragen prüfen, annehmen oder ablehnen.",
    href: "/admin/anfragen"
  },
  {
    title: "Kalender",
    description: "Sperrzeiten verwalten und Überblick behalten.",
    href: "/admin/kalender"
  },
  {
    title: "Anreisen",
    description: "Anstehende Aufenthalte auf einen Blick.",
    href: "/admin/anreisen"
  },
  {
    title: "Bilder",
    description: "Website-Bilder hochladen, ersetzen und sortieren.",
    href: "/admin/bilder"
  }
];

export default function AdminDashboardPage() {
  return (
    <div className="container pb-16">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {tiles.map((tile) => (
          <Link key={tile.title} href={tile.href} className="card p-6">
            <h2 className="text-lg font-semibold">{tile.title}</h2>
            <p className="mt-2 text-sm text-ink/70">{tile.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
