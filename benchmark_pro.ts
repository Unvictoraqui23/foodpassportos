import http from 'http';

const REQUESTS = 500;
const CONCURRENCY = 20;
const ENDPOINTS = [
  { name: 'PING (Health)', path: '/api/ping' },
  { name: 'GET STATE (Full)', path: '/api/state' },
];

async function runBenchmark(name: string, path: string) {
  const url = `http://localhost:3001${path}`;
  console.log(`\n🚀 Testing ${name} [${url}]`);
  console.log(`   Config: ${REQUESTS} requests, ${CONCURRENCY} concurrent\n`);

  const start = Date.now();
  let completed = 0;
  let failed = 0;
  const latencies: number[] = [];

  const runRequest = () => {
    return new Promise<void>((resolve) => {
      const reqStart = Date.now();
      http.get(url, (res) => {
        res.on('data', () => {});
        res.on('end', () => {
          latencies.push(Date.now() - reqStart);
          completed++;
          resolve();
        });
      }).on('error', (err) => {
        failed++;
        resolve();
      });
    });
  };

  for (let i = 0; i < REQUESTS; i += CONCURRENCY) {
    const batch = Array(Math.min(CONCURRENCY, REQUESTS - i)).fill(null).map(() => runRequest());
    await Promise.all(batch);
  }

  const duration = (Date.now() - start) / 1000;
  latencies.sort((a, b) => a - b);
  
  const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length || 0;
  const p95 = latencies[Math.floor(latencies.length * 0.95)] || 0;
  const p99 = latencies[Math.floor(latencies.length * 0.99)] || 0;
  const tps = REQUESTS / duration;

  console.log(`📊 Results for ${name}:`);
  console.log(`   - Requests/sec: ${tps.toFixed(2)}`);
  console.log(`   - Avg Latency:  ${avgLatency.toFixed(2)}ms`);
  console.log(`   - P95 Latency:  ${p95.toFixed(2)}ms`);
  console.log(`   - P99 Latency:  ${p99.toFixed(2)}ms`);
  console.log(`   - Success Rate: ${((completed / REQUESTS) * 100).toFixed(2)}%`);
  
  return { name, tps, avgLatency, p95, p99, successRate: (completed / REQUESTS) * 100 };
}

async function main() {
  const results = [];
  for (const endpoint of ENDPOINTS) {
    results.push(await runBenchmark(endpoint.name, endpoint.path));
  }
  
  console.log('\n--- SUMMARY ---');
  console.table(results);
}

main().catch(console.error);
