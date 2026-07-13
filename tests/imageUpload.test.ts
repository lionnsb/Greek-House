import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildCompressionAttempts,
  calculateImageDimensions,
  parseImageAdminResponse
} from "../src/lib/adminImageUpload.js";
import {
  isAcceptedImageType,
  MAX_IMAGE_UPLOAD_SIZE,
  TARGET_IMAGE_UPLOAD_SIZE
} from "../src/lib/imageUploadLimits.js";

describe("image upload limits", () => {
  it("keeps a safe gap between the target and API limit", () => {
    assert.ok(TARGET_IMAGE_UPLOAD_SIZE < MAX_IMAGE_UPLOAD_SIZE);
    assert.equal(isAcceptedImageType("image/jpeg"), true);
    assert.equal(isAcceptedImageType("image/png"), true);
    assert.equal(isAcceptedImageType("image/webp"), true);
    assert.equal(isAcceptedImageType("image/heic"), false);
  });
});

describe("calculateImageDimensions", () => {
  it("fits landscape and portrait images into the maximum edge", () => {
    assert.deepEqual(calculateImageDimensions(4000, 3000), {
      width: 2400,
      height: 1800
    });
    assert.deepEqual(calculateImageDimensions(3000, 4000), {
      width: 1800,
      height: 2400
    });
  });

  it("does not enlarge small images", () => {
    assert.deepEqual(calculateImageDimensions(640, 480), {
      width: 640,
      height: 480
    });
  });

  it("rejects invalid image dimensions", () => {
    assert.throws(() => calculateImageDimensions(0, 100), /ungültige/);
    assert.throws(() => calculateImageDimensions(100, Number.NaN), /ungültige/);
  });
});

describe("buildCompressionAttempts", () => {
  it("tries quality levels before reducing dimensions", () => {
    const attempts = buildCompressionAttempts(4000, 3000);
    assert.deepEqual(attempts.slice(0, 4), [
      { width: 2400, height: 1800, quality: 0.84 },
      { width: 2400, height: 1800, quality: 0.74 },
      { width: 2400, height: 1800, quality: 0.64 },
      { width: 1920, height: 1440, quality: 0.84 }
    ]);

    const last = attempts.at(-1);
    assert.equal(Math.max(last?.width ?? 0, last?.height ?? 0), 800);
  });

  it("uses only quality attempts for images below the minimum edge", () => {
    assert.deepEqual(buildCompressionAttempts(640, 480), [
      { width: 640, height: 480, quality: 0.84 },
      { width: 640, height: 480, quality: 0.74 },
      { width: 640, height: 480, quality: 0.64 }
    ]);
  });
});

describe("parseImageAdminResponse", () => {
  it("parses successful JSON responses", async () => {
    const data = await parseImageAdminResponse(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      })
    );
    assert.deepEqual(data, { ok: true });
  });

  it("keeps safe JSON validation messages for client errors", async () => {
    const data = await parseImageAdminResponse(
      new Response(JSON.stringify({ message: "Unbekannter Bildbereich." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      })
    );
    assert.equal(data.message, "Unbekannter Bildbereich.");
  });

  it("translates a plain Vercel 413 response", async () => {
    const data = await parseImageAdminResponse(
      new Response("FUNCTION_PAYLOAD_TOO_LARGE", { status: 413 })
    );
    assert.match(data.message ?? "", /noch zu groß/);
  });

  it("hides HTML and JSON details from server errors", async () => {
    const htmlData = await parseImageAdminResponse(
      new Response("<html>Internal error</html>", { status: 500 })
    );
    const jsonData = await parseImageAdminResponse(
      new Response(JSON.stringify({ message: "Firebase internal detail" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      })
    );

    assert.equal(htmlData.message, jsonData.message);
    assert.match(htmlData.message ?? "", /Server/);
    assert.doesNotMatch(jsonData.message ?? "", /Firebase/);
  });

  it("rejects empty successful responses as invalid", async () => {
    const data = await parseImageAdminResponse(
      new Response(null, { status: 200 })
    );
    assert.match(data.message ?? "", /ungültige Antwort/);
  });

  it("replaces authentication details with a login message", async () => {
    const data = await parseImageAdminResponse(
      new Response(JSON.stringify({ message: "Missing auth token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      })
    );
    assert.match(data.message ?? "", /erneut einloggen/);
  });
});
