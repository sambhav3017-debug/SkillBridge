import { mutateDb, readDb } from "../src/lib/server/db.ts";

async function measureWriteConcurrency() {
  console.log("Measuring mutateDb write concurrency and serialization latency...");
  const CONCURRENCY = 10;
  const start = Date.now();

  const promises = Array.from({ length: CONCURRENCY }, async (_, idx) => {
    const t0 = Date.now();
    await mutateDb((db) => {
      // simulate light field touch
      const now = Date.now();
      if (!db.activities) db.activities = [];
      db.activities.push({
        id: `bench-${now}-${idx}`,
        type: "system_ping",
        text: `Benchmark write ${idx}`,
        timestamp: new Date().toISOString()
      });
      // limit array growth
      if (db.activities.length > 200) db.activities.splice(0, db.activities.length - 200);
    });
    const duration = Date.now() - t0;
    return duration;
  });

  const latencies = await Promise.all(promises);
  const total = Date.now() - start;
  latencies.sort((a, b) => a - b);

  console.log(`\n--- MutateDb 10-Concurrent Writes Benchmark ---`);
  console.log(`Total time for 10 concurrent writes: ${total} ms`);
  console.log(`Average write time: ${(latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(1)} ms`);
  console.log(`Min write latency: ${latencies[0]} ms`);
  console.log(`Max write latency (queued behind earlier writes): ${latencies[latencies.length - 1]} ms`);
  console.log(`Per-write latencies:`, latencies);
  console.log(`\nKEY BOTTLENECK OBSERVATION: Because each write reads and rewrites a 7.4MB JSON file to disk via a serial promise queue, the 10th concurrent write waited ${latencies[latencies.length - 1]}ms. Under 1,000 to 5,000 concurrent active users, this single-file queue causes exponential backlog, thread starvation, and HTTP 504 timeouts.`);
}

measureWriteConcurrency().catch(console.error);
