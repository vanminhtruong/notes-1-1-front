// Run only against a dedicated staging environment with test accounts.
import { readFile } from 'node:fs/promises';
import { io } from 'socket.io-client';

if (process.argv.includes('--help')) {
  console.log('CHAT_LOAD_URL=http://localhost:3000 CHAT_LOAD_TOKENS_FILE=<JSON array of JWTs> CHAT_LOAD_CLIENTS=50 CHAT_LOAD_SECONDS=60 CHAT_LOAD_RAMP_MS=200 node scripts/chat-load.mjs');
  console.log('Read-only workload: socket connection + periodic GET /api/v1/chat/unread-count. No messages are sent. Use distinct staging accounts for realistic results.');
  process.exit(0);
}
const number = (name, fallback, max) => {
  const value = Number(process.env[name] || fallback);
  if (!Number.isInteger(value) || value < 1 || value > max) throw new Error(`Invalid ${name}`);
  return value;
};
const origin = process.env.CHAT_LOAD_URL;
if (!origin || !process.env.CHAT_LOAD_TOKENS_FILE) throw new Error('Set CHAT_LOAD_URL and CHAT_LOAD_TOKENS_FILE; use --help.');
const tokens = JSON.parse(await readFile(process.env.CHAT_LOAD_TOKENS_FILE, 'utf8'));
if (!Array.isArray(tokens) || !tokens.length || tokens.some(t => typeof t !== 'string' || !t)) throw new Error('Token file must contain a nonempty JSON string array.');
const clients = number('CHAT_LOAD_CLIENTS', 50, 10000);
const duration = number('CHAT_LOAD_SECONDS', 60, 900) * 1000;
const ramp = number('CHAT_LOAD_RAMP_MS', 200, 60000);
const sockets = [], timers = new Set(), work = new Set(), latency = [];
const schedule = (fn, ms) => {
  const timer = setTimeout(() => { timers.delete(timer); void fn(); }, ms);
  timers.add(timer);
};
const stats = { connected: 0, peakConnected: 0, connectErrors: 0, requests: 0, errors: 0, busy: 0 };
const start = Date.now();
let stopped = false;
const request = async token => {
  const at = performance.now();
  try {
    const res = await fetch(`${origin.replace(/\/$/, '')}/api/v1/chat/unread-count`, {
      headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(15000),
    });
    await res.arrayBuffer();
    stats.requests++;
    if (res.status === 503 || res.status === 429) stats.busy++;
    else if (!res.ok) stats.errors++;
    if (latency.length < 10000) latency.push(performance.now() - at);
  } catch { stats.errors++; }
};
function stop() {
  if (stopped) return;
  stopped = true;
  timers.forEach(clearTimeout);
  sockets.forEach(socket => socket.disconnect());
}
process.once('SIGINT', stop);
const deadline = setTimeout(stop, duration);
try {
  for (let i = 0; i < clients && !stopped; i++) {
    const token = tokens[i % tokens.length];
    const socket = io(origin, { auth: { token }, transports: ['websocket'], reconnection: false, timeout: 15000 });
    sockets.push(socket);
    socket.on('connect', () => { stats.connected++; stats.peakConnected = Math.max(stats.peakConnected, stats.connected); });
    socket.on('disconnect', () => { stats.connected = Math.max(0, stats.connected - 1); });
    socket.on('connect_error', () => { stats.connectErrors++; });
    const poll = async () => {
      if (stopped) return;
      const task = request(token); work.add(task);
      await task; work.delete(task);
      if (!stopped) schedule(poll, 5000 + Math.random() * 5000);
    };
    schedule(poll, Math.random() * 5000);
    await new Promise(resolve => setTimeout(resolve, ramp));
  }
  while (!stopped) await new Promise(resolve => setTimeout(resolve, 250));
} finally {
  stop(); clearTimeout(deadline); await Promise.allSettled([...work]);
  latency.sort((a, b) => a - b);
  const percentile = p => latency[Math.min(latency.length - 1, Math.floor(latency.length * p))] ?? null;
  console.log(JSON.stringify({ ...stats, elapsedSeconds: (Date.now() - start) / 1000,
    createdClients: sockets.length, distinctTestAccounts: tokens.length,
    p50ms: percentile(0.5), p95ms: percentile(0.95), latencySampleCount: latency.length }, null, 2));
}
