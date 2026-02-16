const axios = require('axios');

// 1. THE ARSENAL
const SCRAPER_KEYS = [
  '9620e8216b657b0a9b8c045b3c18edc3', 'e177e04336d6678248b6a13a85cca42d',
  '925412c2ae9e2b33eb1488528c80fed0', '92cb080cdfcaf392583299452b21862e', 
  '851a15cb631dc39e04a6f71ee748b53a', '5ca5b8c85be0a1928737e29d3789e79d', 
  '76a2b925c87d925efc3c14b4768b3549', 'cce337ac9dbaee76fdab0e12eecfe2ea', 
  'a86b99a3f7f663c904e6dde1ca7b404b', '80d0f97a77d79e964c198251c0ef59ef'
];

const CONFIG = {
  OFFER_URL: 'https://top-deal.me/a/NkR2OHMOo5hRxK0?source=msft_native_ca',
  WEBHOOK: 'https://discord.com/api/webhooks/1466180407790670115/_B0VJ0h6v8rGGv0evpBQJUfchddXCJOWGyKQxffiUydN9gk-tBlQwskfVQhqspaTt-fg',
  TARGET: 1500,
  REFERER: 'https://exclusivematch.netlify.app/' 
};

let currentKeyIndex = 0;
let totalHits = 0;

const VANGUARD_JS = `
  (async () => {
    const sleep = ms => new Promise(r => setTimeout(r, ms));
    const start = Date.now();
    
    Object.defineProperty(navigator, 'webdriver', {get: () => false});

    // 🛡️ STEP 1: DEEP WAIT
    // Gives Canadian rotators/Cloudflare time to load the actual page
    await sleep(8000); 

    // 🛡️ STEP 2: THE WINDOW SHOPPER (Pure Browsing)
    const windowShop = async () => {
      // 6 to 10 random scroll actions
      const totalActions = Math.floor(Math.random() * 5) + 6; 
      
      for(let i=0; i < totalActions; i++) {
        // Random scroll amount: Mostly down, occasionally a little up
        const moveAmount = Math.floor(Math.random() * 450) - 80; 
        window.scrollBy({ top: moveAmount, behavior: 'smooth' });
        
        // Human-like pause between looking at sections
        await sleep(Math.floor(Math.random() * 4000) + 2000);
      }
    };

    await windowShop();

    // 🛡️ STEP 3: FINAL DWELL (Long session to fire all pixels)
    // Stay on site for 70-110 seconds total
    const totalSession = Math.floor(Math.random() * 40000) + 70000; 
    const elapsed = Date.now() - start;
    if (totalSession > elapsed) await sleep(totalSession - elapsed);
  })();
`;

async function fireAgent(id) {
  if (totalHits >= CONFIG.TARGET) {
    console.log("🏁 MISSION COMPLETE: 1,500 HITS.");
    process.exit();
  }
  
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
        keep_headers: 'true', 
        device_type: Math.random() > 0.4 ? 'mobile' : 'desktop',
        js_instructions: VANGUARD_JS,
        session_number: Math.floor(Math.random() * 999999999)
      },
      headers: {
        'Referer': CONFIG.REFERER 
      },
      timeout: 210000 
    });

    totalHits++;
    const duration = Math.round((Date.now() - startTime) / 1000);
    await reportToDiscord(id, duration, totalHits);
    
  } catch (e) {
    const status = e.response?.status;
    console.log(`[T${id}] Key Error: Status ${status || e.message}`);
    
    if (status === 401 || status === 403 || status === 429) {
      currentKeyIndex = (currentKeyIndex + 1) % SCRAPER_KEYS.length;
    }
    await new Promise(r => setTimeout(r, 15000));
  }
}

async function reportToDiscord(id, time, total) {
  const payload = {
    embeds: [{
      title: "🇨🇦 CANADA WINDOW SHOPPER: HIT",
      color: 0xff0000, 
      fields: [
        { name: "Agent", value: `Thread-${id}`, inline: true },
        { name: "Progress", value: `**${total} / ${CONFIG.TARGET}**`, inline: true }
      ],
      footer: { text: "Activity: Human Browsing & Scrolling" },
      timestamp: new Date()
    }]
  };
  await axios.post(CONFIG.WEBHOOK, payload).catch(() => {});
}

async function worker(id) {
  await new Promise(r => setTimeout(r, Math.random() * 90000));
  
  while (totalHits < CONFIG.TARGET) {
    await fireAgent(id);
    const chillTime = Math.floor(Math.random() * 30000) + 20000; 
    await new Promise(r => setTimeout(r, chillTime));
  }
}

for (let i = 1; i <= 10; i++) {
  console.log(`🚀 Launching Agent ${i} (Canadian Shopper)...`);
  worker(i);
}
