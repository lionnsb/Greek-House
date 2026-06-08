import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  HOUSE_RULES_ASSET_PATH,
  HOUSE_RULES_ATTACHMENT_FILENAME,
  loadHouseRulesAttachment
} from "../src/lib/houseRulesAttachment.js";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("loadHouseRulesAttachment", () => {
  it("loads the PDF asset from the current origin", async () => {
    globalThis.fetch = (async (input: string | URL | Request) => {
      assert.equal(String(input), `https://mati.example${HOUSE_RULES_ASSET_PATH}`);

      return new Response(new Uint8Array([1, 2, 3, 4]), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf"
        }
      });
    }) as typeof fetch;

    const attachment = await loadHouseRulesAttachment("https://mati.example");

    assert.equal(attachment.filename, HOUSE_RULES_ATTACHMENT_FILENAME);
    assert.equal(attachment.contentType, "application/pdf");
    assert.deepEqual(Array.from(attachment.content), [1, 2, 3, 4]);
  });

  it("throws when the PDF asset cannot be loaded", async () => {
    globalThis.fetch = (async () => new Response(null, { status: 404 })) as typeof fetch;

    await assert.rejects(
      () => loadHouseRulesAttachment("https://mati.example"),
      /Hausregeln PDF konnte nicht geladen werden \(404\)/
    );
  });
});
