export const HOUSE_RULES_ATTACHMENT_FILENAME = "mati-tis-thalassas-house-rules.pdf";
export const HOUSE_RULES_ASSET_PATH = `/docs/${HOUSE_RULES_ATTACHMENT_FILENAME}`;

export type HouseRulesAttachment = {
  filename: string;
  content: Uint8Array;
  contentType: "application/pdf";
};

export async function loadHouseRulesAttachment(origin: string): Promise<HouseRulesAttachment> {
  const assetUrl = new URL(HOUSE_RULES_ASSET_PATH, origin);
  const response = await fetch(assetUrl.toString());

  if (!response.ok) {
    throw new Error(`Hausregeln PDF konnte nicht geladen werden (${response.status})`);
  }

  return {
    filename: HOUSE_RULES_ATTACHMENT_FILENAME,
    content: new Uint8Array(await response.arrayBuffer()),
    contentType: "application/pdf"
  };
}
