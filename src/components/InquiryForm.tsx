"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import type { InquiryPayload } from "@/lib/types";
import type { SeasonDefinition } from "@/lib/seasonPricing";
import { PricePreview } from "@/components/PricePreview";

const defaultValues: InquiryPayload = {
  startDate: "",
  endDate: "",
  guests: 2,
  includesStudio: false,
  name: "",
  email: "",
  phone: "",
  message: "",
  acceptPrivacy: false,
  language: "de"
};

export function InquiryForm({ locale = "de" }: { locale?: "de" | "en" }) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [seasons, setSeasons] = useState<SeasonDefinition[]>([]);
  const { register, handleSubmit, reset, watch } = useForm<InquiryPayload>({
    defaultValues
  });
  const router = useRouter();

  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const includesStudio = watch("includesStudio");

  useEffect(() => {
    async function loadSeasons() {
      try {
        const response = await fetch("/api/public/availability");
        const data = await response.json();
        setSeasons(data.seasons ?? []);
      } catch {
        setSeasons([]);
      }
    }
    loadSeasons();
  }, []);

  async function onSubmit(payload: InquiryPayload) {
    setStatus("loading");
    setError(null);
    try {
      const response = await fetch("/api/public/hold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.message ?? (locale === "en" ? "Unknown error" : "Unbekannter Fehler"));
      }
      reset({ ...defaultValues, language: locale });
      setStatus("success");
      router.push(locale === "en" ? "/en/success" : "/success");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : (locale === "en" ? "Send failed" : "Fehler beim Senden"));
    }
  }

  return (
    <form className="card grid gap-4 p-6" onSubmit={handleSubmit(onSubmit)}>
      <input type="hidden" value={locale} {...register("language")} />
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="label">{locale === "en" ? "Arrival" : "Anreise"}</label>
          <input type="date" className="input" {...register("startDate", { required: true })} />
        </div>
        <div>
          <label className="label">{locale === "en" ? "Departure" : "Abreise"}</label>
          <input type="date" className="input" {...register("endDate", { required: true })} />
        </div>
      </div>
      <div className="text-xs text-ink/60">
        {locale === "en"
          ? "Minimum stay depends on season. A note will appear automatically."
          : "Mindestaufenthalt abhängig von Saison. Hinweis erscheint automatisch."}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="label">{locale === "en" ? "Guests" : "Gästeanzahl"}</label>
          <input type="number" min={1} className="input" {...register("guests", { required: true })} />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <input type="checkbox" className="h-4 w-4" {...register("includesStudio")} />
          <span className="text-sm text-ink/70">
            {locale === "en"
              ? "Add studio (only together with the house)"
              : "Studio zusätzlich buchen (nur zusammen mit dem Haus)"}
          </span>
        </div>
      </div>
      <div className="card bg-sand p-4">
        <p className="text-sm font-semibold">
          {locale === "en" ? "Price preview" : "Preisvorschau"}
        </p>
        <div className="mt-2">
          <PricePreview
            startDate={startDate ?? ""}
            endDate={endDate ?? ""}
            includesStudio={Boolean(includesStudio)}
            seasons={seasons}
            locale={locale}
          />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="label">{locale === "en" ? "Name" : "Name"}</label>
          <input type="text" className="input" {...register("name", { required: true })} />
        </div>
        <div>
          <label className="label">E-Mail</label>
          <input type="email" className="input" {...register("email", { required: true })} />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="label">{locale === "en" ? "Phone (optional)" : "Telefon (optional)"}</label>
          <input type="tel" className="input" {...register("phone")} />
        </div>
        <div>
          <label className="label">{locale === "en" ? "Message (optional)" : "Nachricht (optional)"}</label>
          <input type="text" className="input" {...register("message")} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-ink/70">
        <input type="checkbox" className="h-4 w-4" {...register("acceptPrivacy", { required: true })} />
        {locale === "en" ? "I have read the privacy policy." : "Ich habe die Datenschutzerklärung gelesen."}
      </label>
      <button type="submit" className="btn" disabled={status === "loading"}>
        {locale === "en" ? "Send request" : "Anfrage senden"}
      </button>
      {status === "error" && (
        <p className="text-sm text-rose-700">{error}</p>
      )}
    </form>
  );
}
