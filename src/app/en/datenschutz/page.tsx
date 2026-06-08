const sections = [
  {
    title: "Responsible Party",
    body: [
      "The responsible party for data processing on this website within the meaning of the Swiss Federal Act on Data Protection (FADP) is:"
    ],
    items: [
      "Dagmar Goller",
      "Dorfstrasse 29",
      "8712 Stäfa",
      "E-mail: dagmar@naxos-apartment.com"
    ]
  },
  {
    title: "1. Collection and Processing of Personal Data",
    body: [
      "We primarily process the personal data that we receive in the course of our relationship with our guests and website visitors. If you use our reservation calendar, we collect the following data:"
    ],
    items: [
      "First and last name",
      "Contact details (email address, telephone number, postal address)",
      "Requested travel period and number of guests",
      "If applicable, payment information and special requests"
    ]
  },
  {
    title: "2. Purpose of Data Processing",
    body: [
      "The data is processed exclusively for the following purposes:"
    ],
    items: [
      "Handling your reservation request and processing the rental agreement.",
      "Contacting you regarding your stay.",
      "Fulfilling legal obligations (e.g. reporting obligations for tourist taxes to the tourism authority)."
    ]
  },
  {
    title: "3. Disclosure of Data to Third Parties",
    body: [
      "Your data will be treated confidentially. Data will only be passed on to third parties if this is necessary for the performance of the contract, for example to the local tourism authority for tourist tax settlement or to the bank for payment processing."
    ]
  },
  {
    title: "4. Data Security",
    body: [
      "We take appropriate technical and organisational security measures to protect your personal data against unauthorised access and misuse (e.g. SSL encryption of this website, recognisable by the \"https://\" in the address bar)."
    ]
  },
  {
    title: "5. Your Rights",
    body: [
      "Within the scope of the data protection law applicable to you, you have the right to access, rectify, delete or restrict the processing of your stored data. Please contact the responsible party named above directly by email."
    ]
  },
  {
    title: "6. Changes",
    body: [
      "We may amend this privacy policy at any time without prior notice. The current version published on our website shall apply."
    ]
  }
];

export default function PrivacyPageEn() {
  return (
    <div className="section">
      <div className="container">
        <h1 className="text-3xl font-semibold">Privacy Policy</h1>
        <p className="mt-4 text-sm text-ink/70">
          For convenience, an English version of the privacy information is
          provided below.
        </p>
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
