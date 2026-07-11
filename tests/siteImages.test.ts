import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_SITE_IMAGES,
  getSectionConfig,
  getSiteImagesForSection,
  isSiteImageSection,
  type SiteImage
} from "../src/lib/siteImages.js";

describe("siteImages", () => {
  it("recognizes only configured image sections", () => {
    assert.equal(isSiteImageSection("home-hero"), true);
    assert.equal(isSiteImageSection("studio-gallery"), true);
    assert.equal(isSiteImageSection("room-features"), true);
    assert.equal(isSiteImageSection("location-gallery"), true);
    assert.equal(isSiteImageSection("unknown"), false);
    assert.equal(isSiteImageSection(null), false);
  });

  it("contains a required default hero and seeded galleries", () => {
    const hero = getSiteImagesForSection(DEFAULT_SITE_IMAGES, "home-hero");
    const homeGallery = getSiteImagesForSection(
      DEFAULT_SITE_IMAGES,
      "home-gallery"
    );
    const studioGallery = getSiteImagesForSection(
      DEFAULT_SITE_IMAGES,
      "studio-gallery"
    );

    assert.equal(hero.length, 1);
    assert.ok(hero[0]?.src.startsWith("/img/"));
    assert.ok(homeGallery.length > 0);
    assert.equal(studioGallery.length, 4);
    assert.equal(getSectionConfig("home-hero")?.required, true);
    assert.equal(getSectionConfig("room-features")?.maxItems, 6);
    assert.equal(getSectionConfig("location-gallery")?.maxItems, 4);
  });

  it("sorts section images without mutating unrelated entries", () => {
    const images: SiteImage[] = [
      {
        ...DEFAULT_SITE_IMAGES[0],
        id: "later",
        section: "home-gallery",
        order: 2
      },
      {
        ...DEFAULT_SITE_IMAGES[0],
        id: "hero",
        section: "home-hero",
        order: 0
      },
      {
        ...DEFAULT_SITE_IMAGES[0],
        id: "earlier",
        section: "home-gallery",
        order: 0
      }
    ];

    assert.deepEqual(
      getSiteImagesForSection(images, "home-gallery").map((item) => item.id),
      ["earlier", "later"]
    );
    assert.equal(images[0]?.id, "later");
  });
});
