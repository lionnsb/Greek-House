export default function ArrivalPageEn() {
  return (
    <div className="section">
      <div className="container grid gap-10 md:grid-cols-2">
        <div>
          <h1 className="text-3xl font-semibold">Arrival</h1>
          <p className="mt-4 text-sm text-ink/70">
            Here you find the key information about the apartment&apos;s location
            and the beaches in the immediate surroundings.
          </p>
          <div className="mt-6 grid gap-4 text-sm text-ink/70">
            <div className="card p-4">
              <p className="font-semibold text-ink">Location</p>
              <p className="mt-2">
                Villa Mati tis Thalassas is located in Kastraki only about
                50 m from the sea and a small beach. The apartment for rent is
                on the ground floor.
              </p>
            </div>
            <div className="card p-4">
              <p className="font-semibold text-ink">Check-in</p>
              <p className="mt-2">From 16:00, self check-in possible.</p>
            </div>
            <div className="card p-4">
              <p className="font-semibold text-ink">Check-out</p>
              <p className="mt-2">By 10:00 on departure day.</p>
            </div>
            <div className="card p-4">
              <p className="font-semibold text-ink">Nearby beaches</p>
              <p className="mt-2">
                Sahara Beach approx. 250 m, Glyfada Beach approx. 350 m. Both
                beaches are not overcrowded even in high season.
              </p>
            </div>
            <div className="card p-4">
              <p className="font-semibold text-ink">Essentials</p>
              <p className="mt-2">
                From May to mid-October, several beach restaurants and a bar
                are within walking distance. There are also four supermarkets
                and two bakeries nearby.
              </p>
            </div>
          </div>
        </div>
        <div className="card h-96 bg-stone/50" />
      </div>
    </div>
  );
}
