# Greek House

Public website + Admin-Dashboard für Anfragen, Verfügbarkeiten und Buchungen.

## Stack
- Next.js (App Router)
- Tailwind CSS
- Firebase (Auth + Firestore)
- SMTP via Nodemailer

## Lokale Einrichtung
1. Abhängigkeiten installieren
   - `npm install`
2. Env-Datei anlegen
   - `.env.local` anhand `.env.example` befüllen
3. Development starten
   - `npm run dev`

## Datenmodell (Firestore)
**reservations**
- `start_date` (string, yyyy-MM-dd)
- `end_date` (string, yyyy-MM-dd)
- `status` (HOLD | ACCEPTED_AWAITING_PAYMENT | CONFIRMED | REJECTED)
- `name`, `email`, `phone`, `guests`, `message`
- `includes_studio` (bool)
- `hold_until`
- `price_total`, `deposit_amount`, `payment_due_until`
- `created_at`

**availability_blocks**
- `start_date` (string)
- `end_date` (string)
- `reason`
- `created_at`

**site_images**
- `section` (`home-hero` | `home-gallery` | `house-top` | `room-features` | `house-gallery` | `studio-gallery` | `location-gallery`)
- `src`, `file_id`, `alt`
- `sort_order`
- `created_at`, `updated_at`

**site_image_files**
- `content_type`, `size`, `chunk_count`, `created_at`
- Binärdaten liegen in der Unter-Collection `chunks`.

## Admin Auth
- Firebase Auth (E-Mail + Passwort)
- Server prüft Admins via `ADMIN_EMAILS` (kommagetrennt)
- Admin-Benachrichtigungen und BCC-Kopien der Kunden-Statusmails via `ADMIN_NOTIFY_EMAILS` (optional)

## Bildverwaltung
- Unter `/admin/bilder` können Admins Bilder hochladen, ersetzen, löschen und sortieren.
- Neue Bilder werden vor dem Upload im Browser verkleinert und in Blöcken direkt in Firestore gespeichert.
- Die Bildverwaltung benötigt dadurch keinen separaten Storage-Bucket.
- Beim ersten Öffnen der Bildverwaltung werden die bestehenden Bilder aus `public/img` als verwaltbare Firestore-Einträge übernommen.

## E-Mails
Beim Setzen auf `ACCEPTED_AWAITING_PAYMENT` bzw. `CONFIRMED` werden E-Mails über SMTP versendet.

## Hinweise
- Admin-APIs erwarten ein Firebase ID Token im `Authorization` Header.
- Der öffentliche Kalender ruft `/api/public/availability`.

## Pricing (optional)
Für automatische Preisvorschläge im Admin:
- `NEXT_PUBLIC_PRICE_PER_NIGHT`
- `NEXT_PUBLIC_STUDIO_SURCHARGE_PER_NIGHT`

### Saisonpreise (optional)
Zusätzlich kann Sommer/Winter definiert werden (ISO-Datum):
- `NEXT_PUBLIC_SUMMER_START` / `NEXT_PUBLIC_SUMMER_END`
- `NEXT_PUBLIC_SUMMER_PRICE_PER_NIGHT`
- `NEXT_PUBLIC_SUMMER_STUDIO_SURCHARGE_PER_NIGHT`
- `NEXT_PUBLIC_WINTER_START` / `NEXT_PUBLIC_WINTER_END`
- `NEXT_PUBLIC_WINTER_PRICE_PER_NIGHT`
- `NEXT_PUBLIC_WINTER_STUDIO_SURCHARGE_PER_NIGHT`
 - `NEXT_PUBLIC_SUMMER_MIN_NIGHTS`
 - `NEXT_PUBLIC_WINTER_MIN_NIGHTS`
 - `NEXT_PUBLIC_STANDARD_MIN_NIGHTS`

## Cleanup (Cron)
Für automatisches Entfernen abgelaufener HOLDs:
- `POST /api/cron/cleanup-holds`
- Header `Authorization: Bearer <CRON_SECRET>` oder `?token=<CRON_SECRET>`
