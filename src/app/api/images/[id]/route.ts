import { NextResponse } from "next/server";
import { readSiteImageFile } from "@/lib/siteImageFilesStore";

function validFileId(id: string) {
  return Boolean(id) && id.length <= 180 && !id.includes("/");
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  if (!validFileId(params.id)) {
    return NextResponse.json({ message: "Ungültige Bild-ID." }, { status: 400 });
  }

  try {
    const file = await readSiteImageFile(params.id);
    if (!file) {
      return NextResponse.json(
        { message: "Bild wurde nicht gefunden." },
        { status: 404 }
      );
    }

    return new Response(file.bytes, {
      headers: {
        "Content-Type": file.contentType,
        "Content-Length": file.bytes.byteLength.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff"
      }
    });
  } catch {
    return NextResponse.json(
      { message: "Bild konnte nicht geladen werden." },
      { status: 500 }
    );
  }
}
