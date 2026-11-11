import { promises as fs } from "fs";
import path from "path";

const FILE = path.join(process.cwd(), ".data", "demo-db.json");
const TMP_PREFIX = path.join(process.cwd(), ".data", "demo-db-bench.tmp");

let queue = Promise.resolve();

async function simulateMutate(idx) {
  const t0 = Date.now();
  const run = queue.then(async () => {
    // 1. Read entire 7.4MB JSON file
    const raw = await fs.readFile(FILE, "utf8");
    // 2. Parse 7.4MB JSON
    const data = JSON.parse(raw);
    // 3. Mutate
    if (!data.activities) data.activities = [];
    data.activities.push({
      id: `bench-${Date.now()}-${idx}`,
      timestamp: new Date().toISOString()
    });
    // 4. Stringify entire 7.4MB JSON
    const serialized = JSON.stringify(data, null, 2);
    // 5. Write to temp file
    const tmp = `${TMP_PREFIX}.${process.pid}.${Date.now()}.${idx}.tmp`;
    await fs.writeFile(tmp, serialized);
    // 6. Clean up temp
    await fs.unlink(tmp);
    return Date.now() - t0;
  });
  queue = run.catch(() => undefined);
  return run;
}

async function run() {
  console.log("Starting JSON File Mutation Concurrency Benchmark (10 concurrent writes)...");
  const tStart = Date.now();
  const promises = Array.from({ length: 10 }, (_, i) => simulateMutate(i));
  const results = await Promise.all(promises);
  const totalMs = Date.now() - tStart;
  results.sort((a, b) => a - b);

  console.log(`\n================ WRITE CONCURRENCY METRICS ================`);
  console.log(`Total Wall-Clock Time: ${totalMs} ms`);
  console.log(`P1 (1st write latency): ${results[0]} ms`);
  console.log(`P5 (5th write latency): ${results[4]} ms`);
  console.log(`P10 (10th queued write latency): ${results[9]} ms`);
  console.log(`Queue wait degradation: ${(results[9] / results[0]).toFixed(1)}x slower for queued requests`);
  console.log(`All latencies (ms):`, results);
}

run().catch(console.error);
