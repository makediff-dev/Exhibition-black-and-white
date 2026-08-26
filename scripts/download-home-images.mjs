import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "../public/home");

const assets = [
  ["hero-banner.png", "https://www.figma.com/api/mcp/asset/18370e64-8f1e-45d4-850b-cd07af2e2f54.png"],
  ["categories/category-01.png", "https://www.figma.com/api/mcp/asset/71619f84-c678-4e6c-a383-34c5e3aa9a72.png"],
  ["categories/category-02.png", "https://www.figma.com/api/mcp/asset/436850c4-32e7-49c1-b57d-e67bc8e329ef.png"],
  ["categories/category-03.png", "https://www.figma.com/api/mcp/asset/d5b13281-a951-4e3e-85f5-c2f8e61cefdb.png"],
  ["categories/category-04.png", "https://www.figma.com/api/mcp/asset/56afa08d-f8e8-4f0a-bce9-2bc06ba65427.png"],
  ["categories/category-05.png", "https://www.figma.com/api/mcp/asset/fb5a96ce-d8ab-41ef-ac5b-ce2217216cf0.png"],
  ["categories/category-06.png", "https://www.figma.com/api/mcp/asset/149932ff-75aa-47aa-bca0-280637d226ca.png"],
  ["categories/category-07.png", "https://www.figma.com/api/mcp/asset/c81fb8fb-cc74-4f22-8591-ede093a2726b.png"],
  ["categories/category-08.png", "https://www.figma.com/api/mcp/asset/ff178556-ad28-4bad-98c4-239730dd8da0.png"],
  ["categories/category-09.png", "https://www.figma.com/api/mcp/asset/1b2ce9de-0c4f-4699-8dad-7fc1c14b05af.png"],
  ["categories/category-10.png", "https://www.figma.com/api/mcp/asset/a4ee4a94-ca9c-4af6-837a-1f601e5229c6.png"],
  ["categories/category-11.png", "https://www.figma.com/api/mcp/asset/ae1cf847-6a48-4095-be29-e0743add3257.png"],
  ["categories/category-12.png", "https://www.figma.com/api/mcp/asset/e26d6837-2237-43c1-ad83-d753f4e10210.png"],
  ["categories/category-more.png", "https://www.figma.com/api/mcp/asset/e26d6837-2237-43c1-ad83-d753f4e10210.png"],
  ["quick-actions/action-01.png", "https://www.figma.com/api/mcp/asset/e1103cfb-3464-4b0d-94e2-3e2c52fbe292.png"],
  ["quick-actions/action-02.png", "https://www.figma.com/api/mcp/asset/5a140ef0-4d20-4b35-8428-6fc0246d3ee1.png"],
  ["quick-actions/action-03.png", "https://www.figma.com/api/mcp/asset/656ec21c-d070-4d8d-8069-dd333f28cd05.png"],
  ["quick-actions/action-04.png", "https://www.figma.com/api/mcp/asset/31150773-950c-4e91-8e37-75c57c033ce6.png"],
  ["quick-actions/action-05.png", "https://www.figma.com/api/mcp/asset/a6c1606f-9146-4c48-8f01-b90d2900908f.png"],
  ["tiles/urgent-01.png", "https://www.figma.com/api/mcp/asset/ac76c163-7edd-4c05-ac6b-1cb0b25519a9.png"],
  ["tiles/urgent-02.png", "https://www.figma.com/api/mcp/asset/a6b52d15-7669-42ed-80fc-5cc812362b26.png"],
  ["tiles/urgent-03.png", "https://www.figma.com/api/mcp/asset/a6e6e125-cfd8-4cef-bedb-f74086f7aa48.png"],
  ["tiles/urgent-04.png", "https://www.figma.com/api/mcp/asset/fdd12013-8e16-4758-a392-baceae0dde32.png"],
  ["tiles/urgent-05.png", "https://www.figma.com/api/mcp/asset/88ef1fcc-fcca-4355-9f8d-041d5e50a32d.png"],
  ["tiles/construction-01.png", "https://www.figma.com/api/mcp/asset/1407a16f-85b0-4bf7-b0cc-073430027f05.png"],
  ["tiles/construction-02.png", "https://www.figma.com/api/mcp/asset/8f10c220-4950-4032-9f5b-95d94812f686.png"],
  ["tiles/construction-03.png", "https://www.figma.com/api/mcp/asset/6884f775-4444-4498-8cfa-75b323845f10.png"],
  ["tiles/construction-04.png", "https://www.figma.com/api/mcp/asset/659555a1-4742-4bdf-a1ea-35f840353b5b.png"],
  ["tiles/construction-05.png", "https://www.figma.com/api/mcp/asset/46cd7c70-039c-4d6a-8044-29c891c7673e.png"],
  ["tiles/event-01.png", "https://www.figma.com/api/mcp/asset/8f787954-4a19-49ad-9353-e44e0e0953ad.png"],
  ["tiles/event-02.png", "https://www.figma.com/api/mcp/asset/0a01245e-ab85-4350-9484-056c9d0fcde5.png"],
  ["tiles/event-03.png", "https://www.figma.com/api/mcp/asset/0c28e639-1d96-4db6-b391-8f36aefffae3.png"],
  ["tiles/event-04.png", "https://www.figma.com/api/mcp/asset/5f9cebcc-28c5-4482-9919-04fe938a6f06.png"],
  ["tiles/event-05.png", "https://www.figma.com/api/mcp/asset/8b370836-b955-43d0-b2e6-748dc95dbed7.png"],
  ["tiles/stand-01.png", "https://www.figma.com/api/mcp/asset/00d4233a-773b-4aca-98bb-47ecd38e4734.png"],
  ["tiles/stand-02.png", "https://www.figma.com/api/mcp/asset/ce9c0a7f-a060-409e-a8fe-bcb3008149f0.png"],
  ["tiles/stand-03.png", "https://www.figma.com/api/mcp/asset/dda36654-21fc-4f54-9320-064d83527af8.png"],
  ["tiles/stand-04.png", "https://www.figma.com/api/mcp/asset/ff0a40c0-3b94-4bdd-8d28-43e9d05be39f.png"],
  ["tiles/stand-05.png", "https://www.figma.com/api/mcp/asset/36f1b8b1-006a-48e5-aa42-c8e17191b3b7.png"],
  ["tiles/venue-01.png", "https://www.figma.com/api/mcp/asset/329b36bc-23a6-4759-bf9e-34b45f2ea0e4.png"],
  ["tiles/venue-02.png", "https://www.figma.com/api/mcp/asset/9f46a130-5e2b-4883-947f-de2479307b9c.png"],
  ["tiles/venue-03.png", "https://www.figma.com/api/mcp/asset/c141c630-4a11-41a9-b9de-ae39cc32c6f7.png"],
  ["tiles/venue-04.png", "https://www.figma.com/api/mcp/asset/c85cbe87-8b8f-40cd-8fe9-e9c9a6b90e07.png"],
  ["tiles/venue-05.png", "https://www.figma.com/api/mcp/asset/cd176190-51ca-4afd-ae3b-fe19c9c6c0b8.png"],
  ["audience/audience-01.png", "https://www.figma.com/api/mcp/asset/70bc1a65-fbc6-4c4e-96b9-d134bf966db3.png"],
  ["audience/audience-02.png", "https://www.figma.com/api/mcp/asset/52a6c278-7211-4494-b86f-cd3eeb9d3af8.png"],
  ["audience/audience-03.png", "https://www.figma.com/api/mcp/asset/eeaf3ac8-8a9b-4fb0-ab3b-c2cc6b14dc80.png"],
  ["audience/audience-04.png", "https://www.figma.com/api/mcp/asset/7c1d6c62-5678-4842-bc3b-dc2c1c16f24d.png"],
  ["how-it-works.png", "https://www.figma.com/api/mcp/asset/160c4605-df27-4723-bd32-54c4d8859998.png"],
  ["work-formats/format-01.png", "https://www.figma.com/api/mcp/asset/88cdfd1b-e133-40ae-bd6c-ca94b3128c93.png"],
  ["work-formats/format-02.png", "https://www.figma.com/api/mcp/asset/b80a7b17-8d0a-4197-bc06-d3e7a9cb1e08.png"],
  ["work-formats/format-03.png", "https://www.figma.com/api/mcp/asset/a3d5de2e-67f2-43e1-9ea5-c1f44bea8a37.png"],
  ["work-formats/format-04.png", "https://www.figma.com/api/mcp/asset/d82a92c5-5258-4bd3-8e63-2c13755a66ea.png"],
];

async function downloadFile(relativePath, url) {
  const targetPath = path.join(outDir, relativePath);
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${relativePath}: ${response.status}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(targetPath, buffer);
}

for (const [relativePath, url] of assets) {
  await downloadFile(relativePath, url);
  console.log(`Downloaded ${relativePath}`);
}

console.log(`Done. ${assets.length} files saved to public/home/`);
