export default function ArrivalPageEn() {
  return (
    <div className="section">
      <div className="container grid gap-10 md:grid-cols-2">
        <div>
          <h1 className="text-3xl font-semibold">Arrival</h1>
          <p className="mt-4 text-sm text-ink/70">
            Here you find the key information about location, arrival and
            check-in/check-out.
          </p>
          <div className="mt-6 grid gap-4 text-sm text-ink/70">
            <div className="card p-4">
              <p className="font-semibold text-ink">Location</p>
              <p className="mt-2">
                Kastraki, Naxos – about 50 m from the sea. Address and map link
                will be provided.
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
                Sahara Beach ~250 m, Glyfada Beach ~350 m.
              </p>
            </div>
            <div className="card p-4">
              <p className="font-semibold text-ink">Essentials</p>
              <p className="mt-2">
                Restaurants and a bar within walking distance from May to
                mid-October. Supermarkets and bakeries nearby.
              </p>
            </div>
          </div>
        </div>
        <div className="card h-96 bg-stone/50" />
      </div>
    </div>
  );
}
