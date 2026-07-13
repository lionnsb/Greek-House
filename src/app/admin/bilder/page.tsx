"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminFetch";
import {
  compressImageForUpload,
  parseImageAdminResponse
} from "@/lib/adminImageUpload";
import { MAX_IMAGE_UPLOAD_SIZE } from "@/lib/imageUploadLimits";
import {
  getSiteImagesForSection,
  SITE_IMAGE_SECTION_CONFIGS,
  type SiteImage,
  type SiteImagePage,
  type SiteImageSection,
  type SiteImageSectionConfig
} from "@/lib/siteImages";

const PAGE_TABS: Array<{
  id: SiteImagePage;
  label: string;
  href: string;
}> = [
  { id: "home", label: "Startseite", href: "/" },
  { id: "house", label: "Apartment", href: "/haus" },
  { id: "studio", label: "Studio", href: "/haus#studio" }
];

function previewAspect(section: SiteImageSection) {
  if (section === "home-hero") return "aspect-[16/9]";
  if (section === "house-top" || section === "studio-gallery") {
    return "aspect-square";
  }
  return "aspect-[4/3]";
}

export default function AdminBilderPage() {
  const [items, setItems] = useState<SiteImage[]>([]);
  const [altDrafts, setAltDrafts] = useState<Record<string, string>>({});
  const [activePage, setActivePage] = useState<SiteImagePage>("home");
  const [loading, setLoading] = useState(true);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function loadImages() {
    setLoading(true);
    setError(null);
    try {
      const response = await adminFetch("/api/admin/images");
      const data = await parseImageAdminResponse(response);
      if (!response.ok || !data.items) {
        throw new Error(data.message ?? "Bilder konnten nicht geladen werden.");
      }
      const nextItems = data.items ?? [];
      setItems(nextItems);
      setAltDrafts(
        Object.fromEntries(nextItems.map((item) => [item.id, item.alt]))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Laden");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadImages();
  }, []);

  async function uploadImage(
    file: File,
    section: SiteImageSection,
    replaceId?: string
  ) {
    const operationKey = replaceId
      ? `replace-${replaceId}`
      : `upload-${section}`;
    setBusyKey(operationKey);
    setError(null);
    setNotice(null);

    try {
      const optimized = await compressImageForUpload(file);
      if (optimized.size > MAX_IMAGE_UPLOAD_SIZE) {
        throw new Error(
          "Das optimierte Bild ist noch zu groß. Bitte eine kleinere Datei auswählen."
        );
      }

      const formData = new FormData();
      formData.set("file", optimized);
      formData.set("section", section);
      if (replaceId) {
        formData.set("replaceId", replaceId);
        formData.set("alt", altDrafts[replaceId] ?? "");
      }

      const response = await adminFetch("/api/admin/images", {
        method: "POST",
        body: formData
      });
      const data = await parseImageAdminResponse(response);
      if (!response.ok || !data.item) {
        throw new Error(data.message ?? "Bild konnte nicht gespeichert werden.");
      }

      const nextItem = data.item;
      setItems((current) =>
        replaceId
          ? current.map((item) => (item.id === replaceId ? nextItem : item))
          : [...current, nextItem]
      );
      setAltDrafts((current) => ({
        ...current,
        [nextItem.id]: nextItem.alt
      }));
      setNotice(replaceId ? "Bild wurde ersetzt." : "Bild wurde hochgeladen.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload fehlgeschlagen");
    } finally {
      setBusyKey(null);
    }
  }

  async function saveAlt(image: SiteImage) {
    setBusyKey(`alt-${image.id}`);
    setError(null);
    setNotice(null);
    try {
      const response = await adminFetch(`/api/admin/images/${image.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alt: altDrafts[image.id] ?? "" })
      });
      const data = await parseImageAdminResponse(response);
      if (!response.ok || !data.item) {
        throw new Error(
          data.message ?? "Alternativtext konnte nicht gespeichert werden."
        );
      }
      setItems((current) =>
        current.map((item) => (item.id === image.id ? data.item! : item))
      );
      setNotice("Alternativtext wurde gespeichert.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen");
    } finally {
      setBusyKey(null);
    }
  }

  async function deleteImage(image: SiteImage) {
    if (!confirm("Dieses Bild wirklich löschen?")) return;

    setBusyKey(`delete-${image.id}`);
    setError(null);
    setNotice(null);
    try {
      const response = await adminFetch(`/api/admin/images/${image.id}`, {
        method: "DELETE"
      });
      const data = await parseImageAdminResponse(response);
      if (!response.ok || data.ok !== true) {
        throw new Error(data.message ?? "Bild konnte nicht gelöscht werden.");
      }
      setItems((current) => current.filter((item) => item.id !== image.id));
      setAltDrafts((current) => {
        const next = { ...current };
        delete next[image.id];
        return next;
      });
      setNotice("Bild wurde gelöscht.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Löschen fehlgeschlagen");
    } finally {
      setBusyKey(null);
    }
  }

  async function moveImage(
    section: SiteImageSection,
    imageId: string,
    direction: -1 | 1
  ) {
    const sectionItems = getSiteImagesForSection(items, section);
    const currentIndex = sectionItems.findIndex((item) => item.id === imageId);
    const targetIndex = currentIndex + direction;
    if (
      currentIndex < 0 ||
      targetIndex < 0 ||
      targetIndex >= sectionItems.length
    ) {
      return;
    }

    const reordered = [...sectionItems];
    [reordered[currentIndex], reordered[targetIndex]] = [
      reordered[targetIndex],
      reordered[currentIndex]
    ];
    const previousItems = items;
    const nextOrder = new Map(
      reordered.map((item, order) => [item.id, order] as const)
    );
    setItems((current) =>
      current.map((item) =>
        item.section === section
          ? { ...item, order: nextOrder.get(item.id) ?? item.order }
          : item
      )
    );
    setBusyKey(`order-${section}`);
    setError(null);
    setNotice(null);

    try {
      const response = await adminFetch("/api/admin/images/order", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section,
          ids: reordered.map((item) => item.id)
        })
      });
      const data = await parseImageAdminResponse(response);
      if (!response.ok || data.ok !== true) {
        throw new Error(
          data.message ?? "Sortierung konnte nicht gespeichert werden."
        );
      }
      setNotice("Reihenfolge wurde gespeichert.");
    } catch (err) {
      setItems(previousItems);
      setError(err instanceof Error ? err.message : "Sortieren fehlgeschlagen");
    } finally {
      setBusyKey(null);
    }
  }

  const activeTab = PAGE_TABS.find((tab) => tab.id === activePage)!;
  const activeSections = SITE_IMAGE_SECTION_CONFIGS.filter(
    (section) => section.page === activePage
  );

  return (
    <div className="container pb-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Bilder verwalten</h1>
          <p className="mt-2 max-w-2xl text-sm text-ink/70">
            Bilder hochladen, ersetzen, löschen und in die richtige Reihenfolge
            bringen. Änderungen erscheinen direkt auf der Website.
          </p>
        </div>
        <Link href={activeTab.href} target="_blank" className="btn-outline">
          Seite öffnen
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2" role="tablist">
        {PAGE_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activePage === tab.id}
            onClick={() => setActivePage(tab.id)}
            className={activePage === tab.id ? "btn" : "btn-outline"}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-800">
          {error}
        </div>
      )}
      {notice && (
        <div className="mt-6 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-800">
          {notice}
        </div>
      )}

      {loading ? (
        <div className="card mt-6 p-6 text-sm text-ink/70">
          Bilder werden geladen...
        </div>
      ) : (
        <div className="mt-6 grid gap-8">
          {activeSections.map((section) => (
            <ImageSection
              key={section.id}
              config={section}
              items={getSiteImagesForSection(items, section.id)}
              altDrafts={altDrafts}
              busyKey={busyKey}
              onAltChange={(id, value) =>
                setAltDrafts((current) => ({ ...current, [id]: value }))
              }
              onUpload={(file) => uploadImage(file, section.id)}
              onReplace={(file, id) => uploadImage(file, section.id, id)}
              onSaveAlt={saveAlt}
              onDelete={deleteImage}
              onMove={(id, direction) => moveImage(section.id, id, direction)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ImageSection({
  config,
  items,
  altDrafts,
  busyKey,
  onAltChange,
  onUpload,
  onReplace,
  onSaveAlt,
  onDelete,
  onMove
}: {
  config: SiteImageSectionConfig;
  items: SiteImage[];
  altDrafts: Record<string, string>;
  busyKey: string | null;
  onAltChange: (id: string, value: string) => void;
  onUpload: (file: File) => void;
  onReplace: (file: File, id: string) => void;
  onSaveAlt: (image: SiteImage) => void;
  onDelete: (image: SiteImage) => void;
  onMove: (id: string, direction: -1 | 1) => void;
}) {
  const disabled = busyKey !== null;
  const canUpload = items.length < config.maxItems;

  function acceptDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (disabled || !canUpload) return;
    const file = event.dataTransfer.files[0];
    if (file) onUpload(file);
  }

  return (
    <section className="card overflow-hidden">
      <div className="border-b border-stone p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">{config.label}</h2>
            <p className="mt-1 text-sm text-ink/70">{config.description}</p>
            <p className="mt-2 text-xs text-ink/60">
              {items.length} von maximal {config.maxItems} Bildern
              {config.required ? " · kann nur ersetzt werden" : ""}
            </p>
          </div>
          {canUpload && (
            <label className="btn cursor-pointer">
              {busyKey === `upload-${config.id}`
                ? "Wird hochgeladen..."
                : "Bild hochladen"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                disabled={disabled}
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0];
                  if (file) onUpload(file);
                  event.currentTarget.value = "";
                }}
              />
            </label>
          )}
        </div>
      </div>

      <div
        className="p-6"
        onDragOver={(event) => event.preventDefault()}
        onDrop={acceptDrop}
      >
        {items.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-stone p-10 text-center text-sm text-ink/60">
            Noch keine Bilder. Eine Datei hierher ziehen oder oben hochladen.
          </div>
        ) : (
          <div className={`grid gap-5 ${config.previewClassName}`}>
            {items.map((image, index) => (
              <article
                key={image.id}
                className="overflow-hidden rounded-2xl border border-stone bg-sand/40"
              >
                <div
                  className={`overflow-hidden bg-stone/30 ${previewAspect(config.id)}`}
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="grid gap-3 p-4">
                  <div>
                    <label className="label" htmlFor={`alt-${image.id}`}>
                      Bildbeschreibung
                    </label>
                    <input
                      id={`alt-${image.id}`}
                      className="input mt-1"
                      maxLength={180}
                      value={altDrafts[image.id] ?? ""}
                      disabled={disabled}
                      onChange={(event) =>
                        onAltChange(image.id, event.target.value)
                      }
                    />
                  </div>
                  <button
                    type="button"
                    className="btn-outline"
                    disabled={
                      disabled || (altDrafts[image.id] ?? "") === image.alt
                    }
                    onClick={() => onSaveAlt(image)}
                  >
                    Beschreibung speichern
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      className="btn-outline px-3"
                      disabled={disabled || index === 0}
                      onClick={() => onMove(image.id, -1)}
                    >
                      Nach vorne
                    </button>
                    <button
                      type="button"
                      className="btn-outline px-3"
                      disabled={disabled || index === items.length - 1}
                      onClick={() => onMove(image.id, 1)}
                    >
                      Nach hinten
                    </button>
                  </div>
                  <div
                    className={
                      config.required ? "grid" : "grid grid-cols-2 gap-2"
                    }
                  >
                    <label className="btn-outline cursor-pointer px-3">
                      {busyKey === `replace-${image.id}`
                        ? "Wird ersetzt..."
                        : "Ersetzen"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        disabled={disabled}
                        onChange={(event) => {
                          const file = event.currentTarget.files?.[0];
                          if (file) onReplace(file, image.id);
                          event.currentTarget.value = "";
                        }}
                      />
                    </label>
                    {!config.required && (
                      <button
                        type="button"
                        className="inline-flex items-center justify-center rounded-xl border border-rose-300 px-3 py-3 text-sm font-semibold text-rose-800 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={disabled}
                        onClick={() => onDelete(image)}
                      >
                        Löschen
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
        {canUpload && items.length > 0 && (
          <p className="mt-5 rounded-xl border-2 border-dashed border-stone p-4 text-center text-xs text-ink/60">
            Neue Bilder können auch direkt in diesen Bereich gezogen werden.
          </p>
        )}
      </div>
    </section>
  );
}
