const axios = require('axios');

// 1. THE ARSENAL
const SCRAPER_KEYS = [
  '376b1c3a2fe7af5d164215d66f23fece', 'eeda703d8db5101fbd2f08521eb3c12d',
  '9407a016206a08aca87268fd96c0fb96', '0b4680e6450a9cbc9250064980d793e6', 
  '04d3e602359ed8890cfd01756ee15db7', '85704048ebc85dbc26837a0e283a1983', 
  '97c4b65aa361a9fe97f4f93b5dd2f562', '1fc4fb57c1d24f0babb805971f9dc70c', 
  '9948b9bb90b6bb8e2a6bc0e7202fe0e7', '8b9ca94621cdbd3fbaa983f16754eb09'
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
