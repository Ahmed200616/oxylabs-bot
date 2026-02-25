const axios = require('axios');

// 1. THE ARSENAL (Dual Oxylabs Accounts)
const OXY_ACCOUNTS = [
  { user: 'ahmed_0C70p', pass: 'JloU~q_ju9y6A' },
  { user: 'sutton_yUoXb', pass: 'ONfRzE44wMMqHc~' }
];

const CONFIG = {
  OFFER_URL: 'https://top-deal.me/a/NkR2OHMOo5hRxK0?source=msft_native_ca',
  WEBHOOK: 'https://discord.com/api/webhooks/1466180407790670115/_B0VJ0h6v8rGGv0evpBQJUfchddXCJOWGyKQxffiUydN9gk-tBlQwskfVQhqspaTt-fg',
  TARGET: 5000, 
  REFERER: 'https://exclusivematch.netlify.app/',
  CONCURRENT_LIMIT: 5 
};

let currentAccIndex = 0;
let totalHits = 0;

async function fireAgent(id) {
  if (totalHits >= CONFIG.TARGET) return;
  
  const acc = OXY_ACCOUNTS[currentAccIndex % OXY_ACCOUNTS.length];
  const startTime = Date.now();

  // 🛡️ COMPLEX HUMAN BEHAVIOR GENERATOR
  // We build a unique set of actions for EVERY SINGLE HIT.
  const HUMAN_ACTIONS = [
    { type: 'wait', wait_time_s: Math.floor(Math.random() * 3) + 2 }, // Initial load pause
    { type: 'scroll', x: 0, y: Math.floor(Math.random() * 300) + 100 }, // Small first scroll
    { type: 'wait', wait_time_s: Math.floor(Math.random() * 4) + 2 },
    { type: 'scroll', x: 0, y: Math.floor(Math.random() * 600) + 400 }, // Deeper scroll
    { type: 'wait', wait_time_s: Math.floor(Math.random() * 6) + 4 }, // "Reading" pause
    { type: 'scroll', x: 0, y: Math.floor(Math.random() * 200) - 100 }, // 15% chance of slight scroll UP
    { type: 'wait', wait_time_s: 3 },
    { type: 'scroll', x: 0, y: 1200 }, // Scroll to the "action" area
    { type: 'wait', wait_time_s: Math.floor(Math.random() * 15) + 20 } // Final long dwell (20-35s)
  ];

  try {
    const auth = Buffer.from(`${acc.user}:${acc.pass}`).toString('base64');
    const payload = {
      source: 'universal',
      url: CONFIG.OFFER_URL,
      geo_location: 'Canada',
      render: 'html',
      browser_instructions: HUMAN_ACTIONS,
      custom_headers: { 
        'Referer': CONFIG.REFERER,
        // High-end randomized User Agents
        'User-Agent': Math.random() > 0.5 
          ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
          : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
      }
    };

    const response = await axios.post('https://realtime.oxylabs.io/v1/queries', payload, {
      headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
      timeout: 180000 
    });

    totalHits++;
    currentAccIndex++; 
    
    const duration = Math.round((Date.now() - startTime) / 1000);
    console.log(`[T${id}] ✅ HUMAN HIT | User: ${acc.user} | Dwell: ${duration}s | Total: ${totalHits}`);
    
    await reportToDiscord(id, duration, totalHits, acc.user);
    
  } catch (e) {
    console.log(`[T${id}] ❌ Error: ${e.response?.data?.detail || e.message}`);
    currentAccIndex++; 
    await new Promise(r => setTimeout(r, 10000));
  }
}

async function reportToDiscord(id, time, total, user) {
  await axios.post(CONFIG.WEBHOOK, {
    embeds: [{
      title: "🇨🇦 PREMIUM HUMAN DILUTION",
      color: 0x2ecc71,
      fields: [
        { name: "Agent", value: `Thread-${id}`, inline: true },
        { name: "ISP", value: "Rogers/Bell Residential", inline: true },
        { name: "Total Hits", value: `**${total}**`, inline: true }
      ],
      footer: { text: `Unique Path Generated | Time: ${time}s` },
      timestamp: new Date()
    }]
  }).catch(() => {});
}

async function worker(id) {
  // Stagger start times to prevent "clumped" traffic logs
  await new Promise(r => setTimeout(r, (id - 1) * 18000));
  
  while (totalHits < CONFIG.TARGET) {
    await fireAgent(id);
    // Real pacing: Some users click fast, some wait a long time
    const wait = Math.floor(Math.random() * 8000) + 12000; 
    await new Promise(r => setTimeout(r, wait));
  }
}

console.log("🔥 LAUNCHING PERFECT HUMAN ENGINE (OXYLABS)...");
for (let i = 1; i <= CONFIG.CONCURRENT_LIMIT; i++) worker(i);
