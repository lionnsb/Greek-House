import { AvailabilitySection } from "@/components/AvailabilitySection";
import { InquiryForm } from "@/components/InquiryForm";

export default function AvailabilityPageEn() {
  return (
    <div className="section">
      <div className="container grid gap-10 lg:grid-cols-2">
        <div>
          <h1 className="text-3xl font-semibold">Availability & Enquiry</h1>
          <p className="mt-4 text-sm text-ink/70">
            Select your dates and send a non-binding enquiry. After submitting,
            we reserve the dates for 48 hours (HOLD).
          </p>
          <div className="mt-8">
            <AvailabilitySection locale="en" />
          </div>
        </div>
        <div>
          <InquiryForm locale="en" />
        </div>
      </div>
    </div>
  );
}
