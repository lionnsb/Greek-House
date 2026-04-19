export default function ImprintPageEn() {
  return (
    <div className="section">
      <div className="container">
        <h1 className="text-3xl font-semibold">Imprint</h1>
        <p className="mt-4 text-sm text-ink/70">
          This is a placeholder. Please complete with legally required
          information.
        </p>

        <div className="mt-6 grid gap-4 text-sm text-ink/70">
          <div className="card p-4">
            <p className="font-semibold text-ink">Provider</p>
            <p>Dagmar Goller</p>
            <p>Street + number</p>
            <p>ZIP City</p>
            <p>Country</p>
          </div>
          <div className="card p-4">
            <p className="font-semibold text-ink">Contact</p>
            <p>E-mail: gollerdagmar@gmail.com</p>
            <p>Phone: +41 76 329 92 88</p>
          </div>
        </div>

        <p className="mt-6 text-xs text-ink/60">
          Please review and replace this placeholder with legal text.
        </p>
      </div>
    </div>
  );
}
