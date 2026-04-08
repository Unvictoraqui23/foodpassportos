import http from 'http';

const REQUESTS = 100;
const CONCURRENCY = 10;
const URL = 'http://localhost:3001/api/state';

async function benchmark() {
  console.log(`Starting benchmark for ${URL}`);
  console.log(`Requests: ${REQUESTS}, Concurrency: ${CONCURRENCY}\n`);

  const start = Date.now();
  let completed = 0;
  let failed = 0;
  const latencies: number[] = [];

  const runRequest = () => {
    return new Promise<void>((resolve) => {
      const reqStart = Date.now();
      http.get(URL, (res) => {
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

  const batches = [];
  for (let i = 0; i < REQUESTS; i += CONCURRENCY) {
    const batch = Array(Math.min(CONCURRENCY, REQUESTS - i)).fill(null).map(() => runRequest());
    await Promise.all(batch);
  }

  const duration = (Date.now() - start) / 1000;
  const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
  const tps = REQUESTS / duration;

  console.log(`Benchmark results:`);
  console.log(`- Total time: ${duration.toFixed(2)}s`);
  console.log(`- Success: ${completed}`);
  console.log(`- Failed: ${failed}`);
  console.log(`- Avg Latency: ${avgLatency.toFixed(2)}ms`);
  console.log(`- Throughput: ${tps.toFixed(2)} req/s`);
}

benchmark();
