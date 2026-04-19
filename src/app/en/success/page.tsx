import Link from "next/link";

export default function SuccessPageEn() {
  return (
    <div className="section">
      <div className="container">
        <div className="card mx-auto max-w-2xl p-8 text-center">
          <p className="badge mx-auto w-fit">Enquiry sent</p>
          <h1 className="mt-4 text-3xl font-semibold">Thank you!</h1>
          <p className="mt-3 text-sm text-ink/70">
            We received your enquiry and will get back to you by email as soon
            as possible.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/en/verfuegbarkeit" className="btn">
              Back to calendar
            </Link>
            <Link href="/en" className="btn-outline">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
