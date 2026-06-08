const sections = [
  {
    title: "1. Scope and Contracting Party",
    paragraphs: [
      "These General Terms and Conditions apply to the rental of the holiday home Mati tis Thalassas in 84302 Kastraki, Naxos, Greece to holiday guests.",
      "The contracting party is: Dagmar Goller, Dorfstrasse 29, 8712 Stäfa, Switzerland (hereinafter referred to as the \"Landlord\")."
    ]
  },
  {
    title: "2. Conclusion of Contract and Booking",
    paragraphs: [
      "The display of availability and prices on the website does not constitute a legally binding offer. By submitting a reservation request via the calendar, the guest submits an enquiry.",
      "The rental agreement only comes into effect once the landlord has confirmed the booking in writing (by email) (booking confirmation)."
    ]
  },
  {
    title: "3. Payment Terms",
    items: [
      "The total rental price and any additional costs (e.g. final cleaning, tourist tax) are based on the information provided at the time of booking.",
      "A deposit of 50% of the total amount must be paid within 10 days of receiving the booking confirmation.",
      "The remaining balance is due no later than 21 days before the start of the rental period.",
      "For short-notice bookings (less than 30 days before arrival), the full amount is due immediately."
    ]
  },
  {
    title: "4. Cancellation Policy (Withdrawal by the Guest)",
    paragraphs: [
      "If the guest withdraws from the contract, the following cancellation fees apply:"
    ],
    items: [
      "Up to 60 days before the start of the rental period: free cancellation (refund of the deposit).",
      "59 to 30 days before the start of the rental period: 50% of the total rental price.",
      "From 29 days before the start of the rental period or in the event of no-show: 100% of the total rental price.",
      "Early termination of the stay during the rental period does not entitle the guest to any refund.",
      "We recommend taking out cancellation insurance."
    ]
  },
  {
    title: "5. Rights and Obligations of the Guest (House Rules)",
    items: [
      "The rental property may only be occupied by the persons listed in the booking.",
      "Pets are not allowed.",
      "Handling of stray animals and feeding ban: Due to local conditions in Greece, stray dogs or cats may approach the property. It is strictly forbidden to feed these animals or let them into the house. Feeding them causes the animals to remain on the property, disturb subsequent guests and soil cushions or seat pads or contaminate them with parasites (fleas or ticks). In the event of a breach of this prohibition, the guest is liable for the cost of professional deep cleaning or replacement of textiles.",
      "Smoking is strictly prohibited throughout the entire holiday home.",
      "The guest undertakes to treat the rental property and the inventory with care. Damage must be reported to the landlord without delay.",
      "Use of the pool and outdoor kitchen: Use of the swimming pool and outdoor kitchen, including the gas grill, is at the guest's own risk. The guest undertakes to strictly follow the operating instructions provided for the gas grill and to fully close the gas valve after each use. For safety reasons, bringing glass tableware or glass bottles into the entire pool area is strictly prohibited.",
      "Duty of supervision: Children must never be left unsupervised in the pool area or at the outdoor kitchen. During the entire stay, supervision is the sole and full responsibility of the parents or legal accompanying persons.",
      "With the booking confirmation, the guest receives the specific house rules (including local particularities such as wastewater rules on Naxos, waste disposal, and pool and grill use) as a PDF. These house rules form an integral part of this contract and must be strictly observed by the guest."
    ]
  },
  {
    title: "6. Liability",
    paragraphs: [
      "The landlord is liable for the proper provision of the rental property. Liability for slight negligence, unforeseeable outages (e.g. temporary power, internet or water outages caused by the municipality) and force majeure is excluded. Liability for the presence or stay of local, free-roaming or stray animals (e.g. stray cats, dogs, insects) on the outdoor premises and any resulting inconvenience is excluded in full.",
      "The landlord assumes no liability for accidents, injuries or property damage arising from the use or improper use of the pool, outdoor kitchen or gas grill. The guest indemnifies the landlord against any third-party liability claims in this connection.",
      "The guest is fully liable for all damage caused by the guest, fellow travellers, guests or pets to the rental property, the pool, the technical facilities and the inventory."
    ]
  },
  {
    title: "7. Applicable Law and Place of Jurisdiction",
    paragraphs: [
      "The contractual relationship is governed exclusively by Swiss law. The exclusive place of jurisdiction is Stäfa, Switzerland."
    ]
  }
];

export default function TermsPageEn() {
  return (
    <div className="section">
      <div className="container">
        <h1 className="text-3xl font-semibold">
          General Terms and Rental Conditions (AGB)
        </h1>
        <p className="mt-4 text-sm text-ink/70">
          For convenience, an English version of the booking and rental terms
          is provided below.
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
