// Pages Function: /api/speedtest
// Tests CF CDN edge IPs for latency + bandwidth from Cloudflare edge

const CDN_RANGES = [
  [104,16,0,0, 104,31,255,255],
  [162,158,0,0, 162,159,255,255],
  [172,64,0,0, 172,71,255,255],
  [108,162,192,0, 108,162,255,255],
  [141,101,0,0, 141,101,255,255],
  [188,114,96,0, 188,114,111,255],
  [190,93,240,0, 190,93,255,255],
];

const WORKER_HOST = 'worker-mute-feather-ec8c.xufxyf.workers.dev';

let seed = Date.now();
function rand() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }
function randInt(min, max) { return Math.floor(rand() * (max - min + 1)) + min; }
function ipInt(a,b,c,d) { return (a<<24)|(b<<16)|(c<<8)|d; }
function intIp(n) { return `${n>>>24}.${(n>>16)&255}.${(n>>8)&255}.${n&255}`; }

function generateIPs(count) {
  const ips = new Set();
  for (const [a1,b1,c1,d1,a2,b2,c2,d2] of CDN_RANGES) {
    const start = ipInt(a1,b1,c1,d1), end = ipInt(a2,b2,c2,d2);
    for (let i = 0; i < Math.max(3, Math.min(12, Math.floor((end-start)/300000))); i++) {
      ips.add(intIp(randInt(start, end)));
    }
  }
  return [...ips].slice(0, count);
}

function countryLabel(latMs) {
  if (latMs < 80) return 'JP';
  if (latMs < 120) return 'SG';
  if (latMs < 160) return 'US-W';
  if (latMs < 200) return 'US-C';
  if (latMs < 250) return 'EU';
  return 'US-E';
}

const COUNTRY_NAMES = { 'JP':'日本','SG':'新加坡','US-W':'美西','US-C':'美中','EU':'欧洲','US-E':'美东' };

function timeout(ms) { return new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)); }

async function testIPLatency(ip) {
  try {
    const start = Date.now();
    await Promise.race([
      fetch(`https://${ip}/cdn-cgi/trace`, { headers: { 'Host': WORKER_HOST } }),
      timeout(3000)
    ]);
    return { ip, latency_ms: Date.now() - start };
  } catch { return null; }
}

async function testIPBandwidth(ip) {
  try {
    const start = Date.now();
    const resp = await Promise.race([
      fetch(`https://${ip}/cdn-cgi/trace`, { headers: { 'Host': WORKER_HOST } }),
      timeout(5000)
    ]);
    const ttfb = Date.now() - start;
    if (!resp.ok) return { ip, latency_ms: ttfb, speed_kbps: 0 };
    
    const reader = resp.body.getReader();
    let bytes = 0;
    const dlStart = Date.now();
    try {
      while (Date.now() - dlStart < 1500) {
        const { done, value } = await Promise.race([reader.read(), timeout(2000)]);
        if (done) break;
        bytes += value.length;
      }
    } catch {}
    const dlSec = Math.max(0.001, (Date.now() - dlStart) / 1000);
    return { ip, latency_ms: ttfb, speed_kbps: Math.round((bytes*8) / dlSec / 1000) };
  } catch { return null; }
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const countries = (url.searchParams.get('countries') || 'JP,SG,US-W,US-C,EU,US-E').split(',');
  const minSpeed = parseInt(url.searchParams.get('minSpeed') || '0');
  const limit = parseInt(url.searchParams.get('limit') || '15');

  // Phase 1: latency test
  const ips = generateIPs(35);
  const latResults = (await Promise.allSettled(ips.map(testIPLatency)))
    .filter(r => r.status==='fulfilled' && r.value)
    .map(r => ({...r.value, country: countryLabel(r.value.latency_ms)}))
    .filter(r => countries.includes(r.country))
    .sort((a,b) => a.latency_ms - b.latency_ms);

  // Phase 2: bandwidth on top 8
  const top = latResults.slice(0, 8);
  const bwResults = (await Promise.allSettled(top.map(r => testIPBandwidth(r.ip))))
    .filter(r => r.status==='fulfilled' && r.value)
    .map(r => r.value);
  const bwMap = {};
  bwResults.forEach(r => { bwMap[r.ip] = r.speed_kbps; });

  // Merge
  const nodes = latResults.slice(0, limit).map(r => ({
    ip: r.ip,
    country: r.country,
    country_name: COUNTRY_NAMES[r.country] || r.country,
    latency_ms: r.latency_ms,
    speed_kbps: bwMap[r.ip] || 0
  })).filter(r => r.speed_kbps >= minSpeed);

  return new Response(JSON.stringify({ success: true, timestamp: Date.now(), count: nodes.length, nodes }), {
    headers: { 'Content-Type':'application/json;charset=utf-8', 'Access-Control-Allow-Origin':'*', 'Cache-Control':'no-store' }
  });
}
