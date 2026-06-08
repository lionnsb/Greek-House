export default function ImprintPageEn() {
  return (
    <div className="section">
      <div className="container">
        <h1 className="text-3xl font-semibold">Imprint</h1>

        <div className="mt-6 grid gap-4 text-sm text-ink/70 md:grid-cols-2">
          <div className="card p-4">
            <p className="font-semibold text-ink">Dagmar Goller</p>
            <p className="mt-2">Dorfstrasse 29</p>
            <p>8712 Stäfa</p>
          </div>
          <div className="card p-4">
            <p className="font-semibold text-ink">Contact</p>
            <p className="mt-2">
              Phone: <a href="tel:+41763299288" className="underline">+41 76 329 92 88</a>
            </p>
            <p>
              E-mail: <a href="mailto:dagmar@naxos-apartment.com" className="underline">dagmar@naxos-apartment.com</a>
            </p>
          </div>
          <div className="card p-4">
            <p className="font-semibold text-ink">Layout and Web Design</p>
            <p className="mt-2">Lion Seyer</p>
          </div>
          <div className="card p-4">
            <p className="font-semibold text-ink">Copyright</p>
            <p className="mt-2">
              The contents of this website are subject to Swiss copyright law.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
