const axios = require('axios');

// Oxylabs accounts and credentials
const OXY_ACCOUNTS = [
  { user: 'account1', pass: 'pass1' },
  { user: 'account2', pass: 'pass2' },
  { user: 'account3', pass: 'pass3' }
];

const OFFER_URL = 'https://yourwebsite.com';
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/your_webhook_url';

const MAX_HITS_PER_ACC = 700;
let currentAccIndex = 0;
let currentAccHits = 0;

// List of randomized user agents for variety
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)...',
  'Mozilla/5.0 (Linux; Android 10; SM-G975F)...',
  // Add 10-20 realistic UAs here
];

// Stealthy JS snippet (encoded in base64) that simulates:
// random scrolls up/down, delays, clicks with waits
const STEALTH_JS = Buffer.from(`
  (async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const start = Date.now();

    // Random initial wait (5-8s)
    await sleep(Math.floor(Math.random() * 3000) + 5000);

    // Scroll down with smooth animation
    window.scrollBy({top: Math.floor(Math.random() * 600) + 800, behavior: 'smooth'});
    await sleep(15000);

    // Scroll back up slowly
    window.scrollBy({top: -Math.floor(Math.random() * 300) - 200, behavior: 'smooth'});
    await sleep(10000);

    // Simulate clicking a visible button or element randomly
    const buttons = document.querySelectorAll('button, a');
    if(buttons.length > 0) {
      buttons[Math.floor(Math.random() * buttons.length)].click();
      await sleep(5000);
    }

    document.title = "OXY_COMPLETE:" + ((Date.now() - start) / 1000) + "s";
  })();
`).toString('base64');

async function sendOxylabsHit(threadId) {
  if (currentAccIndex >= OXY_ACCOUNTS.length) {
    console.log("🏁 All hits done.");
    process.exit();
  }

  const auth = OXY_ACCOUNTS[currentAccIndex];

  // Random user agent per request
  const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

  const payload = {
    source: 'universal',
    url: OFFER_URL,
    geo_location: 'United States',
    render: 'html',
    js_snippet: STEALTH_JS,
    browser_instructions: [
      { command: 'wait', argument: 35000 }
    ],
    headers: {
      'User-Agent': userAgent
    }
  };

  try {
    const res = await axios.post('https://realtime.oxylabs.io/v1/queries', payload, {
      auth: { username: auth.user, password: auth.pass },
      timeout: 120000
    });

    currentAccHits++;
    const success = JSON.stringify(res.data).includes("OXY_COMPLETE");

    await sendDiscordReport(threadId, auth.user, success, currentAccHits);
    console.log(`[T${threadId}] ${auth.user} | Hit ${currentAccHits}/${MAX_HITS_PER_ACC} | UA: ${userAgent}`);

    if (currentAccHits >= MAX_HITS_PER_ACC) {
      currentAccIndex++;
      currentAccHits = 0;
      console.log(`⚠️ Switching account to index ${currentAccIndex}`);
    }
  } catch (e) {
    console.log(`[T${threadId}] Oxylabs API error: ${e.message}`);
  }
}

async function sendDiscordReport(threadId, user, success, count) {
  const payload = {
    embeds: [{
      title: success ? "🎯 Bot hit success" : "⚠️ Bot hit fail",
      color: success ? 0x00ff00 : 0xffa500,
      fields: [
        { name: "Account", value: user, inline: true },
        { name: "Hits done", value: `${count} / ${MAX_HITS_PER_ACC}`, inline: true },
        { name: "Thread", value: `${threadId}`, inline: true }
      ],
      timestamp: new Date()
    }]
  };

  await axios.post(DISCORD_WEBHOOK_URL, payload).catch(() => {});
}

async function worker(id) {
  console.log(`Agent ${id} started.`);

  while (currentAccIndex < OXY_ACCOUNTS.length) {
    await sendOxylabsHit(id);

    // Random wait 2-3 minutes (to mimic natural traffic pacing)
    const waitTime = Math.floor(Math.random() * 60000) + 120000;
    await new Promise(r => setTimeout(r, waitTime));
  }
}

console.log("🚀 Starting Oxylabs advanced bot...");

for (let i = 1; i <= 4; i++) { // 4 concurrent workers to spread hits over time
  worker(i);
}
