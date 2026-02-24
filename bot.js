const axios = require('axios');

// 1. THE ARSENAL
const SCRAPER_KEYS = [
  '683f171c697214cb8fa76565da208d14', '44804dd59c13c4d8158bffc014e0df5a',
  '13a92df9482d9d9c9a130b2554f5fae6', '297f6f7dd006cdb24c411f58d0a37aa4', 
  'fe621af9ce5ea3197a7b5271a8f81668', '794f49e01fbef3d6d5ae73c772f32ca7', 
  'd76a59d62a01e147b1c984076afd2e8f', 'efcbd5cb97d86e13e4b0e81da5e86a81', 
  '0869f647b5c7632ba464bbe49dcc5050', '48a29e251f575c83051d9dde5db95b80'
];

const CONFIG = {
  OFFER_URL: 'https://top-deal.me/a/NkR2OHMOo5hRxK0?source=msft_native_ca',
  WEBHOOK: 'https://discord.com/api/webhooks/1466180407790670115/_B0VJ0h6v8rGGv0evpBQJUfchddXCJOWGyKQxffiUydN9gk-tBlQwskfVQhqspaTt-fg',
  TARGET: 5000, 
  REFERER: 'https://exclusivematch.netlify.app/',
  CONCURRENT_LIMIT: 5 // 🛡️ MATCHES SCRAPERAPI FREE/BASIC THREAD LIMIT
};

let currentKeyIndex = 0;
let totalHits = 0;

// 🛡️ THE HUMAN SHOPPER JS (Scrolling & Jittering)
const VANGUARD_JS = `
  (async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const start = Date.now();
    
    // Stealth: Hide automation signatures
    Object.defineProperty(navigator, 'webdriver', {get: () => false});

    await sleep(Math.floor(Math.random() * 3000) + 2000); 

    const humanScroll = async () => {
      // 8 to 12 random scroll "events"
      const events = Math.floor(Math.random() * 5) + 8; 
      
      for(let i=0; i < events; i++) {
        // Mostly scroll down (positive), 15% chance to scroll up (negative) to look real
        const isUp = Math.random() < 0.15;
        const distance = isUp ? -(Math.floor(Math.random() * 150)) : (Math.floor(Math.random() * 450) + 50);
        
        window.scrollBy({ 
          top: distance, 
          behavior: 'smooth' 
        });

        // "Jitter" - small micro-scroll to simulate reading
        await sleep(500);
        window.scrollBy({ top: (Math.random() * 10) - 5, behavior: 'smooth' });

        // Random pause to "read" the content (2-5 seconds)
        await sleep(Math.floor(Math.random() * 3000) + 2000);
      }
    };

    await humanScroll();

    // Ensure total time on page is high enough for 250/hr math but still "dwells"
    const targetDwell = 35000; 
    const elapsed = Date.now() - start;
    if (targetDwell > elapsed) await sleep(targetDwell - elapsed);
  })();
`;

async function fireAgent(id) {
  if (totalHits >= CONFIG.TARGET) return;
  
  const key = SCRAPER_KEYS[currentKeyIndex];
  const startTime = Date.now();

  try {
    await axios.get('https://api.scraperapi.com/', {
      params: {
        api_key: key,
        url: CONFIG.OFFER_URL,
        render: 'true',
        country_code: 'ca', 
        premium: 'true',
        device_type: Math.random() > 0.4 ? 'mobile' : 'desktop',
        js_instructions: VANGUARD_JS,
        session_number: Math.floor(Math.random() * 10000000)
      },
      headers: { 'Referer': CONFIG.REFERER },
      timeout: 160000 
    });

    totalHits++;
    const duration = Math.round((Date.now() - startTime) / 1000);
    console.log(`[T${id}] HIT SUCCESS | Total: ${totalHits} | Time: ${duration}s`);
    await reportToDiscord(id, duration, totalHits);
    
  } catch (e) {
    const status = e.response?.status;
    console.log(`[T${id}] Error ${status || 'Network'}: Rotating Key...`);
    
    // Rotate keys immediately on limits or blocks
    if (status === 401 || status === 403 || status === 429) {
      currentKeyIndex = (currentKeyIndex + 1) % SCRAPER_KEYS.length;
    }
    await new Promise(r => setTimeout(r, 10000));
  }
}

async function reportToDiscord(id, time, total) {
  const payload = {
    embeds: [{
      title: "🚀 250/HR ENGINE: ACTIVE HIT",
      color: 0x00ff00, 
      fields: [
        { name: "Agent", value: `Thread-${id}`, inline: true },
        { name: "Progress", value: `**${total}**`, inline: true }
      ],
      footer: { text: "Behavior: Smooth Scroll & Micro-Jittering" },
      timestamp: new Date()
    }]
  };
  await axios.post(CONFIG.WEBHOOK, payload).catch(() => {});
}

async function worker(id) {
  // Stagger launch by 12s per thread
  await new Promise(r => setTimeout(r, (id - 1) * 12000));
  
  while (totalHits < CONFIG.TARGET) {
    await fireAgent(id);
    // Pacing: 12-15s chill time keeps us at the ~250 hits per hour mark across 5 threads
    const chill = Math.floor(Math.random() * 3000) + 12000; 
    await new Promise(r => setTimeout(r, chill));
  }
}

console.log("🔥 LAUNCHING HIGH-VELOCITY HUMAN-BEHAVIOR ENGINE...");
for (let i = 1; i <= CONFIG.CONCURRENT_LIMIT; i++) {
  worker(i);
}
