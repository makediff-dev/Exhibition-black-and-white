import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screens = JSON.parse(fs.readFileSync(path.join(__dirname, "figma-screens.json"), "utf8"));
const batchSize = Number(process.argv[2] ?? 10);
const batchIndex = Number(process.argv[3] ?? 0);
const start = batchIndex * batchSize;
const slice = screens.slice(start, start + batchSize);

if (slice.length === 0) {
  console.error(`Empty batch ${batchIndex} (start=${start})`);
  process.exit(1);
}

const outPath = path.join(__dirname, `capture-batch-${batchIndex}.json`);
fs.writeFileSync(outPath, JSON.stringify(slice, null, 2));
console.log(`Wrote ${slice.length} screens to ${outPath}`);
console.log(`Batch ${batchIndex}: screens ${start + 1}-${start + slice.length} of ${screens.length}`);
