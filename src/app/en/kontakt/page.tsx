export default function ContactPageEn() {
  return (
    <div className="section">
      <div className="container grid gap-10 md:grid-cols-2">
        <div>
          <h1 className="text-3xl font-semibold">Contact</h1>
          <p className="mt-4 text-sm text-ink/70">
            You can reach us directly or via the enquiry form. We will get back
            to you as soon as possible.
          </p>
          <div className="mt-6 grid gap-4 text-sm text-ink/70">
            <div className="card p-4">
              <p className="font-semibold text-ink">Contact person</p>
              <p className="mt-2">Dagmar Goller</p>
            </div>
            <div className="card p-4">
              <p className="font-semibold text-ink">E-mail</p>
              <p className="mt-2">gollerdagmar@gmail.com</p>
            </div>
            <div className="card p-4">
              <p className="font-semibold text-ink">Phone / WhatsApp</p>
              <p className="mt-2">+41 76 329 92 88</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <h2 className="text-lg font-semibold">Direct enquiry</h2>
          <p className="mt-2 text-sm text-ink/70">
            For availability and bookings, please use the enquiry form via the
            calendar.
          </p>
          <div className="mt-4">
            <a href="/en/verfuegbarkeit" className="btn">
              Go to enquiry
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
