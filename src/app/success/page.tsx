import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="section">
      <div className="container">
        <div className="card mx-auto max-w-2xl p-8 text-center">
          <p className="badge mx-auto w-fit">Anfrage gesendet</p>
          <h1 className="mt-4 text-3xl font-semibold">Vielen Dank!</h1>
          <p className="mt-3 text-sm text-ink/70">
            Wir haben deine Anfrage erhalten und melden uns so schnell wie
            möglich per E‑Mail.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/verfuegbarkeit" className="btn">
              Zurück zum Kalender
            </Link>
            <Link href="/" className="btn-outline">
              Zur Startseite
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
