import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { normalizeStudioSelection } from "../src/lib/bookingRules.js";
import {
  buildSeasonCatalog,
  calculateSeasonalTotal,
  seasonForDate,
  type SeasonDefinition
} from "../src/lib/seasonPricing.js";
import { mapDbSeasons } from "../src/lib/seasonStore.js";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

function setStandardFallback(pricePerNight: number, studioSurchargePerNight = 0) {
  process.env.NEXT_PUBLIC_PRICE_PER_NIGHT = String(pricePerNight);
  process.env.NEXT_PUBLIC_STUDIO_SURCHARGE_PER_NIGHT = String(studioSurchargePerNight);
  process.env.NEXT_PUBLIC_STANDARD_MIN_NIGHTS = "1";
}

function buildAdminCatalog(seasons: SeasonDefinition[]) {
  return buildSeasonCatalog(
    seasons.map((season) => ({
      ...season,
      source: "admin" as const
    }))
  );
}

describe("seasonPricing", () => {
  it("calculates a single season without studio across all nights", () => {
    setStandardFallback(90);

    const pricing = calculateSeasonalTotal({
      startDate: "2026-05-18",
      endDate: "2026-05-22",
      includesStudio: false,
      seasons: buildAdminCatalog([
        {
          name: "Vorsaison",
          start: "2026-05-18",
          end: "2026-05-21",
          pricePerNight: 100,
          studioSurchargePerNight: 0,
          minNights: 1,
          createdAt: "2026-01-01T00:00:00.000Z"
        }
      ])
    });

    assert.equal(pricing.nights, 4);
    assert.equal(pricing.apartmentNightlyTotal, 400);
    assert.equal(pricing.total, 550);
    assert.deepEqual(
      pricing.breakdown.map((item) => item.date),
      ["2026-05-18", "2026-05-19", "2026-05-20", "2026-05-21"]
    );
  });

  it("splits the booking by season per night", () => {
    setStandardFallback(90);

    const pricing = calculateSeasonalTotal({
      startDate: "2026-04-03",
      endDate: "2026-04-08",
      includesStudio: false,
      seasons: buildAdminCatalog([
        {
          name: "Vorsaison",
          start: "2026-04-03",
          end: "2026-04-04",
          pricePerNight: 100,
          studioSurchargePerNight: 0,
          minNights: 1,
          createdAt: "2026-01-01T00:00:00.000Z"
        },
        {
          name: "Hauptsaison",
          start: "2026-04-05",
          end: "2026-04-08",
          pricePerNight: 200,
          studioSurchargePerNight: 0,
          minNights: 1,
          createdAt: "2026-01-02T00:00:00.000Z"
        }
      ])
    });

    assert.equal(pricing.nights, 5);
    assert.equal(pricing.apartmentNightlyTotal, 800);
    assert.equal(pricing.cleaningApartment, 150);
    assert.equal(pricing.total, 950);
    assert.deepEqual(
      pricing.breakdown.map((item) => item.apartmentPrice),
      [100, 100, 200, 200, 200]
    );
  });

  it("adds studio nightly totals and studio cleaning when selected", () => {
    setStandardFallback(90, 25);

    const pricing = calculateSeasonalTotal({
      startDate: "2026-04-03",
      endDate: "2026-04-08",
      includesStudio: true,
      seasons: buildAdminCatalog([
        {
          name: "Vorsaison",
          start: "2026-04-03",
          end: "2026-04-04",
          pricePerNight: 100,
          studioSurchargePerNight: 40,
          minNights: 1,
          createdAt: "2026-01-01T00:00:00.000Z"
        },
        {
          name: "Hauptsaison",
          start: "2026-04-05",
          end: "2026-04-08",
          pricePerNight: 200,
          studioSurchargePerNight: 60,
          minNights: 1,
          createdAt: "2026-01-02T00:00:00.000Z"
        }
      ])
    });

    assert.equal(pricing.apartmentNightlyTotal, 800);
    assert.equal(pricing.studioNightlyTotal, 260);
    assert.equal(pricing.cleaningStudio, 30);
    assert.equal(pricing.total, 1240);
  });

  it("falls back to the global standard price when no admin season matches", () => {
    setStandardFallback(90);

    const pricing = calculateSeasonalTotal({
      startDate: "2026-04-03",
      endDate: "2026-04-08",
      includesStudio: false,
      seasons: buildAdminCatalog([
        {
          name: "Vorsaison",
          start: "2026-04-03",
          end: "2026-04-04",
          pricePerNight: 100,
          studioSurchargePerNight: 0,
          minNights: 1,
          createdAt: "2026-01-01T00:00:00.000Z"
        }
      ])
    });

    assert.deepEqual(
      pricing.breakdown.map((item) => item.apartmentPrice),
      [100, 100, 90, 90, 90]
    );
    assert.equal(pricing.apartmentNightlyTotal, 470);
    assert.equal(pricing.total, 620);
  });

  it("uses an admin standard price without dates as the always-on base price", () => {
    setStandardFallback(90, 20);

    const pricing = calculateSeasonalTotal({
      startDate: "2026-04-03",
      endDate: "2026-04-08",
      includesStudio: false,
      seasons: buildSeasonCatalog(
        mapDbSeasons([
          {
            id: "standard-admin",
            name: "Standard",
            startDate: null,
            endDate: null,
            pricePerNight: 120,
            studioSurchargePerNight: 35,
            minNights: 1,
            createdAt: "2026-03-01T00:00:00.000Z"
          },
          {
            id: "high-season",
            name: "Hauptsaison",
            startDate: "2026-04-05",
            endDate: "2026-04-08",
            pricePerNight: 200,
            studioSurchargePerNight: 60,
            minNights: 1,
            createdAt: "2026-03-02T00:00:00.000Z"
          }
        ])
      )
    });

    assert.deepEqual(
      pricing.breakdown.map((item) => item.apartmentPrice),
      [120, 120, 200, 200, 200]
    );
    assert.equal(pricing.apartmentNightlyTotal, 840);
    assert.equal(pricing.total, 990);
  });

  it("lets the newest admin season win on overlapping dates", () => {
    setStandardFallback(90);

    const seasons = buildAdminCatalog([
      {
        name: "Hauptsaison",
        start: "2026-04-01",
        end: "2026-04-10",
        pricePerNight: 200,
        studioSurchargePerNight: 0,
        minNights: 1,
        createdAt: "2026-01-01T00:00:00.000Z"
      },
      {
        name: "Vorsaison",
        start: "2026-04-03",
        end: "2026-04-04",
        pricePerNight: 100,
        studioSurchargePerNight: 0,
        minNights: 1,
        createdAt: "2026-02-01T00:00:00.000Z"
      }
    ]);

    const season = seasonForDate("2026-04-03", seasons);
    assert.ok(season);
    assert.equal(season?.name, "Vorsaison");
    assert.equal(season?.pricePerNight, 100);
  });

  it("uses shorter range and later start date as tie-breakers when createdAt matches", () => {
    setStandardFallback(90);

    const sameCreatedAt = "2026-01-01T00:00:00.000Z";
    const shorterSeason = seasonForDate(
      "2026-04-03",
      buildAdminCatalog([
        {
          name: "Lang",
          start: "2026-04-01",
          end: "2026-04-10",
          pricePerNight: 200,
          studioSurchargePerNight: 0,
          minNights: 1,
          createdAt: sameCreatedAt
        },
        {
          name: "Kurz",
          start: "2026-04-03",
          end: "2026-04-04",
          pricePerNight: 100,
          studioSurchargePerNight: 0,
          minNights: 1,
          createdAt: sameCreatedAt
        }
      ])
    );

    assert.equal(shorterSeason?.name, "Kurz");

    const laterStartSeason = seasonForDate(
      "2026-04-03",
      buildAdminCatalog([
        {
          name: "Frueher",
          start: "2026-04-01",
          end: "2026-04-05",
          pricePerNight: 200,
          studioSurchargePerNight: 0,
          minNights: 1,
          createdAt: sameCreatedAt
        },
        {
          name: "Spaeter",
          start: "2026-04-03",
          end: "2026-04-07",
          pricePerNight: 120,
          studioSurchargePerNight: 0,
          minNights: 1,
          createdAt: sameCreatedAt
        }
      ])
    );

    assert.equal(laterStartSeason?.name, "Spaeter");
  });

  it("keeps the studio mandatory for 6 or 7 guests in pricing flows", () => {
    setStandardFallback(90, 25);

    const includesStudio = normalizeStudioSelection(6, false);
    const pricing = calculateSeasonalTotal({
      startDate: "2026-05-18",
      endDate: "2026-05-22",
      includesStudio,
      seasons: buildAdminCatalog([
        {
          name: "Vorsaison",
          start: "2026-05-18",
          end: "2026-05-21",
          pricePerNight: 100,
          studioSurchargePerNight: 50,
          minNights: 1,
          createdAt: "2026-01-01T00:00:00.000Z"
        }
      ])
    });

    assert.equal(includesStudio, true);
    assert.equal(pricing.studioNightlyTotal, 200);
    assert.equal(pricing.cleaningStudio, 30);
    assert.equal(pricing.total, 780);
  });

  it("returns nightly minNights so callers can enforce the strictest season rule", () => {
    setStandardFallback(90);

    const pricing = calculateSeasonalTotal({
      startDate: "2026-04-03",
      endDate: "2026-04-07",
      includesStudio: false,
      seasons: buildAdminCatalog([
        {
          name: "Vorsaison",
          start: "2026-04-03",
          end: "2026-04-04",
          pricePerNight: 100,
          studioSurchargePerNight: 0,
          minNights: 2,
          createdAt: "2026-01-01T00:00:00.000Z"
        },
        {
          name: "Hauptsaison",
          start: "2026-04-05",
          end: "2026-04-08",
          pricePerNight: 200,
          studioSurchargePerNight: 0,
          minNights: 5,
          createdAt: "2026-01-02T00:00:00.000Z"
        }
      ])
    });

    assert.equal(pricing.nights, 4);
    assert.equal(
      pricing.breakdown.reduce((max, item) => Math.max(max, item.minNights), 1),
      5
    );
  });
});
