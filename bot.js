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
  // SOURCE: Locked as Microsoft Native Ads Canada 🇨🇦
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

    // 🛡️ STEP 1: DEEP WAIT (Fixes the 122 vs 25 gap)
    // Gives Canadian rotators/Cloudflare 8 seconds to land on the actual chat site
    await sleep(8000); 

    // 🛡️ STEP 2: HUMAN BEHAVIOR (Random Scrolling)
    const humanMove = async () => {
      const scrolls = Math.floor(Math.random() * 4) + 4; // 4-8 scrolls
      for(let i=0; i < scrolls; i++) {
        window.scrollBy({ top: Math.random() * 400 - 100, behavior: 'smooth' });
        await sleep(Math.random() * 3000 + 1500);
      }
    };
    await humanMove();

    // 🛡️ STEP 3: INTERACTION (Looking for the Chat/Enter button)
    const links = Array.from(document.querySelectorAll('a, button, [role="button"]'));
    const cta = links.find(l => l.innerText.match(/Enter|Chat|Join|Continue|Yes|Accept/i)) || links[0];
    
    if (cta) {
      cta.scrollIntoView({ behavior: 'smooth' });
      await sleep(2000);
      cta.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      await sleep(1000);
      cta.click(); 
      console.log('Action Completed');
    }

    // 🛡️ STEP 4: LONG DWELL (Chat site vibe: 60-100 seconds)
    const dwell = Math.floor(Math.random() * 40000) + 60000; 
    const elapsed = Date.now() - start;
    if (dwell > elapsed) await sleep(dwell - elapsed);
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
        device_type: Math.random() > 0.4 ? 'mobile' : 'desktop', // 60% mobile is better for chat sites
        js_instructions: VANGUARD_JS,
        session_number: Math.floor(Math.random() * 99999999)
      },
      headers: {
        'Referer': CONFIG.REFERER 
      },
      timeout: 210000 // Increased timeout to handle the longer JS execution
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
      title: "🇨🇦 CANADA CHAT MISSION: HIT",
      color: 0xff0000, 
      fields: [
        { name: "Agent", value: `Thread-${id}`, inline: true },
        { name: "Progress", value: `**${total} / ${CONFIG.TARGET}**`, inline: true }
      ],
      footer: { text: "Simulating Human Chat Users" },
      timestamp: new Date()
    }]
  };
  await axios.post(CONFIG.WEBHOOK, payload).catch(() => {});
}

async function worker(id) {
  // Staggered launch to avoid bursts
  await new Promise(r => setTimeout(r, Math.random() * 90000));
  
  while (totalHits < CONFIG.TARGET) {
    await fireAgent(id);
    // Natural jitter between hits
    const chillTime = Math.floor(Math.random() * 40000) + 20000; 
    await new Promise(r => setTimeout(r, chillTime));
  }
}

for (let i = 1; i <= 10; i++) {
  console.log(`🚀 Launching Agent ${i} (Canadian Stealth Mode)...`);
  worker(i);
}
