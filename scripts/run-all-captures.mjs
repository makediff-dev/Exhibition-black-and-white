import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screensPath = path.join(__dirname, "figma-screens.json");
const idsPath = path.join(__dirname, "capture-ids.json");
const progressPath = path.join(__dirname, "capture-progress.json");
const batchSize = Number(process.argv[2] ?? 5);
const startBatch = Number(process.argv[3] ?? 0);

const screens = JSON.parse(fs.readFileSync(screensPath, "utf8"));
const ids = JSON.parse(fs.readFileSync(idsPath, "utf8"));
const progress = fs.existsSync(progressPath)
  ? JSON.parse(fs.readFileSync(progressPath, "utf8"))
  : { completed: [] };

const merged = screens.map((screen, index) => ({
  ...screen,
  captureId: ids[index],
}));

for (let batchIndex = startBatch; ; batchIndex += 1) {
  const start = batchIndex * batchSize;
  const slice = merged.slice(start, start + batchSize);
  if (slice.length === 0) break;

  const pending = slice.filter((item) => !progress.completed.includes(item.captureId));
  if (pending.length === 0) {
    console.log(`Batch ${batchIndex}: already completed, skipping`);
    continue;
  }

  const batchFile = path.join(__dirname, `capture-batch-${batchIndex}.json`);
  fs.writeFileSync(batchFile, JSON.stringify(pending, null, 2));
  console.log(`\n=== Batch ${batchIndex} (${pending.length}/${slice.length} pending) ===`);

  const result = spawnSync("node", [path.join(__dirname, "capture-batch.mjs"), batchFile], {
    stdio: "inherit",
    env: process.env,
  });

  if (result.status !== 0) {
    console.error(`Batch ${batchIndex} failed`);
    process.exit(result.status ?? 1);
  }

  for (const item of pending) {
    if (!progress.completed.includes(item.captureId)) {
      progress.completed.push(item.captureId);
    }
  }
  fs.writeFileSync(progressPath, JSON.stringify(progress, null, 2));
}

console.log(`\nDone. ${progress.completed.length}/${merged.length} captures submitted.`);
