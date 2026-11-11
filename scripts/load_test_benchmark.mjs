import http from "http";

const BASE_URL = "http://localhost:3000";

async function measureEndpoint(name, path, concurrency, totalRequests) {
  console.log(`\n--- Benchmarking ${name} (${path}) with Concurrency: ${concurrency}, Total: ${totalRequests} ---`);
  
  const latencies = [];
  let completed = 0;
  let errors = 0;
  const startTime = Date.now();

  async function worker() {
    while (completed < totalRequests) {
      const currentReq = completed++;
      const reqStart = process.hrtime.bigint();
      try {
        const res = await fetch(`${BASE_URL}${path}`);
        await res.text();
        const reqEnd = process.hrtime.bigint();
        const latencyMs = Number(reqEnd - reqStart) / 1e6;
        latencies.push(latencyMs);
        if (res.status >= 500) {
          errors++;
        }
      } catch (err) {
        errors++;
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
  const totalDurationSec = (Date.now() - startTime) / 1000;
  const rps = (latencies.length / totalDurationSec).toFixed(1);

  latencies.sort((a, b) => a - b);
  const avg = (latencies.reduce((sum, v) => sum + v, 0) / latencies.length).toFixed(2);
  const min = latencies[0]?.toFixed(2) || "0";
  const max = latencies[latencies.length - 1]?.toFixed(2) || "0";
  const p50 = latencies[Math.floor(latencies.length * 0.50)]?.toFixed(2) || "0";
  const p95 = latencies[Math.floor(latencies.length * 0.95)]?.toFixed(2) || "0";
  const p99 = latencies[Math.floor(latencies.length * 0.99)]?.toFixed(2) || "0";

  console.log(`Results for ${name}:`);
  console.log(`  Requests Completed: ${latencies.length} (Errors: ${errors})`);
  console.log(`  Total Duration:     ${totalDurationSec.toFixed(2)}s`);
  console.log(`  Throughput:         ${rps} req/sec`);
  console.log(`  Latency (Avg):      ${avg} ms`);
  console.log(`  Latency (Min/Max):  ${min} ms / ${max} ms`);
  console.log(`  Latency (p50):      ${p50} ms`);
  console.log(`  Latency (p95):      ${p95} ms`);
  console.log(`  Latency (p99):      ${p99} ms`);

  return { name, path, concurrency, totalRequests, rps, avg, min, max, p50, p95, p99, errors };
}

async function runAllBenchmarks() {
  console.log("Starting SkillBridge Local Architecture Load & Benchmark Test...");
  const results = [];
  
  // 1. Health endpoint (lightweight JSON read)
  results.push(await measureEndpoint("Health Check API", "/api/health", 10, 100));
  results.push(await measureEndpoint("Health Check API (Moderate Concurrency)", "/api/health", 30, 200));

  // 2. Landing page (SSR + HTML rendering)
  results.push(await measureEndpoint("Landing Page SSR", "/", 10, 50));
  results.push(await measureEndpoint("Landing Page SSR (Moderate Concurrency)", "/", 25, 100));

  // 3. Opportunities API (Reads db.jobs and filters)
  results.push(await measureEndpoint("Student Opportunities API", "/api/student/opportunities", 15, 100));

  console.log("\n================ SUMMARY BENCHMARK TABLE ================");
  console.table(results.map(r => ({
    Endpoint: r.name,
    Concurrency: r.concurrency,
    "Total Reqs": r.totalRequests,
    "Req/Sec": r.rps,
    "p50 (ms)": r.p50,
    "p95 (ms)": r.p95,
    "p99 (ms)": r.p99,
    Errors: r.errors
  })));

  return results;
}

runAllBenchmarks().catch(console.error);
