import { AvailabilitySection } from "@/components/AvailabilitySection";
import { InquiryForm } from "@/components/InquiryForm";

export default function AvailabilityPage() {
  return (
    <div className="section">
      <div className="container grid gap-10 lg:grid-cols-2">
        <div>
          <h1 className="text-3xl font-semibold">Verfügbarkeit & Anfrage</h1>
          <p className="mt-4 text-sm text-ink/70">
            Wähle deinen Zeitraum und sende eine unverbindliche Anfrage. Nach
            Absenden reservieren wir die Daten für 48 Stunden (HOLD).
          </p>
          <div className="mt-8">
            <AvailabilitySection />
          </div>
        </div>
        <div>
          <InquiryForm />
        </div>
      </div>
    </div>
  );
}
