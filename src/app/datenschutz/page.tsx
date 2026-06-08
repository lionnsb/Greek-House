const sections = [
  {
    title: "Verantwortliche Stelle",
    body: [
      "Verantwortliche Stelle für die Datenverarbeitung auf dieser Website im Sinne des Schweizer Datenschutzgesetzes (DSG) ist:"
    ],
    items: [
      "Dagmar Goller",
      "Dorfstrasse 29",
      "8712 Stäfa",
      "E-Mail: dagmar@naxos-apartment.com"
    ]
  },
  {
    title: "1. Erhebung und Verarbeitung von Personendaten",
    body: [
      "Wir verarbeiten primär die Personendaten, die wir im Rahmen unserer Beziehung mit unseren Gästen und Website-Besuchern erhalten. Wenn Sie unseren Reservierungskalender nutzen, erheben wir folgende Daten:"
    ],
    items: [
      "Vorname und Nachname",
      "Kontaktdaten (E-Mail-Adresse, Telefonnummer, Postadresse)",
      "Gewünschter Zeitraum des Aufenthalts und Anzahl der Personen",
      "Ggf. Zahlungsinformationen und Sonderwünsche"
    ]
  },
  {
    title: "2. Zweck der Datenverarbeitung",
    body: [
      "Die Datenverarbeitung erfolgt ausschliesslich zu folgenden Zwecken:"
    ],
    items: [
      "Bearbeitung Ihrer Reservierungsanfrage und Abwicklung des Mietvertrags.",
      "Kontaktaufnahme mit Ihnen bezüglich Ihres Aufenthalts.",
      "Erfüllung gesetzlicher Pflichten (z. B. Meldepflichten für Kurtaxen an die Tourismusbehörde)."
    ]
  },
  {
    title: "3. Weitergabe von Daten an Dritte",
    body: [
      "Ihre Daten werden vertraulich behandelt. Eine Weitergabe an Dritte erfolgt nur, wenn dies zur Vertragserfüllung notwendig ist, z. B. an die lokale Tourismusbehörde für die Kurtaxenabrechnung oder an die Bank zur Zahlungsabwicklung."
    ]
  },
  {
    title: "4. Datensicherheit",
    body: [
      "Wir treffen angemessene technische und organisatorische Sicherheitsmassnahmen, um Ihre Personendaten gegen unberechtigten Zugriff und Missbrauch zu schützen (z. B. SSL-Verschlüsselung dieser Website, erkennbar an dem \"https://\" in der Adresszeile)."
    ]
  },
  {
    title: "5. Ihre Rechte",
    body: [
      "Sie haben im Rahmen des auf Sie anwendbaren Datenschutzrechts das Recht auf Auskunft, Berichtigung, Löschung oder Einschränkung der Verarbeitung Ihrer gespeicherten Daten. Wenden Sie sich hierzu bitte direkt per E-Mail an die oben genannte verantwortliche Stelle."
    ]
  },
  {
    title: "6. Änderungen",
    body: [
      "Wir können diese Datenschutzerklärung jederzeit ohne Vorankündigung anpassen. Es gilt die jeweils aktuelle, auf unserer Website publizierte Fassung."
    ]
  }
];

export default function DatenschutzPage() {
  return (
    <div className="section">
      <div className="container">
        <h1 className="text-3xl font-semibold">Datenschutzerklärung</h1>
        <div className="mt-6 grid gap-4 text-sm text-ink/70">
          {sections.map((section) => (
            <div key={section.title} className="card p-5">
              <p className="font-semibold text-ink">{section.title}</p>
              {section.body.map((paragraph) => (
                <p key={paragraph} className="mt-3">
                  {paragraph}
                </p>
              ))}
              {section.items && (
                <ul className="mt-3 grid gap-2 list-disc pl-5">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
