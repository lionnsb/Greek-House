const sections = [
  {
    title: "1. Geltungsbereich und Vertragspartner",
    paragraphs: [
      "Diese Allgemeinen Geschäftsbedingungen gelten für die Vermietung des Ferienhauses Mati tis Thalassas in 84302 Kastraki, Naxos, Griechenland an Feriengäste.",
      "Vertragspartner ist: Dagmar Goller, Dorfstrasse 29, 8712 Stäfa, Schweiz (nachfolgend \"Vermieter\")."
    ]
  },
  {
    title: "2. Vertragsabschluss und Buchung",
    paragraphs: [
      "Die Darstellung der Verfügbarkeiten und Preise auf der Website stellt kein rechtlich bindendes Angebot dar. Mit dem Absenden einer Reservierungsanfrage über den Kalender gibt der Gast eine Anfrage ab.",
      "Der Mietvertrag kommt erst zustande, wenn der Vermieter die Buchung schriftlich (per E-Mail) bestätigt hat (Buchungsbestätigung)."
    ]
  },
  {
    title: "3. Zahlungsbedingungen",
    items: [
      "Der Gesamtmietpreis sowie anfallende Nebenkosten (z. B. Endreinigung, Kurtaxe) richten sich nach den Angaben bei der Buchung.",
      "Eine Anzahlung von 50 % des Gesamtbetrags ist innerhalb von 10 Tagen nach Erhalt der Buchungsbestätigung zu leisten.",
      "Der Restbetrag ist spätestens 21 Tage vor Mietbeginn fällig.",
      "Bei kurzfristigen Buchungen (weniger als 30 Tage vor Anreise) ist der Gesamtbetrag sofort fällig."
    ]
  },
  {
    title: "4. Stornierungsbedingungen (Rücktritt durch den Gast)",
    paragraphs: [
      "Tritt der Gast vom Vertrag zurück, gelten folgende Stornierungsgebühren:"
    ],
    items: [
      "Bis 60 Tage vor Mietbeginn: kostenfreie Stornierung (Rückerstattung der Anzahlung).",
      "59 bis 30 Tage vor Mietbeginn: 50 % des Gesamtmietpreises.",
      "Ab 29 Tage vor Mietbeginn oder bei Nichtanreise: 100 % des Gesamtmietpreises.",
      "Der Abbruch des Aufenthaltes während der Mietzeit berechtigt nicht zur Rückerstattung.",
      "Wir empfehlen den Abschluss einer Annullierungskostenversicherung."
    ]
  },
  {
    title: "5. Rechte und Pflichten des Gastes (Hausordnung)",
    items: [
      "Das Mietobjekt darf nur von den in der Buchung aufgeführten Personen belegt werden.",
      "Haustiere sind nicht erlaubt.",
      "Umgang mit Streunern und Fütterungsverbot: Aufgrund der lokalen Gegebenheiten in Griechenland kann es vorkommen, dass sich herrenlose Hunde oder Katzen dem Grundstück nähern. Es ist strikt untersagt, diese Tiere zu füttern oder ins Haus zu lassen. Das Füttern führt dazu, dass die Tiere das Grundstück nicht mehr verlassen, nachfolgende Gäste belästigen und Polster oder Sitzkissen verschmutzen oder mit Parasiten (Flöhen oder Zecken) verunreinigen. Bei Missachtung dieses Verbots haftet der Gast für die Kosten einer professionellen Tiefenreinigung oder den Ersatz von Textilien.",
      "Im gesamten Ferienhaus gilt ein striktes Rauchverbot.",
      "Der Gast verpflichtet sich, das Mietobjekt und das Inventar pfleglich zu behandeln. Schäden sind dem Vermieter unverzüglich zu melden.",
      "Nutzung von Pool und Aussenküche: Die Nutzung des Swimmingpools und der Aussenküche inklusive Gasgrill erfolgt auf eigene Gefahr. Der Gast verpflichtet sich, die bereitgestellte Bedienungsanleitung für den Gasgrill strikt zu beachten und das Gasventil nach jeder Nutzung vollständig zu schliessen. Aus Sicherheitsgründen ist die Mitnahme von Glasgeschirr oder Glasflaschen in den gesamten Poolbereich strikt untersagt.",
      "Aufsichtspflicht: Kinder dürfen sich zu keinem Zeitpunkt unbeaufsichtigt im Poolbereich oder an der Aussenküche aufhalten. Die Aufsichtspflicht obliegt während des gesamten Aufenthalts vollumfänglich und ausschliesslich den Eltern bzw. den gesetzlichen Begleitpersonen.",
      "Mit der Buchungsbestätigung erhält der Gast die spezifischen Hausregeln (inkl. lokaler Besonderheiten wie Abwasserregelung auf Naxos, Müllentsorgung, Pool- und Grillnutzung) als PDF. Diese Hausregeln sind integraler Bestandteil dieses Vertrages und vom Gast strikt einzuhalten."
    ]
  },
  {
    title: "6. Haftung",
    paragraphs: [
      "Der Vermieter haftet für die ordnungsgemässe Bereitstellung des Mietobjekts. Die Haftung für leichte Fahrlässigkeit, unvorhersehbare Ausfälle (z. B. temporäre Strom-, Internet- oder Wasserausfälle durch die Gemeinde) sowie höhere Gewalt ist ausgeschlossen. Die Haftung für das Auftreten oder den Aufenthalt von lokalen, freilebenden oder herrenlosen Tieren (z. B. Streunerkatzen, Hunde, Insekten) auf dem Aussengelände sowie daraus resultierende Unannehmlichkeiten ist vollumfänglich ausgeschlossen.",
      "Der Vermieter übernimmt keine Haftung für Unfälle, Verletzungen oder Sachschäden, die durch die Nutzung oder den unsachgemässen Gebrauch des Pools, der Aussenküche oder des Gasgrills entstehen. Der Gast stellt den Vermieter von jeglichen Haftungsansprüchen Dritter in diesem Zusammenhang frei.",
      "Der Gast haftet in vollem Umfang für alle von ihm, seinen Mitreisenden, Gästen oder Haustieren verursachten Schäden am Mietobjekt, am Pool, an den technischen Anlagen und am Inventar."
    ]
  },
  {
    title: "7. Anwendbares Recht und Gerichtsstand",
    paragraphs: [
      "Auf das Vertragsverhältnis ist ausschliesslich Schweizer Recht anwendbar. Ausschliesslicher Gerichtsstand ist Stäfa, Schweiz."
    ]
  }
];

export default function AgbPage() {
  return (
    <div className="section">
      <div className="container">
        <h1 className="text-3xl font-semibold">
          Allgemeine Geschäfts- und Mietbedingungen (AGB)
        </h1>
        <p className="mt-4 text-sm text-ink/70">
          Für das Ferienhaus Mati tis Thalassas in Naxos, Kastraki.
        </p>
        <div className="mt-6 grid gap-4 text-sm text-ink/70">
          {sections.map((section) => (
            <div key={section.title} className="card p-5">
              <p className="font-semibold text-ink">{section.title}</p>
              {section.paragraphs?.map((paragraph) => (
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
